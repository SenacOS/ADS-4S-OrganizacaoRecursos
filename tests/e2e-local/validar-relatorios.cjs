'use strict';

// Opt-in Windows: API/UI Spring e MySQL reais. Não instala ferramentas nem intercepta respostas.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium, request, expect } = require('@playwright/test');
const { repo, dir, estado, credenciais, comandos, sql, pronto } = require('./controle.cjs');
const { projetarRelatorio } = require('./evidencias.cjs');

const rota = '/api/reservas/relatorio-utilizacao';
const pasta = path.join(dir, 'relatorios', new Date().toISOString().replaceAll(/[:.]/g, '-'));
fs.mkdirSync(pasta, { recursive: true });
const git = (...args) => comandos.git(args, { cwd: repo, encoding: 'utf8' }).trim();
const hash = arquivo => crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, arquivo))).digest('hex');
const segredos = [credenciais.rootPassword, credenciais.db.password, ...['admin', 'solicitante', 'responsavel'].map(p => credenciais[p].password)];
const sanitizar = texto => segredos.reduce((t, s) => t.replaceAll(s, '[REMOVIDO]'), String(texto));
const nonce = crypto.randomBytes(6).toString('hex');
const resultado = { inicio: new Date().toISOString(), dataLocal: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()), fuso: 'America/Sao_Paulo',
  branch: git('branch', '--show-current'), head: git('rev-parse', 'HEAD'),
  arvore: 'Implementação local sem commit; identificada por inventário de fontes e JAR',
  camada: 'Spring/Chrome/MySQL reais, mesma origem, sem interceptações', cenarios: [], hashes: {}, concluido: false };
const estaticos = ['js/relatorios-utilizacao.js', 'js/relatorios-utilizacao-page.js', 'js/navegacao.js',
  'js/api.js', 'js/auth.js', 'js/datas.js', 'js/forms.js', 'js/sessao-page.js', 'js/ui.js',
  'pages/relatorios-utilizacao.html', 'css/relatorios-utilizacao.css', 'css/app.css'];
for (const nome of estaticos) resultado.hashes['backend/src/main/resources/static/' + nome] = hash('backend/src/main/resources/static/' + nome);
for (const nome of ['tests/e2e-local/validar-relatorios.cjs', 'tests/e2e-local/controle.cjs',
  'tests/e2e-local/executaveis.cjs', 'tests/e2e-local/evidencias.cjs', 'tests/e2e-local/configuracao-local.cjs',
  'backend/src/main/java/br/senac/recursos/reserva/api/RelatorioUtilizacaoController.java',
  'backend/src/main/java/br/senac/recursos/reserva/api/RelatorioUtilizacaoResponse.java',
  'backend/src/main/java/br/senac/recursos/reserva/aplicacao/ConsultarRelatorioUtilizacao.java',
  'backend/src/main/java/br/senac/recursos/reserva/infraestrutura/ReservaRelatorioMysql.java',
  'backend/src/main/java/br/senac/recursos/reserva/infraestrutura/RelatorioUtilizacaoTransacional.java',
  'backend/src/main/java/br/senac/recursos/config/Item18Config.java',
  'backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar']) resultado.hashes[nome] = hash(nome);
const salvar = () => fs.writeFileSync(path.join(pasta, 'resultados.json'), JSON.stringify(projetarRelatorio(resultado), null, 2) + '\n');
const contextos = [];
let browser;
async function caso(nome, camada, executar) {
  try { resultado.cenarios.push({ nome, camada, estado: 'PASS', evidencia: await executar() }); console.log('PASS ' + nome); }
  catch (erro) { resultado.cenarios.push({ nome, camada, estado: 'FAIL', erro: sanitizar(erro.message) }); salvar(); throw new Error('Falha no cenário: ' + nome); }
  salvar();
}
async function conferir(resposta, status) { assert.equal(resposta.status(), status, new URL(resposta.url()).pathname); return resposta; }
async function nova() { const ctx = await request.newContext({ baseURL: estado.baseURL, timeout: 15000 }); contextos.push(ctx); return ctx; }
async function escrever(ctx, method, url, data, form = false) {
  const csrf = await (await conferir(await ctx.get('/api/auth/csrf'), 200)).json();
  return ctx.fetch(url, { method, headers: { [csrf.header]: csrf.token, 'X-Correlation-Id': 'rf12-' + nonce },
    ...(data === undefined ? {} : form ? { form: data } : { data }) });
}
async function entrar(ctx, conta) {
  await conferir(await escrever(ctx, 'POST', '/api/auth/login', { email: conta.email, senha: conta.password }, true), 204);
  return (await conferir(await ctx.get('/api/auth/me'), 200)).json();
}
function url(filtros) { return rota + '?' + new URLSearchParams(filtros); }
const iso = instante => new Date(instante).toISOString();
const banco = instante => iso(instante).replace('T', ' ').replace('Z', '');
const id = valor => assert(Number.isSafeInteger(valor) && valor > 0, 'ID da massa inválido.');
const snapshot = () => sql('SELECT (SELECT COUNT(*) FROM reservas),(SELECT COUNT(*) FROM auditoria),(SELECT COUNT(*) FROM notificacoes),(SELECT COUNT(*) FROM conflitos_evitados)');
function iguais(relatorio, quantidade, minutos, alocacoes) {
  assert.equal(relatorio.reservasConsideradas, quantidade); assert.equal(relatorio.minutosReservados, minutos);
  assert.deepEqual(relatorio.porRecurso.map(r => [r.recursoId, r.minutos]).sort((a, b) => a[0] - b[0]), alocacoes.slice().sort((a, b) => a[0] - b[0]));
}
async function periodoNovo(admin, paraIsoOperacional) {
  const expediente = await (await conferir(await admin.get('/api/horarios-funcionamento'), 200)).json();
  assert.equal(expediente.zona, 'America/Sao_Paulo');
  const segundos = hora => { const [h, m, s = '0'] = hora.split(':'); return Number(h) * 3600 + Number(m) * 60 + Number(s); };
  for (let dia = 21; dia < 43; dia++) {
    const instante = new Date(Date.now() + dia * 86400000);
    const data = new Intl.DateTimeFormat('en-CA', { timeZone: expediente.zona }).format(instante);
    const semana = new Intl.DateTimeFormat('en-US', { timeZone: expediente.zona, weekday: 'long' }).format(instante).toUpperCase();
    for (const janela of expediente.janelas.filter(j => j.dia === semana)) {
      const inicio = Math.ceil(segundos(janela.inicio) / 60) * 60;
      if (inicio + 7200 > segundos(janela.fim) || inicio + 7200 >= 86400) continue;
      const hora = s => String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s % 3600 / 60)).padStart(2, '0');
      const a = paraIsoOperacional(data + 'T' + hora(inicio)), b = paraIsoOperacional(data + 'T' + hora(inicio + 7200));
      // Janela global vazia antes da massa: os totais sem filtro não dependem de dados anteriores.
      if (sql(`SELECT COUNT(*) FROM reservas WHERE inicio_utc<'${banco(b)}' AND fim_utc>'${banco(a)}'`) === '0') return { inicio: a, fim: b };
    }
  }
  throw new Error('Não há janela futura de duas horas sem reservas anteriores; nenhum dado foi apagado ou horário sobrescrito.');
}
async function executar() {
  await pronto();
  const { conferirUtilizacao } = await import(pathToFileURL(path.join(repo, 'backend/src/main/resources/static/js/relatorios-utilizacao.js')).href);
  const { paraIsoOperacional } = await import(pathToFileURL(path.join(repo, 'backend/src/main/resources/static/js/datas.js')).href);
  const admin = await nova(), sol = await nova(), resp = await nova(), anonimo = await nova();
  assert.equal((await entrar(admin, credenciais.admin)).papel, 'ADMINISTRADOR');
  assert.equal((await entrar(sol, credenciais.solicitante)).papel, 'SOLICITANTE');
  assert.equal((await entrar(resp, credenciais.responsavel)).papel, 'RESPONSAVEL');
  const periodo = await periodoNovo(admin, paraIsoOperacional), a = Date.parse(periodo.inicio);
  async function consultar(filtros) {
    const dados = await (await conferir(await admin.get(url(filtros)), 200)).json();
    return conferirUtilizacao(dados, { inicio: filtros.inicio, fim: filtros.fim,
      ...(filtros.recursoId === undefined ? {} : { recursoId: Number(filtros.recursoId) }) });
  }
  await caso('Fontes servidas, JAR e migrações identificam a árvore testada', 'HTTP + SHA256 + SQL', async () => {
    assert.equal(sql('SELECT COUNT(*) FROM flyway_schema_history WHERE success=1'), '7');
    for (const nome of estaticos) {
      const r = await conferir(await admin.get('/' + nome), 200);
      assert.equal(crypto.createHash('sha256').update(await r.body()).digest('hex'), resultado.hashes['backend/src/main/resources/static/' + nome], nome);
    }
    return { fontesServidas: estaticos.length, hashes: 'MATCH', migracoes: 7, baseURL: estado.baseURL };
  });
  await caso('HTTP exige sessão e Administrador; identidade forjada não eleva perfil', 'HTTP real', async () => {
    const semSessao = await (await conferir(await anonimo.get(url(periodo)), 401)).json(); assert.equal(semSessao.codigo, 'NAO_AUTENTICADO');
    for (const ctx of [sol, resp]) {
      const erro = await (await conferir(await ctx.get(url({ ...periodo, papel: 'ADMINISTRADOR', usuarioId: '1' })), 403)).json();
      assert.equal(erro.codigo, 'OPERACAO_NAO_PERMITIDA'); assert(erro.correlationId);
    }
    return { semSessao: 401, solicitante: 403, responsavel: 403, identidade: 'Somente sessão do servidor' };
  });
  await caso('Parâmetros inválidos retornam envelope 400 sem alterar persistência', 'HTTP + SQL', async () => {
    const antes = snapshot();
    const invalidos = [{}, { inicio: periodo.inicio }, { fim: periodo.fim }, { ...periodo, fim: periodo.inicio },
      { ...periodo, inicio: 'invalido' }, { ...periodo, inicio: '2026-11-17T10:00:00' },
      ...['0', '-1', '1.5'].map(recursoId => ({ ...periodo, recursoId })), { ...periodo, estados: 'DESCONHECIDO' }];
    for (const filtros of invalidos) {
      const erro = await (await conferir(await admin.get(url(filtros)), 400)).json();
      assert.equal(erro.codigo, 'REQUISICAO_INVALIDA'); assert(erro.mensagem && erro.correlationId);
    }
    assert.equal(snapshot(), antes); return { casos: invalidos.length, http: 400, envelope: 'MATCH', persistenciaPreservada: true };
  });
  const recursos = {};
  for (const letra of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
    const codigo = `RF12-${nonce}-${letra}`;
    const r = await (await conferir(await escrever(admin, 'POST', '/api/recursos', { tipo: 'MATERIAL', codigo, patrimonio: codigo,
      descricao: 'Material relatório ' + letra, condicao: 'BOM', ativo: true, restrito: false }), 201)).json();
    id(r.id); assert.equal(r.dados.codigo, codigo); recursos[letra] = r.id;
    assert.equal(sql(`SELECT COUNT(*) FROM recursos WHERE id=${r.id} AND codigo='${codigo}'`), '1');
  }
  async function reservar(inicio, fim, recursosIds) {
    const r = await (await conferir(await escrever(sol, 'POST', '/api/reservas', { inicio: iso(inicio), fim: iso(fim), recursosIds }), 201)).json();
    id(r.id); assert.equal(r.status, 'APROVADA'); assert.deepEqual(r.recursosIds, recursosIds); return r;
  }
  const principal = await reservar(a, a + 3600000, [recursos.A, recursos.B, recursos.C]);
  const curtaD = await reservar(a + 3600000, a + 3659000, [recursos.D]);
  const curtaE = await reservar(a + 3660000, a + 3719000, [recursos.E]);
  const cancelada = await reservar(a, a + 3600000, [recursos.F]);
  await conferir(await escrever(admin, 'POST', `/api/reservas/${cancelada.id}/cancelamento`, { motivo: 'Reserva exclusiva para validar filtro de estados do RF12.' }), 200);
  await conferir(await escrever(sol, 'POST', '/api/reservas', { inicio: iso(a), fim: iso(a + 3600000), recursosIds: [recursos.A] }), 409);
  const linhasConflito = sql(`SELECT id,DATE_FORMAT(momento,'%Y-%m-%dT%H:%i:%s.%fZ') FROM conflitos_evitados WHERE recurso_id=${recursos.A}`).split('\n');
  assert.equal(linhasConflito.length, 1); const [conflitoId, momento] = linhasConflito[0].split('\t'); id(Number(conflitoId));
  const momentoMs = Date.parse(momento);
  const periodoEvento = { inicio: iso(momentoMs - 60000), fim: iso(momentoMs + 60000), recursoId: recursos.A };
  resultado.massa = { recursos, reservas: [principal.id, curtaD.id, curtaE.id, cancelada.id], periodo,
    conflito: { id: Number(conflitoId), momento, intervaloTentado: { inicio: iso(a), fim: iso(a + 3600000) } } };
  const depoisDaMassa = snapshot();
  await caso('Total por reserva é distinto da soma das alocações e corresponde à massa SQL', 'HTTP + SQL', async () => {
    const duracoes = sql(`SELECT COUNT(*),SUM(TIMESTAMPDIFF(MICROSECOND,inicio_utc,fim_utc)) FROM reservas WHERE id IN (${principal.id},${curtaD.id},${curtaE.id}) AND status='APROVADA'`).split('\t');
    assert.deepEqual(duracoes, ['3', '3718000000']);
    const r = await consultar(periodo);
    iguais(r, 3, 61, [[recursos.A, 60], [recursos.B, 60], [recursos.C, 60], [recursos.D, 0], [recursos.E, 0]]);
    assert.deepEqual(r.porStatus, [{ status: 'APROVADA', minutos: 61 }]);
    return { reservas: 3, microssegundosSQL: duracoes[1], minutosTotal: 61, somaAlocacoes: 180, truncamentoIndependente: true };
  });
  await caso('Filtro seleciona a reserva e mantém os três recursos vinculados', 'HTTP + SQL', async () => {
    assert.equal(sql(`SELECT COUNT(*) FROM reserva_recursos WHERE reserva_id=${principal.id}`), '3');
    const r = await consultar({ ...periodo, recursoId: recursos.A });
    iguais(r, 1, 60, [recursos.A, recursos.B, recursos.C].map(id => [id, 60]));
    return { filtro: recursos.A, reservas: 1, minutos: 60, recursos: r.porRecurso.map(l => l.recursoId), somaAlocacoes: 180 };
  });
  await caso('Período recorta a duração e exclui reserva que termina exatamente no início', 'HTTP real', async () => {
    const r = await consultar({ inicio: iso(a + 1800000), fim: iso(a + 2700000), recursoId: recursos.A });
    iguais(r, 1, 15, [recursos.A, recursos.B, recursos.C].map(id => [id, 15]));
    iguais(await consultar({ inicio: iso(a + 3600000), fim: iso(a + 3660000), recursoId: recursos.A }), 0, 0, []);
    return { recorteMinutos: 15, fronteira: 'Fim da reserva excluído', vazio: true };
  });
  await caso('Reservas de 59 segundos conservam contagem com zero minuto e truncamento agregado', 'HTTP real', async () => {
    const r = await consultar({ ...periodo, recursoId: recursos.D }); iguais(r, 1, 0, [[recursos.D, 0]]);
    const curtas = await consultar({ inicio: iso(a + 3600000), fim: iso(a + 3720000) });
    iguais(curtas, 2, 1, [[recursos.D, 0], [recursos.E, 0]]);
    return { umaReserva: { segundos: 59, minutos: 0 }, duasReservas: { segundos: 118, minutos: 1, grupos: [0, 0] } };
  });
  await caso('Estados padrão excluem cancelada; filtro HTTP explícito e vazio são coerentes', 'HTTP real', async () => {
    const r = await consultar({ ...periodo, recursoId: recursos.F }); iguais(r, 0, 0, []);
    const historico = await (await conferir(await admin.get(url({ ...periodo, recursoId: recursos.F, estados: 'CANCELADA' })), 200)).json();
    iguais(historico, 1, 60, [[recursos.F, 60]]); assert.deepEqual(historico.estados, ['CANCELADA']);
    iguais(await consultar({ ...periodo, recursoId: recursos.G }), 0, 0, []);
    return { padraoExcluiCancelada: true, filtroStatusSomenteHTTP: 'CANCELADA', recursoSemReservas: recursos.G };
  });
  await caso('Conflitos usam momento do evento e fronteira semiaberta, sem identidade pessoal', 'HTTP + SQL', async () => {
    const r = await consultar(periodoEvento); iguais(r, 0, 0, []);
    assert.equal(r.conflitosEvitados.length, 1); assert.equal(r.conflitosEvitados[0].id, Number(conflitoId));
    assert.equal(r.conflitosEvitados[0].origem, 'RESERVA'); assert(!Object.hasOwn(r.conflitosEvitados[0], 'solicitanteId'));
    assert.equal((await consultar({ inicio: momento, fim: iso(momentoMs + 60000), recursoId: recursos.A })).conflitosEvitados.length, 1);
    assert.equal((await consultar({ inicio: iso(momentoMs - 60000), fim: momento, recursoId: recursos.A })).conflitosEvitados.length, 0);
    assert.equal((await consultar({ ...periodo, recursoId: recursos.A })).conflitosEvitados.length, 0);
    return { evento: Number(conflitoId), momento, intervaloTentadoForaDoPeriodo: true, inicioIncluido: true, fimExcluido: true, reservas: 0, conflitos: 1 };
  });
  browser = await chromium.launch({ channel: 'chrome', headless: true }); resultado.chrome = browser.version();
  async function pagina(conta, viewport = { width: 1366, height: 900 }) {
    const ctx = await browser.newContext({ baseURL: estado.baseURL, viewport, timezoneId: 'Asia/Tokyo' });
    const page = await ctx.newPage(); page.setDefaultTimeout(10000);
    await page.goto('/login.html'); await page.getByLabel('E-mail', { exact: true }).fill(conta.email);
    await page.getByLabel('Senha', { exact: true }).fill(conta.password); await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/index.html$/); return page;
  }
  await caso('Navegação e URL direta recusam outros perfis sem consultar relatório', 'Chrome + HTTP real', async () => {
    for (const perfil of ['solicitante', 'responsavel']) {
      const page = await pagina(credenciais[perfil]); let consultas = 0;
      page.on('request', r => { if (new URL(r.url()).pathname === rota) consultas++; });
      await expect(page.locator('#navegacao a[href="/pages/relatorios-utilizacao.html"]')).toHaveCount(0);
      await page.goto('/pages/relatorios-utilizacao.html');
      await expect(page.locator('#feedback-inicial')).toContainText('Administradores');
      await expect(page.locator('#painel')).toBeHidden();
      await page.locator('#form-relatorio').evaluate(f => f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
      assert.equal(consultas, 0); await page.close();
    }
    return { perfis: ['SOLICITANTE', 'RESPONSAVEL'], semLink: true, formularioOculto: true, consultas: 0 };
  });
  const local = instante => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(instante)).replace(' ', 'T');
  for (const [nome, viewport] of [['desktop', { width: 1366, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    await caso('Consulta real por menu, total/filtro/zero/conflito e layout — ' + nome, 'Chrome + HTTP real', async () => {
      const page = await pagina(credenciais.admin, viewport), erros = [], chamadas = [];
      page.on('pageerror', e => erros.push(e.message)); page.on('request', r => { if (new URL(r.url()).pathname === rota) chamadas.push(r); });
      await page.locator('#navegacao').getByRole('link', { name: 'Relatórios', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Consultar relatório', exact: true })).toBeEnabled();
      await expect(page.locator('.preview-notice')).toHaveCount(0); assert.equal(chamadas.length, 0);
      async function tela(filtros, quantidade, minutos, conflitos) {
        await page.getByLabel('Início do período', { exact: true }).fill(local(filtros.inicio));
        await page.getByLabel('Fim do período', { exact: true }).fill(local(filtros.fim));
        await page.getByLabel('ID do recurso (opcional)', { exact: true }).fill(filtros.recursoId === undefined ? '' : String(filtros.recursoId));
        const antes = chamadas.length;
        const [resposta] = await Promise.all([page.waitForResponse(r => r.request().method() === 'GET' && new URL(r.url()).pathname === rota),
          page.getByRole('button', { name: 'Consultar relatório', exact: true }).click()]);
        await conferir(resposta, 200); await expect(page.locator('#resultado-relatorio')).toBeVisible();
        await expect(page.locator('#total-reservas-relatorio')).toHaveText(String(quantidade));
        await expect(page.locator('#duracao-reservas-relatorio')).toHaveText(minutos + ' min');
        await expect(page.locator('#conflitos-relatorio')).toHaveText(String(conflitos));
        assert.equal(chamadas.length, antes + 1); assert.equal(chamadas.at(-1).method(), 'GET');
        assert.equal(chamadas.at(-1).headers()['x-csrf-token'], undefined);
      }
      await tela(periodo, 3, 61, 0);
      await tela({ ...periodo, recursoId: recursos.A }, 1, 60, 0);
      await expect(page.locator('#linhas-utilizacao tr')).toHaveCount(3);
      await expect(page.locator('#filtro-recurso-relatorio')).toContainText('outros recursos vinculados');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Overflow horizontal.');
      await page.screenshot({ path: path.join(pasta, nome + '-relatorio.png'), fullPage: true });
      await tela({ ...periodo, recursoId: recursos.D }, 1, 0, 0); await expect(page.locator('#sem-alocacoes')).toBeHidden();
      await tela({ ...periodo, recursoId: recursos.G }, 0, 0, 0); await expect(page.locator('#sem-alocacoes')).toBeVisible();
      await tela(periodoEvento, 0, 0, 1);
      const anterior = chamadas.length;
      await page.getByRole('button', { name: 'Sair da conta', exact: true }).click(); await expect(page).toHaveURL(/login.html\?sessao=encerrada$/);
      await page.goto('/pages/relatorios-utilizacao.html'); await expect(page).toHaveURL(/login.html\?sessao=expirada$/);
      assert.equal(chamadas.length, anterior); assert.deepEqual(erros, []); await page.close();
      return { viewport, navegadorFuso: 'Asia/Tokyo', consultas: anterior, relatorioReal: true, semOverflow: true, errosJS: 0, logout: true };
    });
  }
  await caso('GETs não modificam reservas/trilhas; ambiente e dados anteriores preservados', 'HTTP + SQL + processos próprios', async () => {
    assert.equal(snapshot(), depoisDaMassa); await pronto();
    return { leiturasSemEscrita: true, sql: 'Somente SELECT', dadosDaMassaPreservados: true, ambientePrincipalPronto: true,
      limite: 'Sem certificação de todas as corridas ou de produção; transação/proxy também tem testes Java próprios.' };
  });
  resultado.concluido = true;
}
executar().catch(e => { resultado.erro = sanitizar(e.message); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  for (const ctx of contextos) await ctx.dispose();
  resultado.fim = new Date().toISOString();
  resultado.resumo = { PASS: resultado.cenarios.filter(c => c.estado === 'PASS').length, FAIL: resultado.cenarios.filter(c => c.estado === 'FAIL').length };
  salvar(); console.log(JSON.stringify({ pasta: path.relative(repo, pasta), concluido: resultado.concluido, resumo: resultado.resumo }));
});
