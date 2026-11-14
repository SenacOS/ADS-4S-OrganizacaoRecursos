'use strict';

// Opt-in: Spring/MySQL locais reais; SQL de escrita somente para vínculos da massa nova.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { request, chromium, expect } = require('@playwright/test');
const { repo, dir, ferramentas, comandos, credenciais, estado, sql, pronto } = require('./controle.cjs');
const nonce = crypto.randomBytes(5).toString('hex');
const pasta = path.join(dir, 'q9', new Date().toISOString().replaceAll(/[:.]/g, '-'));
fs.mkdirSync(pasta, { recursive: true });
const git = (...args) => comandos.git(args,{cwd:repo,encoding:'utf8'}).trim();
let merge = null;
try { merge = comandos.git(['rev-parse','--verify','MERGE_HEAD'],{cwd:repo,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim(); } catch (erro) { if (erro.status !== 128) throw erro; /* MERGE_HEAD ausente após commit. */ }
const resultado = { inicio: new Date().toISOString(), head:git('rev-parse','HEAD'), merge, branch:git('branch','--show-current'),
  camada: 'HTTP/Chrome/MySQL reais, sem interceptação', cenarios: [], hashes: {} };
for (const p of ['tests/e2e-local/validar-q9.cjs','tests/e2e-local/validar.cjs','tests/e2e-local/controle.cjs','tests/e2e-local/executaveis.cjs','tests/e2e-local/configuracao-local.cjs',
  'backend/src/main/resources/static/js/aprovacoes.js','backend/src/main/resources/static/js/aprovacoes-page.js',
  'backend/src/main/resources/static/js/datas.js','backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar']) {
  resultado.hashes[p] = crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
}
const salvar = () => fs.writeFileSync(path.join(pasta, 'resultados.json'), JSON.stringify(resultado,null,2)+'\n');
const contextos = [];
const massa = {};
const segredo = crypto.randomBytes(32).toString('base64url');
const segredos = [segredo,credenciais.rootPassword,credenciais.db.password,credenciais.admin.password,
  credenciais.solicitante.password,credenciais.responsavel.password];
const sanitizar = (texto) => segredos.reduce((s,v)=>s.replaceAll(v,'[REMOVIDO]'),String(texto));
fs.writeFileSync(path.join(pasta, 'credencial-privada.json'), JSON.stringify({ email: `q9-${nonce}@example.test`, senha: segredo }));
async function caso(nome, acao) {
  try { const evidencia = await acao(); resultado.cenarios.push({ nome, estado:'PASS', evidencia }); console.log('PASS '+nome); }
  catch(e) { resultado.cenarios.push({ nome, estado:'FAIL', erro:sanitizar(e.message) }); salvar(); throw new Error('Falha no cenário '+nome); }
  salvar();
}
async function nova() { const a = await request.newContext({baseURL:estado.baseURL}); contextos.push(a); return a; }
async function escrever(a, method, rota, data, form=false) {
  const c = await (await a.get('/api/auth/csrf')).json();
  return a.fetch(rota,{method, headers:{[c.header]:c.token,'X-Correlation-Id':'q9-'+nonce},
    ...(data===undefined?{}:form?{form:data}:{data})});
}
async function conferir(r, status) { assert.equal(r.status(),status,new URL(r.url()).pathname); return r; }
async function entrar(a,email,senha) { await conferir(await escrever(a,'POST','/api/auth/login',{email,senha},true),204); return (await (await a.get('/api/auth/me')).json()); }
async function ler(a,rota,status=200) { const r = await conferir(await a.get(rota),status); return r.json(); }
const fila = (a,recurso,pagina=0,tamanho=20) => ler(a,`/api/reservas?status=SOLICITADA&recursoId=${recurso}&pagina=${pagina}&tamanho=${tamanho}`);
function vincular(recurso,usuario,conceder=true) {
  assert([massa.A,massa.B].includes(recurso)); assert.equal(usuario,massa.responsavel);
  assert(Number.isSafeInteger(recurso)&&Number.isSafeInteger(usuario));
  assert.equal(sql(`SELECT COUNT(*) FROM recursos WHERE id=${recurso} AND codigo='Q9-${nonce}-${recurso===massa.A?'A':'B'}'`),'1');
  assert.equal(sql(`SELECT COUNT(*) FROM usuarios WHERE id=${usuario} AND perfil='RESPONSAVEL' AND ativo=1`),'1');
  execFileSync(path.join(ferramentas.mysql,'bin/mysql.exe'),[`--defaults-file=${path.join(dir,'root-client.ini')}`,
    `--database=${estado.database}`,`--execute=${conceder
      ? `INSERT INTO responsaveis_recursos(recurso_id,usuario_id) VALUES (${recurso},${usuario})`
      : `DELETE FROM responsaveis_recursos WHERE recurso_id=${recurso} AND usuario_id=${usuario}`}`],
  {windowsHide:true,timeout:10000,stdio:['ignore','pipe','pipe']});
}
async function executar() {
  await pronto();
  const admin=await nova(),sol=await nova(),resp=await nova(),outro=await nova();
  await entrar(admin,credenciais.admin.email,credenciais.admin.password);
  const eu=await entrar(sol,credenciais.solicitante.email,credenciais.solicitante.password);
  massa.responsavel=(await entrar(resp,credenciais.responsavel.email,credenciais.responsavel.password)).usuarioId;
  await conferir(await escrever(admin,'POST','/api/usuarios',{nome:'Outro solicitante Q9',email:`q9-${nonce}@example.test`,senha:segredo,perfil:'SOLICITANTE'}),201);
  await entrar(outro,`q9-${nonce}@example.test`,segredo);
  await caso('V6 e fontes servidas',async()=>{
    assert.equal(sql('SELECT COUNT(*) FROM flyway_schema_history WHERE success=1'),'7');
    for(const nome of ['aprovacoes.js','aprovacoes-page.js','datas.js']) {
      const r=await conferir(await admin.get('/js/'+nome),200);
      assert.equal(crypto.createHash('sha256').update(await r.body()).digest('hex'),resultado.hashes['backend/src/main/resources/static/js/'+nome]);
    } return {migracoes:7,hashesServidos:'MATCH'};
  });
  for (const chave of ['A','B']) {
    const r=await conferir(await escrever(admin,'POST','/api/recursos',{tipo:'MATERIAL',codigo:`Q9-${nonce}-${chave}`,
      ativo:true,restrito:true,patrimonio:`Q9-${nonce}-${chave}`,descricao:'Material Q9 '+chave,condicao:'BOM'}),201);
    massa[chave]=(await r.json()).id;
  }
  const agora=Date.now();
  async function reservar(a,ids,min) {
    const inicio=new Date(Math.floor(agora/60000)*60000+min*60000),fim=new Date(inicio.getTime()+600000);
    const dia=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(d);
    assert.equal(dia(inicio),dia(fim),'Intervalo deve permanecer no mesmo dia');
    const r=await conferir(await escrever(a,'POST','/api/reservas',{inicio:inicio.toISOString(),fim:fim.toISOString(),recursosIds:ids}),201); return r.json();
  }
  massa.propria=await reservar(sol,[massa.A],5); massa.alheia=await reservar(outro,[massa.A],25);
  massa.multipla=await reservar(sol,[massa.A,massa.B],45); massa.rejeitar=await reservar(sol,[massa.A],65);
  await caso('Solicitante, paginação e total restritos às próprias reservas',async()=>{
    const p=await fila(sol,massa.A,0,1),p2=await fila(sol,massa.A,1,1);
    assert.equal(p.total,3); assert.equal(p2.total,3); assert.equal(p.itens.length,1); assert.equal(p2.itens.length,1);
    assert([...p.itens,...p2.itens].every(r=>r.solicitanteId===eu.usuarioId && r.id!==massa.alheia.id)); assert.notEqual(p.itens[0].id,p2.itens[0].id);
    assert.equal((await ler(sol,'/api/reservas/'+massa.alheia.id,404)).codigo,'NAO_ENCONTRADO');
    const d=await ler(sol,'/api/reservas/'+massa.multipla.id); assert.equal(d.recursosIds.length,2); assert(!JSON.stringify(d).includes('@'));
    return {totalProprias:3,alheia:404,detalheCompleto:200};
  });
  await caso('Administrador lê sem herdar decisão',async()=>{
    assert.equal((await fila(admin,massa.A)).total,4);
    await ler(admin,'/api/reservas/'+massa.alheia.id);
    await conferir(await escrever(admin,'POST',`/api/reservas/${massa.propria.id}/aprovacao`),403);
    return {total:4,aprovacao:403};
  });
  await caso('Responsável sem vínculo e filtros inválidos',async()=>{
    assert.equal((await fila(resp,massa.A)).total,0);
    assert.equal((await ler(resp,'/api/reservas/'+massa.propria.id,404)).codigo,'NAO_ENCONTRADO');
    await conferir(await escrever(resp,'POST',`/api/reservas/${massa.propria.id}/aprovacao`),403);
    await ler(resp,'/api/reservas?pagina=-1',400); await ler(resp,'/api/reservas?status=INVALIDO',400);
    const anon=await nova(); await ler(anon,'/api/reservas',401);
    return {fila:0,detalhe:404,decisao:403,parametros:400,semSessao:401};
  });
  vincular(massa.A,massa.responsavel);
  await caso('Vínculo parcial preserva negativa multi-recurso',async()=>{
    const p=await fila(resp,massa.A); assert.equal(p.total,3); assert(!p.itens.some(r=>r.id===massa.multipla.id));
    await ler(resp,'/api/reservas/'+massa.multipla.id,404);
    await conferir(await escrever(resp,'POST',`/api/reservas/${massa.multipla.id}/aprovacao`),403);
    assert.equal((await ler(sol,'/api/reservas/'+massa.multipla.id)).status,'SOLICITADA');
    return {total:3,multipla:404,decisao:403,estadoPreservado:'SOLICITADA'};
  });
  vincular(massa.B,massa.responsavel);
  await caso('Vínculo completo habilita leitura multi-recurso',async()=>{
    assert.equal((await fila(resp,massa.A)).total,4);
    const d=await ler(resp,'/api/reservas/'+massa.multipla.id); assert.equal(d.recursos.length,2);
    return {total:4,multipla:200,recursos:2};
  });
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    await caso('Fila real: identificação, aprovação e rejeição com motivo',async()=>{
      const ctx=await browser.newContext({baseURL:estado.baseURL,viewport:{width:1366,height:900},timezoneId:'America/Sao_Paulo'});
      const page=await ctx.newPage();page.setDefaultTimeout(10000);const erros=[];page.on('pageerror',e=>erros.push(e.message));
      await page.goto('/login.html');await page.getByLabel('E-mail',{exact:true}).fill(credenciais.responsavel.email);
      await page.getByLabel('Senha',{exact:true}).fill(credenciais.responsavel.password);await page.getByRole('button',{name:'Entrar',exact:true}).click();
      await expect(page).toHaveURL(/\/index.html$/);await page.goto('/pages/aprovacoes.html');
      await page.locator('#recurso-fila').fill(String(massa.A));await page.getByRole('button',{name:'Consultar fila',exact:true}).click();
      await expect(page.locator('#resumo-fila')).toContainText('4 solicitação');
      await page.getByRole('button',{name:'Avaliar reserva '+massa.propria.id,exact:true}).click();
      await expect(page.locator('#dados-pendente')).toContainText('Solicitante '+eu.usuarioId);
      await expect(page.locator('#recursos-pendente')).toContainText('Material Q9 A');
      await page.screenshot({path:path.join(pasta,'fila-real.png'),fullPage:true});
      await page.getByRole('button',{name:'Confirmar aprovação',exact:true}).click();
      await expect(page.locator('#feedback-decisao')).toContainText('APROVADA');
      await expect(page.locator('#resumo-fila')).toContainText('3 solicitação');
      await page.getByRole('button',{name:'Avaliar reserva '+massa.rejeitar.id,exact:true}).click();
      await page.getByRole('radio',{name:'Rejeitar',exact:true}).check();await page.locator('#motivo-decisao').fill('   ');
      await page.getByRole('button',{name:'Confirmar rejeição',exact:true}).click();
      await expect(page.locator('#feedback-decisao')).toContainText('Informe o motivo');
      assert.equal((await ler(sol,'/api/reservas/'+massa.rejeitar.id)).status,'SOLICITADA');
      await page.locator('#motivo-decisao').fill('Revisão real Q9');await page.getByRole('button',{name:'Confirmar rejeição',exact:true}).click();
      await expect(page.locator('#feedback-decisao')).toContainText('REJEITADA');
      await expect(page.locator('#resumo-fila')).toContainText('2 solicitação');assert.deepEqual(erros,[]);
      const d=await ler(sol,'/api/reservas/'+massa.rejeitar.id);assert.equal(d.motivoDecisao,'Revisão real Q9');
      return {aprovada:massa.propria.id,rejeitada:massa.rejeitar.id,motivoObrigatorio:true,errosJS:0};
    });
  } finally {await browser.close();}
  await caso('Decisão multi-recurso permitida somente após vínculo completo',async()=>{
    await conferir(await escrever(resp,'POST',`/api/reservas/${massa.multipla.id}/aprovacao`),200);
    const d=await ler(sol,'/api/reservas/'+massa.multipla.id); assert.equal(d.status,'APROVADA');
    assert.equal(d.recursosIds.length,2); return {id:d.id,status:d.status,recursos:2};
  });
  await caso('Página da fila além do fim preserva total autorizado',async()=>{
    const p=await fila(resp,massa.A,99,1); assert.deepEqual(p.itens,[]); assert.equal(p.total,1);
    assert.equal(p.pagina,99); assert.equal(p.tamanho,1); return {pagina:99,itens:0,total:1};
  });
  await caso('Revogação do vínculo exclusivo da rodada remove acesso',async()=>{
    vincular(massa.A,massa.responsavel,false);
    assert.equal((await fila(resp,massa.A)).total,0);
    await ler(resp,'/api/reservas/'+massa.alheia.id,404);
    await ler(resp,'/api/reservas/'+massa.multipla.id,404);
    await conferir(await escrever(resp,'POST',`/api/reservas/${massa.alheia.id}/aprovacao`),403);
    assert.equal((await ler(outro,'/api/reservas/'+massa.alheia.id)).status,'SOLICITADA');
    assert.equal((await fila(admin,massa.A)).total,1);
    return {filaResponsavel:0,detalhes:404,decisao:403,reservaPreservada:true,filaAdministrador:1};
  });
  await caso('Q3: Responsável vinculado não aprova a própria reserva restrita',async()=>{
    const propria=await reservar(resp,[massa.B],85);assert.equal(propria.solicitanteId,massa.responsavel);assert.equal(propria.status,'SOLICITADA');
    const negada=await conferir(await escrever(resp,'POST',`/api/reservas/${propria.id}/aprovacao`),403);
    assert.equal((await negada.json()).codigo,'OPERACAO_NAO_PERMITIDA');
    assert.equal((await ler(resp,'/api/reservas/'+propria.id)).status,'SOLICITADA');
    assert.equal(sql(`SELECT status FROM reservas WHERE id=${propria.id}`),'SOLICITADA');
    await conferir(await escrever(resp,'POST',`/api/reservas/${propria.id}/cancelamento`),200);
    return {id:propria.id,vinculoCompleto:true,aprovacaoPropria:403,estadoDepoisDaNegativa:'SOLICITADA',cancelamentoExplicitoPosterior:'CANCELADA'};
  });
  await caso('Q1: início, conclusão e ausência recusam Administrador e aceitam Responsável',async()=>{
    const emUso=await reservar(sol,[massa.B],-2);await conferir(await escrever(resp,'POST',`/api/reservas/${emUso.id}/aprovacao`),200);
    await conferir(await escrever(admin,'POST',`/api/reservas/${emUso.id}/inicio`),403);assert.equal((await ler(sol,'/api/reservas/'+emUso.id)).status,'APROVADA');
    const iniciou=await conferir(await escrever(resp,'POST',`/api/reservas/${emUso.id}/inicio`),200);assert.equal((await iniciou.json()).status,'EM_USO');
    await conferir(await escrever(admin,'POST',`/api/reservas/${emUso.id}/conclusao`),403);assert.equal((await ler(sol,'/api/reservas/'+emUso.id)).status,'EM_USO');
    const concluiu=await conferir(await escrever(resp,'POST',`/api/reservas/${emUso.id}/conclusao`),200);assert.equal((await concluiu.json()).status,'CONCLUIDA');
    const ausencia=await reservar(sol,[massa.B],15);await conferir(await escrever(resp,'POST',`/api/reservas/${ausencia.id}/aprovacao`),200);
    await conferir(await escrever(admin,'POST',`/api/reservas/${ausencia.id}/nao-comparecimento`),403);assert.equal((await ler(sol,'/api/reservas/'+ausencia.id)).status,'APROVADA');
    const marcou=await conferir(await escrever(resp,'POST',`/api/reservas/${ausencia.id}/nao-comparecimento`),200);assert.equal((await marcou.json()).status,'NAO_COMPARECEU');
    assert.equal(sql(`SELECT status FROM reservas WHERE id=${emUso.id}`),'CONCLUIDA');assert.equal(sql(`SELECT status FROM reservas WHERE id=${ausencia.id}`),'NAO_COMPARECEU');
    return {reservaConcluida:emUso.id,reservaAusente:ausencia.id,administrador:{inicio:403,conclusao:403,ausencia:403},responsavel:{inicio:200,conclusao:200,ausencia:200},estadosPersistidos:['CONCLUIDA','NAO_COMPARECEU']};
  });
  resultado.massa={...massa};
}
executar().catch(e=>{resultado.erro=sanitizar(e.message);process.exitCode=1;}).finally(async()=>{
  for(const a of contextos)await a.dispose();resultado.fim=new Date().toISOString();
  resultado.resumo={PASS:resultado.cenarios.filter(c=>c.estado==='PASS').length,FAIL:resultado.cenarios.filter(c=>c.estado==='FAIL').length};
  salvar();console.log(JSON.stringify({pasta:path.relative(repo,pasta),resumo:resultado.resumo}));
});
