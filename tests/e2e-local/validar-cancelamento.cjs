'use strict';

// Opt-in: Q5 com HTTP/Chrome/MySQL reais; preparação por API e inspeção somente SELECT.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {request,chromium,expect}=require('@playwright/test');
const {repo,dir,estado,credenciais,comandos,sql,pronto}=require('./controle.cjs');
const {projetarRelatorio}=require('./evidencias.cjs');
const pasta=path.join(dir,'cancelamento',new Date().toISOString().replaceAll(/[:.]/g,'-'));fs.mkdirSync(pasta,{recursive:true});
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const nonce=crypto.randomBytes(6).toString('hex');
const resultado={inicio:new Date().toISOString(),base:comandos.git(['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
  branch:comandos.git(['branch','--show-current'],{cwd:repo,encoding:'utf8'}).trim(),arvore:'Árvore local identificada pelos hashes',
  camada:'Spring/Chrome/MySQL reais, sem interceptação',cenarios:[],hashes:{},concluido:false};
const fontes=['js/consulta-reservas.js','js/consulta-reservas-page.js','js/reservas.js','js/forms.js','js/datas.js','css/consulta-reservas.css','pages/minhas-reservas.html'];
for(const p of fontes)resultado.hashes['backend/src/main/resources/static/'+p]=hash('backend/src/main/resources/static/'+p);
for(const p of ['tests/e2e-local/validar-cancelamento.cjs','tests/e2e-local/controle.cjs','tests/e2e-local/executaveis.cjs',
  'backend/src/main/java/br/senac/recursos/reserva/dominio/Reserva.java','backend/src/main/java/br/senac/recursos/reserva/api/CancelarReservaRequest.java',
  'backend/src/main/resources/db/migration/V7__reserva_motivo_cancelamento.sql','backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar'])resultado.hashes[p]=hash(p);
const segredos=[credenciais.rootPassword,credenciais.db.password,...['admin','solicitante','responsavel'].map(k=>credenciais[k].password)].filter(Boolean);
const sanitizar=s=>segredos.reduce((v,p)=>v.replaceAll(p,'[REMOVIDO]'),String(s));
const salvar=()=>fs.writeFileSync(path.join(pasta,'resultados.json'),JSON.stringify(projetarRelatorio(resultado),null,2)+'\n');
const contextos=[];let browser;
async function caso(nome,acao){try{resultado.cenarios.push({nome,estado:'PASS',evidencia:await acao()});console.log('PASS '+nome);}catch(e){resultado.cenarios.push({nome,estado:'FAIL',erro:sanitizar(e.message)});salvar();throw new Error('Falha no cenário '+nome);}salvar();}
const status=(r,s)=>{assert.equal(r.status(),s,new URL(r.url()).pathname);return r;};
async function nova(){const c=await request.newContext({baseURL:estado.baseURL,timeout:15000});contextos.push(c);return c;}
async function escrever(c,method,url,data,form=false){const csrf=await status(await c.get('/api/auth/csrf'),200).json();return c.fetch(url,{method,
  headers:{[csrf.header]:csrf.token,'X-Correlation-Id':'q5-'+nonce},...(data===undefined?{}:form?{form:data}:{data})});}
async function entrar(c,conta){status(await escrever(c,'POST','/api/auth/login',{email:conta.email,senha:conta.password},true),204);return status(await c.get('/api/auth/me'),200).json();}
const id=n=>assert(Number.isSafeInteger(n)&&n>0,'ID inválido.');
function snapshot(reserva){id(reserva);const [s,m,a,n]=sql(`SELECT r.status,COALESCE(r.motivo_decisao,''),(SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA' AND entidade_id=r.id),(SELECT COUNT(*) FROM notificacoes WHERE reserva_id=r.id) FROM reservas r WHERE r.id=${reserva}`).split('\t');return{status:s,motivoDecisao:m,auditoria:Number(a),outbox:Number(n)};}
async function executar(){
  await pronto();const admin=await nova(),sol=await nova(),resp=await nova();
  const ator=await entrar(admin,credenciais.admin);await entrar(sol,credenciais.solicitante);await entrar(resp,credenciais.responsavel);
  await caso('V7 e fontes servidas correspondem à base Q5',async()=>{
    assert.equal(sql("SELECT COUNT(*) FROM flyway_schema_history WHERE version='7' AND success=1"),'1');
    for(const p of fontes){const r=status(await admin.get('/'+p),200);assert.equal(crypto.createHash('sha256').update(await r.body()).digest('hex'),resultado.hashes['backend/src/main/resources/static/'+p]);}
    return{migracao:7,fontes:fontes.length,hashes:'MATCH'};
  });
  const {paraIsoOperacional}=await import(pathToFileURL(path.join(repo,'backend/src/main/resources/static/js/datas.js')).href);
  const exp=await status(await admin.get('/api/horarios-funcionamento'),200).json();let periodo;
  for(let dia=2;dia<10&&!periodo;dia++){
    const d=new Date(Date.now()+dia*86400000),data=new Intl.DateTimeFormat('en-CA',{timeZone:exp.zona}).format(d);
    const semana=new Intl.DateTimeFormat('en-US',{timeZone:exp.zona,weekday:'long'}).format(d).toUpperCase();
    const sec=s=>{const[h,m,v=0]=s.split(':').map(Number);return h*3600+m*60+v;};
    for(const j of exp.janelas.filter(j=>j.dia===semana)){const a=Math.ceil(sec(j.inicio)/60)*60;if(a+3600>sec(j.fim)||a+3600>=86400)continue;
      const hora=s=>String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor(s%3600/60)).padStart(2,'0');
      periodo={inicio:paraIsoOperacional(data+'T'+hora(a)),fim:paraIsoOperacional(data+'T'+hora(a+3600))};break;}
  }
  assert(periodo,'Expediente não oferece intervalo futuro; dados/horários não foram alterados.');
  const massa={periodo,recursos:{},reservas:{}};
  for(const letra of ['A','B','C','D','E','F','G']){
    const codigo=`Q5-${nonce}-${letra}`,rec=await status(await escrever(admin,'POST','/api/recursos',{tipo:'MATERIAL',codigo,patrimonio:codigo,descricao:'Material cancelamento '+letra,condicao:'BOM',ativo:true,restrito:false}),201).json();
    id(rec.id);assert.equal(rec.dados.codigo,codigo);massa.recursos[letra]=rec.id;
    const r=await status(await escrever(['B','G'].includes(letra)?admin:sol,'POST','/api/reservas',{...periodo,recursosIds:[rec.id]}),201).json();id(r.id);assert.equal(r.status,'APROVADA');massa.reservas[letra]=r.id;
  }
  resultado.massa=massa;
  await caso('Administrador sem motivo, branco ou acima de500 recebe400 sem alterar trilhas',async()=>{
    const reserva=massa.reservas.A,antes=snapshot(reserva);
    for(const data of [undefined,{motivo:''},{motivo:'  \t '},{motivo:'x'.repeat(501)}]){
      const erro=await status(await escrever(admin,'POST',`/api/reservas/${reserva}/cancelamento`,data),400).json();assert(erro.correlationId);assert.equal(erro.codigo,'REQUISICAO_INVALIDA');assert.deepEqual(snapshot(reserva),antes);
    }return{recusas:4,http:400,estado:antes.status,trilhasPreservadas:true};
  });
  await caso('Outro perfil não cancela reserva alheia mesmo forjando identidade no corpo',async()=>{
    const reserva=massa.reservas.D,antes=snapshot(reserva);status(await escrever(resp,'POST',`/api/reservas/${reserva}/cancelamento`,{motivo:'Justificativa não concede permissão.',papel:'ADMINISTRADOR',usuarioId:ator.usuarioId}),403);
    assert.deepEqual(snapshot(reserva),antes);return{http:403,estadoPreservado:true,identidade:'Somente sessão'};
  });
  async function confirmarCancelamento(c,reserva,motivo,semCorpo=false){const antes=snapshot(reserva),r=await status(await escrever(c,'POST',`/api/reservas/${reserva}/cancelamento`,semCorpo?undefined:{motivo}),200).json();
    assert.equal(r.status,'CANCELADA');assert.equal(r.id,reserva);assert.equal(r.motivoDecisao,antes.motivoDecisao||null);
    assert.deepEqual(snapshot(reserva),{...antes,status:'CANCELADA',auditoria:antes.auditoria+1,outbox:antes.outbox+1});
    assert.equal(sql(`SELECT COALESCE(motivo_cancelamento,'') FROM reservas WHERE id=${reserva}`),motivo||'');return{id:reserva,status:'CANCELADA',motivoCaracteres:motivo?.length||0,auditoriaIncremento:1,outboxIncremento:1};}
  await caso('Limite500 é aceito e persistido separadamente de motivoDecisao',()=>confirmarCancelamento(admin,massa.reservas.E,'x'.repeat(500)));
  await caso('Dono e Administrador dono continuam cancelando sem corpo',async()=>({solicitante:await confirmarCancelamento(sol,massa.reservas.C,undefined,true),administradorDono:await confirmarCancelamento(admin,massa.reservas.B,undefined,true)}));
  browser=await chromium.launch({channel:'chrome',headless:true});resultado.chrome=browser.version();
  for(const [nome,letra,viewport]of[['desktop','A',{width:1366,height:900}],['mobile','D',{width:390,height:844}]]){
    await caso('UI administrativa exige justificativa e confirma uma escrita — '+nome,async()=>{
      const ctx=await browser.newContext({baseURL:estado.baseURL,viewport,timezoneId:'Asia/Tokyo'}),page=await ctx.newPage();page.setDefaultTimeout(12000);const erros=[];page.on('pageerror',e=>erros.push(e.message));
      await page.goto('/login.html');await page.getByLabel('E-mail',{exact:true}).fill(credenciais.admin.email);await page.getByLabel('Senha',{exact:true}).fill(credenciais.admin.password);await page.locator('button[type=submit]').click();await expect(page).toHaveURL(/\/index.html$/);
      await page.goto('/pages/minhas-reservas.html');await expect(page.locator('#atualizar-lista')).toBeEnabled();
      await page.locator('#filtro-recurso').fill(String(massa.recursos[letra]));await page.locator('#form-busca-reservas button[type=submit]').click();
      await page.getByRole('button',{name:'Consultar reserva '+massa.reservas[letra],exact:true}).click();
      const campo=page.getByLabel('Justificativa do cancelamento',{exact:true});await expect(campo).toBeVisible();await expect(campo).toHaveAttribute('maxlength','500');
      const rota=`/api/reservas/${massa.reservas[letra]}/cancelamento`;let posts=0;page.on('request',r=>{if(r.method()==='POST'&&new URL(r.url()).pathname===rota)posts++;});
      await page.locator('#confirmar-cancelar').check();await page.locator('#cancelar-reserva').click();assert.equal(posts,0);
      const motivo='Reagendamento autorizado para validar Q5.';await campo.fill(motivo);await page.locator('#confirmar-cancelar').check();
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow horizontal.');
      await page.screenshot({path:path.join(pasta,'q5-'+nome+'.png'),fullPage:true});
      const antes=snapshot(massa.reservas[letra]);const[r]=await Promise.all([page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname===rota),page.locator('#cancelar-reserva').evaluate(b=>{b.click();b.click();})]);
      status(r,200);assert.deepEqual(r.request().postDataJSON(),{motivo});await expect(page.locator('#feedback-detalhe')).toContainText('Cancelamento confirmado');assert.equal(posts,1);
      assert.equal(sql(`SELECT motivo_cancelamento FROM reservas WHERE id=${massa.reservas[letra]}`),motivo);assert.deepEqual(snapshot(massa.reservas[letra]),{...antes,status:'CANCELADA',auditoria:antes.auditoria+1,outbox:antes.outbox+1});
      assert.deepEqual(erros,[]);await ctx.close();return{reserva:massa.reservas[letra],posts:1,motivoPersistido:true,semOverflow:true,errosJS:0,viewport};
    });
  }
  await caso('Ambiente pronto, massa anterior preservada e duas reservas próprias para aceite',async()=>{
    await pronto();for(const letra of ['F','G'])assert.equal(snapshot(massa.reservas[letra]).status,'APROVADA');
    return{paraAceite:{administradorEmReservaAlheia:massa.reservas.F,administradorDono:massa.reservas.G},sql:'Somente SELECT',ambientePronto:true};
  });resultado.concluido=true;
}
executar().catch(e=>{resultado.erro=sanitizar(e.message);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();for(const c of contextos)await c.dispose();resultado.fim=new Date().toISOString();resultado.resumo={PASS:resultado.cenarios.filter(c=>c.estado==='PASS').length,FAIL:resultado.cenarios.filter(c=>c.estado==='FAIL').length};salvar();console.log(JSON.stringify({pasta:path.relative(repo,pasta),concluido:resultado.concluido,resumo:resultado.resumo}));});
