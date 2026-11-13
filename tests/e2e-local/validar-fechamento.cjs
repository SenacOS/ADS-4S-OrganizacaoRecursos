'use strict';

// Complemento E2E opt-in: HTTP, Chrome, relógio e MySQL reais; sem interceptação.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { chromium, request, expect } = require('@playwright/test');
const { repo, dir, estado, ferramentas, comandos, credenciais, pronto, sql } = require('./controle.cjs');
const { iniciarTemporaria } = require('./sessao-temporaria.cjs');
const { projetarRelatorio } = require('./evidencias.cjs');
const { viewportDaPagina } = require('./viewport.cjs');
const pasta = path.join(dir, 'fechamento', new Date().toISOString().replaceAll(/[:.]/g, '-'));
fs.mkdirSync(pasta, { recursive: true });
const nonce = crypto.randomBytes(5).toString('hex');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));
const relatorio = { inicio: new Date().toISOString(), base: comandos.git(['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
  branch: comandos.git(['branch', '--show-current'], { cwd: repo, encoding: 'utf8' }).trim(), arvore: 'correção local dos auxiliares ainda sem commit; produto preservado de 0775715',
  camadas: 'Chrome/HTTP/MySQL/tempo reais; concorrência de criação HTTP+SQL; sem mock, alteração de relógio ou escrita SQL',
  ferramentas: { java: ferramentas.jdkVersion, mysql: ferramentas.mysqlVersion }, cenarios: [], hashes: {} };
const salvar = () => fs.writeFileSync(path.join(pasta, 'resultados.json'), JSON.stringify(projetarRelatorio(relatorio), null, 2) + '\n');
const segredos = [credenciais.rootPassword, credenciais.db.password, ...['admin','solicitante','responsavel'].map(k => credenciais[k].password)].filter(Boolean);
const sanitizar = e => segredos.reduce((s, v) => s.replaceAll(v, '[REMOVIDO]'), String(e));
const apis = [], errosJS = []; let browser, temporaria, timeoutTask;
async function caso(nome, camada, tarefa) {
  const c = { nome, camada, inicio: new Date().toISOString() };
  try { c.evidencia = await tarefa(); c.estado = 'PASS'; }
  catch (e) { c.estado = 'FAIL'; c.erro = sanitizar(e.message); throw e; }
  finally { c.fim = new Date().toISOString(); relatorio.cenarios.push(c); salvar(); console.log(c.estado + ' ' + nome); }
}
async function escrita(a, method, rota, dados, form = false) {
  const token = await a.get('/api/auth/csrf'); assert.equal(token.status(), 200); const c = await token.json();
  return a.fetch(rota, { method, headers: { [c.header]: c.token, 'X-Correlation-Id': 'fechamento-' + nonce },
    ...(dados === undefined ? {} : form ? { form: dados } : { data: dados }) });
}
async function autenticar(a, chave) {
  assert.equal((await escrita(a, 'POST', '/api/auth/login', { email: credenciais[chave].email, senha: credenciais[chave].password }, true)).status(), 204);
}
async function api(chave) { const a = await request.newContext({ baseURL: estado.baseURL }); apis.push(a); await autenticar(a, chave); return a; }
async function pagina(chave, baseURL = estado.baseURL, viewport) {
  const ctx = await browser.newContext({ baseURL, timezoneId: 'America/Sao_Paulo', viewport: viewportDaPagina(viewport) });
  const p = await ctx.newPage(); p.setDefaultTimeout(12000); p.on('pageerror', e => errosJS.push(e.message));
  await p.goto('/login.html');
  if (chave) { await p.getByLabel('E-mail', { exact: true }).fill(credenciais[chave].email); await p.getByLabel('Senha', { exact: true }).fill(credenciais[chave].password);
    await p.getByRole('button', { name: 'Entrar', exact: true }).click(); await expect(p).toHaveURL(/\/index.html$/); await expect(p.locator('#painel')).toBeVisible(); }
  return p;
}
const resposta = (p, metodo, rota) => {
  const espera = p.waitForResponse(r => r.request().method() === metodo && new URL(r.url()).pathname === rota);
  espera.catch(() => {}); // Continua rejeitando no await, mas não interrompe o finally enquanto um clique falha.
  return espera;
};
function localSp(iso) { const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(new Date(iso)).map(v => [v.type,v.value])); return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`; }
function fontes(dirAtual) { return fs.readdirSync(dirAtual, { withFileTypes: true }).flatMap(e => e.isDirectory() ? fontes(path.join(dirAtual,e.name)) : /\.(html|css|js)$/.test(e.name) ? [path.join(dirAtual,e.name)] : []); }
async function conferirFontes(a, nomes) { for (const nome of nomes) { const r = await a.get('/' + nome); assert.equal(r.status(), 200); assert.equal(hash(await r.body()), relatorio.hashes['backend/src/main/resources/static/' + nome], nome); } }

(async () => {
  salvar(); await pronto();
  const raiz = path.join(repo, 'backend/src/main/resources/static');
  const nomes = fontes(raiz).map(p => path.relative(raiz,p).replaceAll('\\','/'));
  for (const nome of nomes) relatorio.hashes['backend/src/main/resources/static/' + nome] = hash(fs.readFileSync(path.join(raiz,nome)));
  for (const nome of ['tests/e2e-local/validar-fechamento.cjs','tests/e2e-local/sessao-temporaria.cjs','tests/e2e-local/controle.cjs','tests/e2e-local/executaveis.cjs','tests/e2e-local/configuracao-local.cjs','tests/e2e-local/evidencias.cjs','tests/e2e-local/viewport.cjs','backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar']) relatorio.hashes[nome] = hash(fs.readFileSync(path.join(repo,nome)));
  const admin = await api('admin'), sol = await api('solicitante'), segunda = await api('solicitante');
  browser = await chromium.launch({ channel: 'chrome', headless: true }); relatorio.ferramentas.chrome = browser.version();
  await caso('Fontes servidas pelo JAR e regressão anterior preservadas', 'HTTP + SHA256', async () => {
    await conferirFontes(admin, nomes); const anterior = JSON.parse(fs.readFileSync(path.join(repo,'docs/testes/marcos-3-consulta-edicao/arvore-testada.json'),'utf8'));
    for (const [p,h] of Object.entries(anterior.hashes)) {
      if (p.startsWith('backend/src/main/resources/static/') || p.startsWith('tests/browser/') || p.startsWith('tests/unit/frontend/')) assert.equal(hash(fs.readFileSync(path.join(repo,p))),h,p);
    }
    return { arquivosServidos: nomes.length, hashes:'MATCH', regressaoAnterior:'81 unitários / 278 navegador; não reexecutada sem alteração da fonte' };
  });
  await caso('Login inválido, CSRF rotacionado e recuperação explícita na interface', 'Chrome + HTTP real', async () => {
    const p = await pagina(null, estado.baseURL, { width:390, height:844 }); const contagem = [];
    p.on('request', r => { if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/auth/login') contagem.push(1); });
    await p.getByLabel('E-mail',{exact:true}).fill(credenciais.solicitante.email); await p.getByLabel('Senha',{exact:true}).fill('credencial-invalida-' + nonce);
    const falha = resposta(p,'POST','/api/auth/login'); await p.getByLabel('Senha',{exact:true}).press('Enter');
    const r = await falha; assert.equal(r.status(),401); const e = await r.json(); assert.equal(e.codigo,'CREDENCIAIS_INVALIDAS');
    await expect(p.locator('#feedback')).toContainText(e.mensagem); await expect(p.locator('#referencia')).toContainText(e.correlationId);
    await expect(p.locator('#form-login')).toBeVisible(); assert.equal(contagem.length,1);
    // Mesmo contexto/cookie: autenticação externa rotaciona o CSRF real, sem adulterar transporte da página.
    await autenticar(p.request,'solicitante'); await p.getByLabel('Senha',{exact:true}).fill(credenciais.solicitante.password);
    const negada = resposta(p,'POST','/api/auth/login'); await p.locator('#form-login button[type=submit]').click(); const n = await negada;
    assert.equal(n.status(),403); const erro = await n.json(); assert.equal(erro.codigo,'OPERACAO_NAO_PERMITIDA');
    await expect(p.locator('#feedback')).toContainText(erro.mensagem); await expect(p.locator('#referencia')).toContainText(erro.correlationId); assert.equal(contagem.length,2);
    assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); await p.screenshot({path:path.join(pasta,'login-csrf-mobile.png'),fullPage:true});
    await p.locator('#form-login button[type=submit]').click(); await expect(p).toHaveURL(/\/index.html$/); assert.equal(contagem.length,3);
    return { credencialInvalida:401, csrfRotacionado:403, novaAcaoExplicita:204, postsDoFormulario:contagem.length, viewport:'390x844', teclado:'Enter no login inválido' };
  });
  await caso('Instância temporária isolada com fontes idênticas', 'Processo + HTTP real', async () => {
    temporaria = await iniciarTemporaria(pasta); const a = await request.newContext({baseURL:temporaria.baseURL}); apis.push(a); await conferirFontes(a,nomes);
    return { baseURL:temporaria.baseURL, timeout:temporaria.timeout, cookieExclusivo:temporaria.cookie, arquivosServidos:nomes.length, hashes:'MATCH' };
  });
  timeoutTask = caso('Sessão expira por inatividade real e a interface volta ao login', 'Chrome + timeout real do servidor', async () => {
    const p = await pagina('solicitante',temporaria.baseURL); await p.goto('/pages/minhas-reservas.html');
    await expect(p.locator('#controles-reservas')).toBeEnabled();
    const cookieAntes = (await p.context().cookies()).find(c => c.name === temporaria.cookie); assert(cookieAntes?.httpOnly);
    const inicio = Date.now(); let ultimoAviso = 0;
    while (Date.now() - inicio < 65000) { await pausa(5000); const segundos = Math.floor((Date.now()-inicio)/1000);
      if (segundos - ultimoAviso >= 15) { console.log('AGUARDANDO inatividade real: ' + segundos + 's'); ultimoAviso = segundos; } }
    const cookieDepois = (await p.context().cookies()).find(c => c.name === temporaria.cookie); assert(cookieDepois?.value===cookieAntes.value,'Cookie não preservado durante a inatividade.');
    // Lê o corpo pelo mesmo BrowserContext antes da navegação da UI, que pode descartá-lo no Chrome.
    const r = await p.request.get('/api/auth/me'); assert.equal(r.status(),401); assert.equal((await r.json()).codigo,'NAO_AUTENTICADO');
    const expirou = resposta(p,'GET','/api/auth/me'); await p.reload(); assert.equal((await expirou).status(),401); await expect(p).toHaveURL(/\/login.html\?sessao=expirada$/);
    await expect(p.locator('#feedback')).toContainText('expirou'); await p.screenshot({path:path.join(pasta,'sessao-expirada.png'),fullPage:true});
    return { timeoutConfigurado:'1m', inatividadeMs:Date.now()-inicio, cookieMantidoAteRequisicao:true, resposta:401, redirecionamento:'/login.html?sessao=expirada', semLogoutOuLimpeza:true };
  });
  // A falha é consumida aqui e propagada ao await abaixo, evitando rejeição sem tratador durante os outros cenários.
  timeoutTask.catch(() => {});
  const recursos = [];
  await caso('Massa exclusiva e expediente real para pesquisa paginada', 'HTTP real de preparação', async () => {
    const expediente = await admin.get('/api/horarios-funcionamento'); assert.equal(expediente.status(),200);
    for (let i=0;i<21;i++) { const codigo=`FECHO-${nonce}-${i}`, dados={tipo:'MATERIAL',codigo,ativo:true,restrito:false,patrimonio:codigo,descricao:'Material fechamento '+i,condicao:'BOM'};
      const r = await escrita(admin,'POST','/api/recursos',dados); assert.equal(r.status(),201); const rec=await r.json(); assert(Number.isSafeInteger(rec.id)&&rec.id>0); assert.equal(rec.dados.codigo,codigo); recursos.push(rec); }
    return { recursos:recursos.map(r=>r.id), prefixo:'FECHO-'+nonce, expediente:await expediente.json() };
  });
  const inicio = Math.floor(Date.now()/60000)*60000+1200000;
  const periodo = { inicio:new Date(inicio).toISOString(), fim:new Date(inicio+1800000).toISOString() };
  assert.equal(localSp(periodo.inicio).slice(0,10),localSp(periodo.fim).slice(0,10),'Execute longe da virada do dia.');
  let vencedora;
  await caso('Duas sessões disputam a mesma reserva e só uma persiste', 'HTTP concorrente + SQL SELECT', async () => {
    const clientes = [sol,segunda]; const tokens = await Promise.all(clientes.map(async a => (await a.get('/api/auth/csrf')).json()));
    const body = {...periodo,recursosIds:[recursos[0].id]}; const disparo = Date.now();
    const respostas = await Promise.all(clientes.map((a,i)=>a.post('/api/reservas',{headers:{[tokens[i].header]:tokens[i].token,'X-Correlation-Id':'corrida-'+nonce+'-'+i},data:body})));
    assert.deepEqual(respostas.map(r=>r.status()).sort(),[201,409]); vencedora=await respostas.find(r=>r.status()===201).json(); const erro=await respostas.find(r=>r.status()===409).json();
    assert.equal(erro.codigo,'RECURSO_INDISPONIVEL'); assert.equal(erro.correlationId,'corrida-'+nonce+'-'+respostas.findIndex(r=>r.status()===409));
    const linhas=sql(`SELECT r.id,r.status FROM reservas r JOIN reserva_recursos rr ON rr.reserva_id=r.id WHERE rr.recurso_id=${recursos[0].id}`);
    assert.deepEqual(linhas.split(/\r?\n/),[vencedora.id+'\tAPROVADA']);
    return {disparoSimultaneoMs:disparo,statuses:respostas.map(r=>r.status()),reserva:vencedora.id,recurso:recursos[0].id,periodo,persistidas:1,correlationId:erro.correlationId};
  });
  const p = await pagina('solicitante');
  await caso('Pesquisa real tem paginação, vazio e ocupado sem seleção', 'Chrome + GETs reais', async () => {
    await p.goto('/pages/reservas.html'); await p.locator('#inicio').fill(localSp(periodo.inicio)); await p.locator('#fim').fill(localSp(periodo.fim)); await p.locator('#patrimonio').fill('FECHO-'+nonce);
    await p.locator('#pesquisar').click(); await expect(p.locator('#resultados .resource-card')).toHaveCount(20); await expect(p.locator('#pagina-seguinte')).toBeEnabled();
    await p.locator('#pagina-seguinte').click(); await expect(p.locator('#resultados .resource-card')).toHaveCount(1);
    await p.locator('#patrimonio').fill('INEXISTENTE-'+nonce); await p.locator('#pesquisar').click(); await expect(p.locator('#resultados .resource-card')).toHaveCount(0);
    await p.locator('#patrimonio').fill(recursos[0].dados.patrimonio); await p.locator('#pesquisar').click(); await expect(p.locator('#resultados .resource-card')).toHaveCount(1);
    await expect(p.locator('#resultados .availability')).toHaveText('Indisponível'); await expect(p.locator('#resultados input[type=checkbox]')).toBeDisabled();
    await expect(p.locator('#expediente')).not.toHaveText('Consultando o funcionamento…'); await p.setViewportSize({width:390,height:844});
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); await p.screenshot({path:path.join(pasta,'pesquisa-real-mobile.png'),fullPage:true});
    return {paginas:[20,1],total:21,vazio:'prefixo inexistente exclusivo',ocupado:recursos[0].id,selecaoImpedida:true,viewport:'390x844'};
  });
  await caso('Estado muda após abrir editor: PATCH recusado e detalhe reconciliado', 'Chrome + HTTP de outro ator + SQL', async () => {
    await p.setViewportSize({width:1366,height:900}); await p.goto('/pages/minhas-reservas.html'); await p.locator('#filtro-recurso').fill(String(recursos[0].id));
    await p.getByRole('button',{name:'Consultar reservas',exact:true}).click(); await p.getByRole('button',{name:'Consultar reserva '+vencedora.id,exact:true}).click();
    await expect(p.locator('#form-edicao-reserva')).toBeVisible(); assert.equal(await p.evaluate(()=>document.activeElement?.id),'detalhe-reserva');
    const cancelar=await escrita(admin,'POST',`/api/reservas/${vencedora.id}/cancelamento`); assert.equal(cancelar.status(),200); assert.equal((await cancelar.json()).status,'CANCELADA');
    const patches=[]; p.on('request',r=>{if(r.method()==='PATCH'&&new URL(r.url()).pathname==='/api/reservas/'+vencedora.id)patches.push(1);});
    await p.locator('#confirmar-edicao').check(); const negada=resposta(p,'PATCH','/api/reservas/'+vencedora.id); await p.locator('#salvar-reserva').dblclick(); const n=await negada;
    assert.equal(n.status(),403); const erro=await n.json(); assert.equal(erro.codigo,'OPERACAO_NAO_PERMITIDA'); await expect(p.locator('#feedback-detalhe')).toContainText(erro.mensagem);
    await expect(p.locator('#referencia-detalhe')).toContainText(erro.correlationId); await expect(p.locator('#salvar-reserva')).toBeDisabled(); await expect(p.locator('#confirmar-edicao')).not.toBeChecked();
    await p.locator('#reconsultar-reserva').click(); await expect(p.locator('#dados-reserva')).toContainText('CANCELADA'); await expect(p.locator('#form-edicao-reserva')).toBeHidden();
    assert.equal(patches.length,1);assert.equal(sql(`SELECT status FROM reservas WHERE id=${vencedora.id}`),'CANCELADA'); await p.screenshot({path:path.join(pasta,'estado-concorrente.png'),fullPage:true});
    return {reserva:vencedora.id,alteracaoExterna:'cancelamento administrativo',patchRecusado:403,patchesComDuploClique:patches.length,reconsulta:'CANCELADA',viewport:'1366x900',focoAoAbrir:'detalhe-reserva'};
  });
  await caso('Retirada, prazo vencido, Administrador somente leitura e devolução com atraso', 'Chrome + HTTP + relógio real + SQL', async () => {
    const resp = await pagina('responsavel'), adm = await pagina('admin'); const agora=Date.now();
    const dados={inicio:new Date(agora-60000).toISOString(),fim:new Date(agora+25000).toISOString(),recursosIds:[recursos[1].id]};
    const criar=await escrita(sol,'POST','/api/reservas',dados); assert.equal(criar.status(),201); const reserva=await criar.json(); assert.equal(reserva.status,'APROVADA');
    await resp.goto('/pages/movimentacoes.html'); await resp.locator('#numero-reserva').fill(String(reserva.id)); await resp.locator('#patrimonio-material').fill(recursos[1].dados.patrimonio);
    await resp.getByRole('button',{name:'Pesquisar materiais',exact:true}).click(); await resp.getByRole('button',{name:`Escolher ${recursos[1].dados.descricao} · ${recursos[1].dados.patrimonio}`,exact:true}).click();
    await resp.locator('#confirmar-retirada').check(); const retirada=resposta(resp,'POST','/api/movimentacoes/retiradas'); await resp.getByRole('button',{name:'Confirmar retirada',exact:true}).click();
    const retirou=await retirada; assert.equal(retirou.status(),201); const mov=await retirou.json(); assert(Date.parse(mov.retiradoEm)<Date.parse(mov.fimPrevisto));
    await expect(resp.locator('#confirmacao-retirada')).toBeVisible();
    await adm.goto('/pages/movimentacoes.html'); await expect(adm.locator(`[data-movimento="${mov.id}"]`)).toBeVisible(); await expect(adm.locator('#perfil-leitura')).toBeVisible(); await expect(adm.locator('#retirada')).toBeHidden();
    await expect(adm.getByRole('button',{name:'Devolver movimentação #'+mov.id,exact:true})).toHaveCount(0);
    const proibida=await escrita(admin,'POST',`/api/movimentacoes/${mov.id}/devolucao`); assert.equal(proibida.status(),403); assert.equal(sql(`SELECT COUNT(*) FROM movimentacoes WHERE id=${mov.id} AND devolvido_em IS NULL`),'1');
    while(Date.now()<Date.parse(mov.fimPrevisto)+2000)await pausa(1000);
    await resp.getByRole('button',{name:'Atualizar pendências',exact:true}).click(); await expect(resp.locator(`[data-prazo="${mov.id}"]`)).toContainText('Prazo ultrapassado');
    assert.equal(sql(`SELECT COUNT(*) FROM movimentacoes WHERE id=${mov.id} AND devolvido_em IS NULL`),'1');
    await resp.setViewportSize({width:390,height:844}); assert(await resp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); await resp.screenshot({path:path.join(pasta,'prazo-ultrapassado-mobile.png'),fullPage:true});
    await resp.getByRole('button',{name:'Devolver movimentação #'+mov.id,exact:true}).click(); await expect(resp.locator('#confirmar-devolucao')).toBeFocused();
    await resp.locator('#confirmar-devolucao').check(); const retorno=resposta(resp,'POST',`/api/movimentacoes/${mov.id}/devolucao`); await resp.getByRole('button',{name:'Confirmar devolução',exact:true}).click();
    const devolveu=await retorno; assert.equal(devolveu.status(),200); const d=await devolveu.json(); assert(d.atrasoSegundos>0); assert.equal(d.atrasoSegundos,Math.floor((Date.parse(d.devolvidoEm)-Date.parse(d.fimPrevisto))/1000));
    const atual=(await(await resp.request.get('/api/auth/me')).json()).usuarioId; assert.equal(d.devolvidoPor,atual);
    await expect(resp.locator('#detalhes-devolucao')).toContainText(`(${d.atrasoSegundos} segundos)`); await expect(resp.locator(`[data-movimento="${mov.id}"]`)).toHaveCount(0);
    assert.equal(sql(`SELECT atraso_segundos,devolvido_por FROM movimentacoes WHERE id=${mov.id}`),d.atrasoSegundos+'\t'+atual); await resp.screenshot({path:path.join(pasta,'devolucao-atrasada-mobile.png'),fullPage:true});
    return {reserva:reserva.id,movimentacao:mov.id,recurso:recursos[1].id,retiradoEm:mov.retiradoEm,fimPrevisto:mov.fimPrevisto,devolvidoEm:d.devolvidoEm,atrasoSegundos:d.atrasoSegundos,devolvidoPor:d.devolvidoPor,administradorEscrevendo:403,pendenciaMantidaDepoisPrazo:true,viewport:'390x844',focoNaConfirmacao:true};
  });
  await timeoutTask;
  await caso('Ausência de erros JavaScript nos contextos acompanhados', 'Chrome real', async()=>{assert.deepEqual(errosJS,[]);return {errosJS:0};});
})().catch(e=>{relatorio.erro=sanitizar(e.message);process.exitCode=1;}).finally(async()=>{
  if(timeoutTask)await timeoutTask.catch(()=>{});
  if(browser)await browser.close();for(const a of apis)await a.dispose();
  if(temporaria)try{await caso('Somente instância temporária encerrada e principal preservada','Identidade de processo + HTTP real',()=>temporaria.parar());}catch(e){relatorio.erroEncerramento=sanitizar(e.message);process.exitCode=1;}
  relatorio.fim=new Date().toISOString();relatorio.resumo={PASS:relatorio.cenarios.filter(c=>c.estado==='PASS').length,FAIL:relatorio.cenarios.filter(c=>c.estado==='FAIL').length};
  salvar();console.log(JSON.stringify({pasta:path.relative(repo,pasta),resumo:relatorio.resumo}));
});
