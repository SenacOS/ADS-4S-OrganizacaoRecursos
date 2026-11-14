'use strict';

// Smoke/E2E opt-in contra Spring + MySQL próprios, sem interceptação de API.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium, request, expect } = require('@playwright/test');
const { repo, dir, ferramentas, comandos, credenciais, estado, sql, pronto } = require('./controle.cjs');

const run = new Date().toISOString().replaceAll(/[:.]/g, '-');
const sufixo = crypto.randomBytes(5).toString('hex');
const pasta = path.join(dir, 'resultados', run);
fs.mkdirSync(pasta, { recursive: true });
const relatorio = {
  inicio: new Date().toISOString(), baseURL: estado.baseURL,
  base: comandos.git(['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
  branch: comandos.git(['branch', '--show-current'], { cwd: repo, encoding: 'utf8' }).trim(),
  arvore: 'worktree sem commit; hashes dos arquivos efetivamente usados abaixo',
  ferramentas: { java: ferramentas.jdkVersion, maven: ferramentas.mavenVersion, mysql: ferramentas.mysqlVersion },
  camadas: 'API HTTP real e Chrome headless real; sem route/intercept/mock. SQL somente SELECT para conferir persistência.',
  cenarios: [], hashes: {},
};
for (const arquivo of ['backend/src/main/resources/static/js/administracao-recursos.js',
  'backend/src/main/resources/static/js/datas.js', 'tests/unit/frontend/administracao-recursos.test.js',
  'tests/unit/frontend/recursos-datas.test.js', 'tests/unit/frontend/movimentacoes.test.js',
  'tests/browser/movimentacoes.spec.js', 'tests/e2e-local/controle.cjs',
  'tests/e2e-local/validar.cjs', 'tests/e2e-local/executaveis.cjs', 'tests/e2e-local/configuracao-local.cjs', 'backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar']) {
  relatorio.hashes[arquivo] = crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, arquivo))).digest('hex');
}
const salvar = () => fs.writeFileSync(path.join(pasta, 'resultados.json'), JSON.stringify(relatorio, null, 2) + '\n');
const segredos = Object.values(credenciais).flatMap((v) => typeof v === 'object' ? Object.values(v) : [v])
  .filter((v) => typeof v === 'string' && v.length >= 20);
const sanitizar = (msg) => segredos.reduce((s, segredo) => s.replaceAll(segredo, '[REMOVIDO]'), String(msg));
async function cenario(nome, camada, tarefa) {
  const registro = { nome, camada, inicio: new Date().toISOString() };
  relatorio.emExecucao = nome; salvar();
  try { registro.evidencia = await tarefa(); registro.estado = 'PASS'; }
  catch (e) { registro.estado = 'FAIL'; registro.erro = sanitizar(e.message); }
  delete relatorio.emExecucao; relatorio.cenarios.push(registro); salvar(); console.log(`${registro.estado} ${nome}`);
  return registro.estado === 'PASS';
}
function bloqueado(nome, motivo) { relatorio.cenarios.push({ nome, estado: 'BLOQUEADO', motivo }); salvar(); }
const baseURL = estado.baseURL;
const contextos = [];
const paginas = {};
const apis = {};
const ids = {};
async function apiNova() {
  const api = await request.newContext({ baseURL }); contextos.push(api); return api;
}
async function escrever(api, metodo, rota, dados, form = false) {
  const r = await api.get('/api/auth/csrf'); assert.equal(r.status(), 200, 'GET CSRF');
  const csrf = await r.json(); assert(csrf.token && csrf.header, 'Contrato CSRF');
  return api.fetch(rota, { method: metodo,
    headers: { [csrf.header]: csrf.token, 'X-Correlation-Id': `e2e-${sufixo}` },
    ...(dados === undefined ? {} : form ? { form: dados } : { data: dados }),
  });
}
async function status(r, esperado) { assert.equal(r.status(), esperado, `${r.request ? r.request().method() : 'HTTP'} ${new URL(r.url()).pathname}`); }
async function loginApi(api, usuario, papel) {
  await status(await escrever(api, 'POST', '/api/auth/login', { email: usuario.email, senha: usuario.password }, true), 204);
  const r = await api.get('/api/auth/me'); await status(r, 200); const me = await r.json();
  assert.equal(me.papel, papel); assert.equal(me.email, usuario.email); return me;
}
function localSp(date) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const p = Object.fromEntries(partes.map((v) => [v.type, v.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
const inicio = new Date(Math.floor(Date.now() / 60000) * 60000 - 120000);
const fim = new Date(inicio.getTime() + 45 * 60000);
const periodo = { inicio: inicio.toISOString(), fim: fim.toISOString() };
assert.equal(localSp(inicio).slice(0, 10), localSp(fim).slice(0, 10), 'Execute longe da virada do dia em São Paulo.');
const captura = (page, nome) => page.screenshot({ path: path.join(pasta, nome + '.png'), fullPage: true });
const resposta = (page, metodo, rota) => page.waitForResponse((r) => r.request().method() === metodo && new URL(r.url()).pathname === rota);

async function executar() {
  await pronto();
  await cenario('Flyway e identidade da base isolada', 'SQL real', async () => {
    const linhas = sql('SELECT version,description,success FROM flyway_schema_history ORDER BY installed_rank').split(/\r?\n/);
    assert.equal(linhas.length, 7); assert(linhas.every((l) => l.endsWith('\t1')));
    return { migracoes: linhas, banco: estado.database, porta: estado.mysqlPort };
  });
  const anonima = await apiNova();
  const fontes = await cenario('Arquivos servidos pelo JAR correspondem à fonte testada', 'HTTP real + SHA256', async () => {
    const hashes = {};
    for (const nome of ['datas.js', 'administracao-recursos.js']) {
      const r = await anonima.get(`/js/${nome}`); await status(r, 200);
      hashes[nome] = crypto.createHash('sha256').update(await r.body()).digest('hex');
      assert.equal(hashes[nome], relatorio.hashes[`backend/src/main/resources/static/js/${nome}`], 'JAR/fonte divergentes');
    }
    return hashes;
  });
  if (!fontes) throw new Error('O backend não está servindo os arquivos desta árvore. Reempacote e reinicie.');
  await cenario('Sem sessão retorna 401 NAO_AUTENTICADO', 'HTTP real', async () => {
    const r = await anonima.get('/api/auth/me'); await status(r, 401);
    const e = await r.json(); assert.equal(e.codigo, 'NAO_AUTENTICADO'); assert(e.correlationId);
    return { status: 401, codigo: e.codigo };
  });
  const admin = apis.admin = await apiNova();
  const usuarios = await cenario('Bootstrap local e cadastro dos outros dois perfis', 'HTTP real', async () => {
    const me = await loginApi(admin, credenciais.admin, 'ADMINISTRADOR'); ids.admin = me.usuarioId;
    for (const [chave, papel] of [['solicitante', 'SOLICITANTE'], ['responsavel', 'RESPONSAVEL']]) {
      const r = await escrever(admin, 'POST', '/api/usuarios', { nome: `Teste E2E ${papel}`, email: credenciais[chave].email, senha: credenciais[chave].password, perfil: papel });
      assert([201, 409].includes(r.status()), 'Cadastro do usuário fictício');
      const api = apis[chave] = await apiNova(); const u = await loginApi(api, credenciais[chave], papel); ids[chave] = u.usuarioId;
    }
    return { perfis: ['ADMINISTRADOR', 'SOLICITANTE', 'RESPONSAVEL'], usuariosIds: { ...ids } };
  });
  if (!usuarios) throw new Error('Não foi possível preparar os três perfis reais.');
  await cenario('CSRF real e escritas proibidas por perfil', 'HTTP real', async () => {
    const sem = await admin.post('/api/recursos', { data: {} }); await status(sem, 403);
    assert.equal((await sem.json()).codigo, 'OPERACAO_NAO_PERMITIDA');
    const negado = await escrever(apis.solicitante, 'POST', '/api/recursos', {}); await status(negado, 403);
    const retir = await escrever(admin, 'POST', '/api/movimentacoes/retiradas', { reservaId: 1, recursoId: 1 }); await status(retir, 403);
    return { semCsrf: 403, solicitanteCadastrandoRecurso: 403, administradorRetirando: 403 };
  });
  const setup = await cenario('Expediente e recursos exclusivos da rodada', 'HTTP real; preparação', async () => {
    const janelas = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map((dia) => ({ dia, inicio: '00:00:00', fim: '23:59:59.999999' }));
    await status(await escrever(admin, 'PUT', '/api/horarios-funcionamento', { janelas }), 200);
    for (const [chave, restrito] of [['material', false], ['restrito', true]]) {
      const dados = { tipo: 'MATERIAL', codigo: `E2E-${chave}-${sufixo}`, ativo: true, restrito,
        patrimonio: `PAT-${chave}-${sufixo}`, descricao: `Material E2E ${chave}`, condicao: 'BOM' };
      const r = await escrever(admin, 'POST', '/api/recursos', dados); await status(r, 201);
      ids[chave] = (await r.json()).id;
    }
    return { material: ids.material, restrito: ids.restrito, janelas: 7 };
  });
  if (!setup) throw new Error('Falha na preparação dos dados reais.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  relatorio.ferramentas.chrome = browser.version();
  const errosJS = [];
  try {
    await cenario('Login e cookie HttpOnly nos três perfis', 'Chrome + HTTP reais', async () => {
      for (const chave of ['admin', 'solicitante', 'responsavel']) {
        const ctx = await browser.newContext({ baseURL, timezoneId: 'America/Sao_Paulo', viewport: { width: 1440, height: 1000 } });
        const page = paginas[chave] = await ctx.newPage(); page.setDefaultTimeout(10000); page.setDefaultNavigationTimeout(15000);
        page.on('pageerror', (e) => errosJS.push(e.message));
        await page.goto('/login.html');
        await page.getByLabel('E-mail', { exact: true }).fill(credenciais[chave].email);
        await page.getByLabel('Senha', { exact: true }).fill(credenciais[chave].password);
        await page.getByRole('button', { name: 'Entrar', exact: true }).click();
        await expect(page).toHaveURL(/\/index.html$/); await expect(page.locator('#usuario-email')).toHaveText(credenciais[chave].email);
        const cookie = (await ctx.cookies()).find((c) => c.name === 'JSESSIONID'); assert(cookie && cookie.httpOnly); assert.equal(cookie.sameSite, 'Lax');
      }
      return { perfis: 3, cookie: { nome: 'JSESSIONID', httpOnly: true, sameSite: 'Lax', ambiente: 'HTTP loopback' } };
    });
    const page = paginas.admin;
    const cadastro = await cenario('Cadastro dos três tipos e edição de competências', 'Chrome + HTTP + MySQL reais', async () => {
      await page.goto('/pages/gestao-recursos.html'); await expect(page.locator('#painel')).toBeVisible();
      for (const tipo of ['SALA', 'PROFESSOR', 'MATERIAL']) {
        await page.locator('#novo-recurso').click(); await page.locator('#cad-tipo').selectOption(tipo);
        await page.locator('#cad-codigo').fill(`UI-${tipo}-${sufixo}`);
        if (tipo === 'SALA') { await page.locator('#cad-capacidade').fill('30'); await page.locator('#cad-localizacao').fill(`Bloco E2E ${sufixo}`); await page.locator('#cad-tipoSala').fill('Laboratorio'); }
        if (tipo === 'PROFESSOR') { await page.locator('#cad-nome').fill(`Docente E2E ${sufixo}`); await page.locator('#cad-competencias').fill('Java\nBanco de Dados\nJava'); }
        if (tipo === 'MATERIAL') { await page.locator('#cad-patrimonio').fill(`UI-PAT-${sufixo}`); await page.locator('#cad-descricao').fill('Material cadastrado no Chrome'); await page.locator('#cad-condicao').fill('BOM'); }
        const esperar = resposta(page, 'POST', '/api/recursos'); await page.locator('#salvar-recurso').click();
        const r = await esperar; await status(r, 201); const novo = await r.json(); ids[tipo] = novo.id;
        await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo');
        if (tipo === 'PROFESSOR') {
          await expect(page.locator('#cad-nome')).toHaveValue(`Docente E2E ${sufixo}`);
          await page.locator('#cad-competencias').fill('JAVA\nTecnologia 2\nTecnologia 10\nBanco de Dados');
          const editar = resposta(page, 'PUT', `/api/recursos/${novo.id}`); await page.locator('#salvar-recurso').click(); await status(await editar, 200);
          await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo');
        }
      }
      return { sala: ids.SALA, docente: ids.PROFESSOR, material: ids.MATERIAL };
    });
    if (cadastro) {
      await cenario('Expediente completo salvo sem perda de frações', 'Chrome + HTTP reais', async () => {
        await expect(page.locator('#form-expediente')).toBeVisible(); await page.locator('#confirmar-expediente').check();
        const esperar = resposta(page, 'PUT', '/api/horarios-funcionamento'); await page.getByRole('button', { name: 'Salvar expediente', exact: true }).click();
        const r = await esperar; await status(r, 200); const e = await r.json(); assert.equal(e.janelas.length, 7);
        assert(e.janelas.every((j) => j.fim === '23:59:59.999999')); await expect(page.locator('#feedback-expediente')).toContainText('Expediente');
        return { janelas: 7, fim: '23:59:59.999999' };
      });
      await cenario('Criar/cancelar bloqueio e desativar sala', 'Chrome + HTTP reais', async () => {
        await page.locator('#filtro-tipo').selectOption('SALA'); await page.locator('#filtro-local').fill(`Bloco E2E ${sufixo}`);
        await page.getByRole('button', { name: 'Consultar cadastros', exact: true }).click();
        await page.getByRole('button', { name: `Gerenciar UI-SALA-${sufixo}`, exact: true }).click();
        await expect(page.locator('#cad-codigo')).toHaveValue(`UI-SALA-${sufixo}`);
        const amanha = new Date(inicio.getTime() + 86400000);
        await page.locator('#bloqueio-inicio').fill(localSp(amanha)); await page.locator('#bloqueio-fim').fill(localSp(new Date(amanha.getTime() + 3600000)));
        await page.locator('#bloqueio-motivo').fill('Manutencao E2E isolada');
        const criar = resposta(page, 'POST', `/api/recursos/${ids.SALA}/bloqueios`); await page.getByRole('button', { name: 'Criar bloqueio', exact: true }).click();
        const r = await criar; await status(r, 201); ids.bloqueio = (await r.json()).id;
        await page.getByRole('button', { name: `Cancelar bloqueio #${ids.bloqueio}`, exact: true }).click(); await page.locator('#confirmar-cancelamento').check();
        const cancelar = resposta(page, 'POST', `/api/bloqueios/${ids.bloqueio}/cancelamento`); await page.getByRole('button', { name: 'Confirmar cancelamento', exact: true }).click(); await status(await cancelar, 200);
        await expect(page.locator('#feedback-bloqueios')).toContainText('Cancelamento confirmado');
        await page.locator('#confirmar-desativacao').check(); const desativar = resposta(page, 'DELETE', `/api/recursos/${ids.SALA}`); await page.locator('#desativar-recurso').click(); await status(await desativar, 204);
        return { bloqueio: ids.bloqueio, status: 'CANCELADO', salaDesativada: ids.SALA };
      });
    }
    const sol = paginas.solicitante;
    const reserva = await cenario('Pesquisar e criar reserva comum com offset de São Paulo', 'Chrome + HTTP reais', async () => {
      await sol.goto('/pages/reservas.html'); await expect(sol.locator('#painel')).toBeVisible();
      await sol.locator('#inicio').fill(localSp(inicio)); await sol.locator('#fim').fill(localSp(fim));
      await sol.locator('#patrimonio').fill(`PAT-material-${sufixo}`); await sol.locator('#pesquisar').click();
      const checkbox = sol.getByRole('checkbox', { name: `Selecionar Material E2E material · PAT-material-${sufixo}`, exact: true }); await checkbox.check();
      const criar = resposta(sol, 'POST', '/api/reservas'); await sol.locator('#criar-reserva').click(); const r = await criar; await status(r, 201);
      const nova = await r.json(); ids.reserva = nova.id; assert.equal(nova.status, 'APROVADA'); assert(nova.inicio.endsWith('-03:00')); assert.equal(nova.solicitanteId, ids.solicitante);
      await expect(sol.locator('#confirmacao')).toBeVisible(); await expect(sol.locator('#detalhes-confirmacao')).toContainText('APROVADA'); await captura(sol, 'reserva-comum');
      return { id: nova.id, status: nova.status, inicio: nova.inicio, fim: nova.fim, recursosIds: nova.recursosIds };
    });
    await cenario('Reserva restrita, conflito e PATCH/cancelamento conhecidos por ID', 'HTTP real; não é tela de edição', async () => {
      const r = await escrever(apis.solicitante, 'POST', '/api/reservas', { ...periodo, recursosIds: [ids.restrito] }); await status(r, 201);
      const restrita = await r.json(); ids.reservaRestrita = restrita.id; assert.equal(restrita.status, 'SOLICITADA');
      const editar = await escrever(apis.solicitante, 'PATCH', `/api/reservas/${restrita.id}`, { ...periodo, recursosIds: [ids.restrito] }); await status(editar, 200);
      await status(await escrever(apis.solicitante, 'POST', `/api/reservas/${restrita.id}/cancelamento`), 200);
      if (reserva) { const conflito = await escrever(apis.solicitante, 'POST', '/api/reservas', { ...periodo, recursosIds: [ids.material] }); await status(conflito, 409); assert.equal((await conflito.json()).codigo, 'RECURSO_INDISPONIVEL'); }
      return { restrita: restrita.id, criacao: 'SOLICITADA', patch: 200, cancelamento: 200, conflito: reserva ? 409 : 'não exercitado' };
    });
    if (reserva) {
      await cenario('Retirada e devolução pelo Responsável', 'Chrome + HTTP reais', async () => {
        const resp = paginas.responsavel; await resp.goto('/pages/movimentacoes.html'); await expect(resp.locator('#painel')).toBeVisible();
        await resp.locator('#numero-reserva').fill(String(ids.reserva)); await resp.locator('#patrimonio-material').fill(`PAT-material-${sufixo}`);
        await resp.getByRole('button', { name: 'Pesquisar materiais', exact: true }).click();
        await resp.getByRole('button', { name: `Escolher Material E2E material · PAT-material-${sufixo}`, exact: true }).click();
        await resp.locator('#confirmar-retirada').check(); const retirar = resposta(resp, 'POST', '/api/movimentacoes/retiradas');
        await resp.getByRole('button', { name: 'Confirmar retirada', exact: true }).click(); const r = await retirar; await status(r, 201); ids.movimentacao = (await r.json()).id;
        await expect(resp.locator('#confirmacao-retirada')).toBeVisible(); await captura(resp, 'retirada-real');
        await resp.getByRole('button', { name: `Devolver movimentação #${ids.movimentacao}`, exact: true }).click(); await resp.locator('#confirmar-devolucao').check();
        const devolver = resposta(resp, 'POST', `/api/movimentacoes/${ids.movimentacao}/devolucao`); await resp.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
        const d = await devolver; await status(d, 200); const devolvida = await d.json(); assert(devolvida.devolvidoEm); assert.equal(devolvida.devolvidoPor, ids.responsavel);
        await expect(resp.locator('#confirmacao-devolucao')).toBeVisible(); await captura(resp, 'devolucao-real');
        return { movimentacao: ids.movimentacao, reserva: ids.reserva, devolvidoPor: devolvida.devolvidoPor, atrasoSegundos: devolvida.atrasoSegundos };
      });
    } else bloqueado('Retirada/devolução', 'Criação comum real não passou; não inventar ID de reserva.');
    await cenario('Leituras de reservas disponíveis após PR26', 'HTTP real; própria reserva e escopo vazio', async () => {
      assert(ids.reserva, 'Criação comum precisa passar antes da leitura');
      const detalhe = await apis.solicitante.get(`/api/reservas/${ids.reserva}`); await status(detalhe, 200);
      const d = await detalhe.json(); assert.equal(d.id, ids.reserva); assert.equal(d.solicitanteId, ids.solicitante);
      const lista = await apis.responsavel.get(`/api/reservas?status=SOLICITADA&recursoId=${ids.restrito}&pagina=0&tamanho=20`); await status(lista, 200);
      const fila = await lista.json(); assert.deepEqual(fila.itens, []); assert.equal(fila.total, 0);
      // Página geral coberta separadamente por validar-consulta-reservas.cjs; não atribuir seus cenários a este smoke.
      return { detalhe: 200, propriaReserva: d.id, filaSemVinculo: { status: 200, total: fila.total } };
    });
    await cenario('Logout real dos três perfis e ausência de erros JavaScript', 'Chrome + HTTP reais', async () => {
      for (const page of Object.values(paginas)) {
        await page.goto('/index.html'); await expect(page.locator('#painel')).toBeVisible(); const sair = resposta(page, 'POST', '/api/auth/logout');
        await page.getByRole('button', { name: 'Sair da conta', exact: true }).click(); await status(await sair, 204); await expect(page).toHaveURL(/\/login.html\?sessao=encerrada$/);
        const me = await page.request.get('/api/auth/me'); await status(me, 401);
      }
      assert.deepEqual(errosJS, []); return { logouts: 3, meAposLogout: 401, errosJavaScript: 0 };
    });
  } finally { await browser.close(); }
  await cenario('Persistência, auditoria e outbox real', 'SELECT no MySQL real', async () => {
    const evidencias = {
      recursos: sql(`SELECT tipo,codigo,ativo FROM recursos WHERE codigo LIKE '%${sufixo}' ORDER BY id`),
      reservas: sql(`SELECT id,status,solicitante_id FROM reservas WHERE id IN (${[ids.reserva, ids.reservaRestrita].filter(Number.isInteger).join(',') || '0'}) ORDER BY id`),
      movimentacao: sql(`SELECT id,reserva_id,responsavel_id,devolvido_por,(devolvido_em IS NOT NULL),atraso_segundos FROM movimentacoes WHERE id=${ids.movimentacao || 0}`),
      auditoria: sql(`SELECT entidade,acao,COUNT(*) FROM auditoria WHERE correlacao_id='e2e-${sufixo}' GROUP BY entidade,acao ORDER BY entidade,acao`),
      notificacoes: sql(`SELECT evento,status_envio,COUNT(*) FROM notificacoes WHERE reserva_id IN (${[ids.reserva, ids.reservaRestrita].filter(Number.isInteger).join(',') || '0'}) GROUP BY evento,status_envio ORDER BY evento`),
    };
    assert(evidencias.recursos.includes('MATERIAL')); assert(evidencias.auditoria); assert(evidencias.notificacoes.includes('PENDENTE'));
    if (ids.movimentacao) assert(evidencias.movimentacao.split('\t')[4] === '1', 'Devolução precisa estar persistida.');
    return evidencias;
  });
}

executar().catch((e) => { relatorio.falhaPreparacao = sanitizar(e.message); process.exitCode = 1; })
  .finally(async () => {
    for (const ctx of contextos) await ctx.dispose();
    relatorio.fim = new Date().toISOString();
    relatorio.resumo = Object.fromEntries(['PASS','FAIL','BLOQUEADO'].map((s) => [s, relatorio.cenarios.filter((c) => c.estado === s).length]));
    salvar(); console.log(JSON.stringify({ pasta: path.relative(repo, pasta), resumo: relatorio.resumo }));
    if (relatorio.resumo.FAIL) process.exitCode = 1;
  });
