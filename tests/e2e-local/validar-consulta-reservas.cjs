'use strict';

// Integração real opt-in; configuração privada somente no ambiente isolado.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium,request,expect}=require('@playwright/test');
const {repo,dir,estado,credenciais,ferramentas,comandos,pronto,sql}=require('./controle.cjs');
const nonce=crypto.randomBytes(5).toString('hex');
const pasta=path.join(dir,'consulta-reservas',new Date().toISOString().replaceAll(/[:.]/g,'-'));fs.mkdirSync(pasta,{recursive:true});
const resultado={inicio:new Date().toISOString(),head:comandos.git(['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
  arvore:'worktree ainda sem commit, identificada pelos hashes',cenarios:[],hashes:{}};
const arquivos=['js/consulta-reservas.js','js/consulta-reservas-page.js','js/navegacao.js','pages/minhas-reservas.html','css/consulta-reservas.css','js/datas.js','js/reservas.js'];
for(const a of arquivos){const p='backend/src/main/resources/static/'+a;resultado.hashes[p]=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');}
resultado.hashes['tests/e2e-local/validar-consulta-reservas.cjs']=crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
for(const a of ['controle.cjs','executaveis.cjs','configuracao-local.cjs']){const p='tests/e2e-local/'+a;resultado.hashes[p]=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');}
const segredos=[credenciais.rootPassword,credenciais.db.password,credenciais.admin.password,credenciais.solicitante.password,credenciais.responsavel.password];
const sanitizar=s=>segredos.reduce((texto,v)=>texto.replaceAll(v,'[REMOVIDO]'),String(s));
const salvar=()=>fs.writeFileSync(path.join(pasta,'resultados.json'),JSON.stringify(resultado,null,2)+'\n');
const apis=[];let browser;
async function caso(nome,acao){try{const evidencia=await acao();resultado.cenarios.push({nome,estado:'PASS',evidencia});console.log('PASS '+nome);}
catch(e){resultado.cenarios.push({nome,estado:'FAIL',erro:sanitizar(e.message)});salvar();throw new Error('Falha: '+nome);}salvar();}
async function escrever(a,method,rota,data,form=false){const c=await(await a.get('/api/auth/csrf')).json();return a.fetch(rota,{method,
  headers:{[c.header]:c.token,'X-Correlation-Id':'consulta-'+nonce},...(data===undefined?{}:form?{form:data}:{data})});}
async function api(chave){const a=await request.newContext({baseURL:estado.baseURL});apis.push(a);
  assert.equal((await escrever(a,'POST','/api/auth/login',{email:credenciais[chave].email,senha:credenciais[chave].password},true)).status(),204);return a;}
async function detalhe(a,id){const r=await a.get('/api/reservas/'+id);assert.equal(r.status(),200);return r.json();}
async function entrar(chave){const ctx=await browser.newContext({baseURL:estado.baseURL,timezoneId:'America/Sao_Paulo',viewport:{width:1366,height:900}});
const page=await ctx.newPage();page.setDefaultTimeout(12000);await page.goto('/login.html');await page.getByLabel('E-mail',{exact:true}).fill(credenciais[chave].email);
await page.getByLabel('Senha',{exact:true}).fill(credenciais[chave].password);await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page).toHaveURL(/\/index.html$/);
await page.getByRole('link',{name:'Reservas',exact:true}).click();await expect(page).toHaveURL(/minhas-reservas.html$/);return page;}
async function filtrar(page,id){await page.locator('#filtro-recurso').fill(String(id));await page.getByRole('button',{name:'Consultar reservas',exact:true}).click();await expect(page.locator('#lista-reservas .resource-card')).toHaveCount(2);}
async function abrir(page,id){await page.getByRole('button',{name:'Consultar reserva '+id,exact:true}).click();await expect(page.locator('#detalhe-reserva')).toBeVisible();}
function civil(iso){const partes=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso)).map(p=>[p.type,p.value]));
return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}`;}
(async()=>{
 await pronto();const admin=await api('admin'),sol=await api('solicitante'),resp=await api('responsavel');
 await caso('Arquivos da nova interface efetivamente servidos pelo JAR',async()=>{
  for(const a of arquivos){const r=await admin.get('/'+a);assert.equal(r.status(),200);assert.equal(crypto.createHash('sha256').update(await r.body()).digest('hex'),resultado.hashes['backend/src/main/resources/static/'+a]);}return {arquivos:arquivos.length,hashes:'MATCH'};
 });
 const novos=[];
 for(const [tipo,sufixo]of[['SALA','sala'],['MATERIAL','original'],['MATERIAL','novo']]){
  const dados={tipo,codigo:`CONS-${nonce}-${sufixo}`,ativo:true,restrito:false,...(tipo==='SALA'?{capacidade:20,localizacao:'Revisão consulta',tipoSala:'Laboratório'}:{patrimonio:`CONS-${nonce}-${sufixo}`,descricao:'Material consulta '+sufixo,condicao:'BOM'})};
  const r=await escrever(admin,'POST','/api/recursos',dados);assert.equal(r.status(),201);const criado=await r.json();
  assert.equal(criado.dados.codigo,dados.codigo);assert.match(criado.dados.codigo,/^CONS-[a-f0-9]{10}-(sala|original|novo)$/);novos.push(criado);
 }
 const usuario=(await(await resp.get('/api/auth/me')).json()).usuarioId;assert(Number.isSafeInteger(usuario));
 assert.equal(sql(`SELECT COUNT(*) FROM usuarios WHERE id=${usuario} AND perfil='RESPONSAVEL' AND ativo=1`),'1');
 for(const rec of novos){assert(Number.isSafeInteger(rec.id));assert.equal(sql(`SELECT COUNT(*) FROM recursos WHERE id=${rec.id} AND codigo='${rec.dados.codigo}'`),'1');
  execFileSync(path.join(ferramentas.mysql,'bin/mysql.exe'),[`--defaults-file=${path.join(dir,'root-client.ini')}`,`--database=${estado.database}`,
    `--execute=INSERT INTO responsaveis_recursos(recurso_id,usuario_id) VALUES (${rec.id},${usuario})`],{windowsHide:true,timeout:10000,stdio:['ignore','pipe','pipe']});}
 const base=Math.floor(Date.now()/60000)*60000+600000+7123;
 const hora=n=>new Date(n).toISOString().replace('.123Z','.123456Z');
 const criar=async(inicio,fim,ids)=>{assert.equal(civil(inicio).slice(0,10),civil(fim).slice(0,10));const r=await escrever(sol,'POST','/api/reservas',{inicio,fim,recursosIds:ids});assert.equal(r.status(),201);return r.json();};
 const primeira=await criar(hora(base),hora(base+3600000),[novos[0].id,novos[1].id]);
 const segunda=await criar(hora(base+7200000),hora(base+10800000),[novos[0].id]);
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await entrar('solicitante');const erros=[];page.on('pageerror',e=>erros.push(e.message));
 await caso('Lista/detalhe do dono e PATCH completo sem perda de fração',async()=>{
  await filtrar(page,novos[0].id);await abrir(page,primeira.id);await expect(page.locator('#selecionados-edicao li')).toHaveCount(2);
  const antes=await detalhe(sol,primeira.id),req=page.waitForRequest(r=>r.method()==='PATCH'&&new URL(r.url()).pathname==='/api/reservas/'+primeira.id);
  await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();const body=(await req).postDataJSON();
  assert.deepEqual(body,{inicio:antes.inicio,fim:antes.fim,recursosIds:antes.recursosIds});await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');
  const depois=await detalhe(sol,primeira.id);assert.equal(depois.inicio,antes.inicio);assert.equal(depois.fim,antes.fim);return {id:primeira.id,inicio:depois.inicio,fim:depois.fim,recursos:depois.recursosIds};
 });
 await caso('Conflito real 409 preserva reserva e exige reconsulta antes de nova escrita',async()=>{
  await page.locator('#editar-inicio').fill(civil(segunda.inicio));await page.locator('#editar-fim').fill(civil(segunda.fim));
  await page.locator('#confirmar-edicao').check();const response=page.waitForResponse(r=>r.request().method()==='PATCH');await page.locator('#salvar-reserva').click();assert.equal((await response).status(),409);
  await expect(page.locator('#feedback-detalhe')).toContainText('Atualize o detalhe');await expect(page.locator('#salvar-reserva')).toBeDisabled();
  assert.equal((await detalhe(sol,primeira.id)).inicio,primeira.inicio);await page.locator('#reconsultar-reserva').click();
  await expect(page.locator('#salvar-reserva')).toBeEnabled();await expect(page.locator('#confirmar-edicao')).not.toBeChecked();return {conflito:409,estado:'APROVADA',semReenvio:true};
 });
 await caso('Editar um horário e adicionar recurso mantém o outro e todos os originais',async()=>{
  const antes=await detalhe(sol,primeira.id);const novoInicio=new Date(Date.parse(antes.inicio)+300000).toISOString();
  await page.locator('#editar-inicio').fill(civil(novoInicio));await page.locator('#edicao-patrimonio').fill(novos[2].dados.patrimonio);
  await page.getByRole('button',{name:'Pesquisar recursos para edição',exact:true}).click();await page.getByRole('checkbox',{name:'Selecionar recurso '+novos[2].id,exact:true}).check();
  await expect(page.locator('#selecionados-edicao li')).toHaveCount(3);await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();
  await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');const depois=await detalhe(sol,primeira.id);
  assert.equal(depois.fim,antes.fim);assert.deepEqual(depois.recursosIds,[...antes.recursosIds,novos[2].id]);await page.screenshot({path:path.join(pasta,'edicao-real.png'),fullPage:true});
  return {id:depois.id,inicio:depois.inicio,fim:depois.fim,recursos:depois.recursosIds};
 });
 await caso('Responsável autorizado consulta sem herdar edição/cancelamento do dono',async()=>{
  const p=await entrar('responsavel');await filtrar(p,novos[0].id);await abrir(p,primeira.id);
  await expect(p.locator('#form-edicao-reserva')).toBeHidden();await expect(p.locator('#form-cancelar-reserva')).toBeHidden();return {id:primeira.id,consulta:true,acoesDoDono:false};
 });
 await caso('Cancelamento do dono confirma estado sem apagar histórico',async()=>{
  await page.locator('#confirmar-cancelar').check();await page.locator('#cancelar-reserva').click();await expect(page.locator('#feedback-detalhe')).toContainText('Cancelamento confirmado');
  const d=await detalhe(sol,primeira.id);assert.equal(d.status,'CANCELADA');await expect(page.locator('#form-edicao-reserva')).toBeHidden();await page.screenshot({path:path.join(pasta,'cancelamento-real.png'),fullPage:true});
  return {id:d.id,status:d.status,recursos:d.recursosIds};
 });
 await caso('Administrador cancela reserva alheia sem obter edição',async()=>{
  const p=await entrar('admin');await filtrar(p,novos[0].id);await abrir(p,segunda.id);await expect(p.locator('#form-edicao-reserva')).toBeHidden();
  await p.locator('#confirmar-cancelar').check();await p.locator('#cancelar-reserva').click();await expect(p.locator('#feedback-detalhe')).toContainText('Cancelamento confirmado');
  assert.equal((await detalhe(sol,segunda.id)).status,'CANCELADA');return {id:segunda.id,status:'CANCELADA'};
 });
 await caso('Detalhe móvel real e persistência do cancelamento',async()=>{
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.screenshot({path:path.join(pasta,'reservas-mobile.png'),fullPage:true});assert.deepEqual(erros,[]);
  const linhas=sql(`SELECT id,status FROM reservas WHERE id IN (${primeira.id},${segunda.id}) ORDER BY id`);assert.equal(linhas.split(/\r?\n/).filter(l=>l.endsWith('CANCELADA')).length,2);
  return {viewport:'390x844',persistencia:linhas,errosJS:0};
 });
})().catch(e=>{resultado.erro=sanitizar(e.message);process.exitCode=1;}).finally(async()=>{
 if(browser)await browser.close();for(const a of apis)await a.dispose();resultado.fim=new Date().toISOString();
 resultado.resumo={PASS:resultado.cenarios.filter(c=>c.estado==='PASS').length,FAIL:resultado.cenarios.filter(c=>c.estado==='FAIL').length};salvar();console.log(JSON.stringify({pasta:path.relative(repo,pasta),resumo:resultado.resumo}));
});
