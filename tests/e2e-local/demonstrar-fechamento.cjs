'use strict';

// Opt-in Windows: base NOVA no MySQL local identificado; nenhuma escrita no E2E principal.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { execFileSync, spawn } = require('node:child_process');
const { request } = require('@playwright/test');
const principal = require('./controle.cjs');
const { projetarRelatorio } = require('./evidencias.cjs');
const { repo, dir, ferramentas, comandos, estado } = principal;
const nonce = crypto.randomBytes(6).toString('hex');
const pasta = path.join(repo, '.aiox-core/local/fechamento-delegado', new Date().toISOString().replaceAll(/[:.]/g, '-'));
fs.mkdirSync(pasta, { recursive: true });
const database = 'qs_fechamento_' + nonce;
const usuarioDB = 'qsd_' + nonce, operadorDB = 'qso_' + nonce;
const senhaDB = crypto.randomBytes(24).toString('hex'), senhaOperador = crypto.randomBytes(24).toString('hex');
const senha = crypto.randomBytes(24).toString('hex');
const porta = 18082, baseURL = `http://127.0.0.1:${porta}`;
const jar = path.join(repo, 'backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar');
const java = path.join(ferramentas.jdk, 'bin/java.exe');
const mysql = path.join(ferramentas.mysql, 'bin/mysql.exe');
const rootIni = path.join(dir, 'root-client.ini'), opIni = path.join(pasta, 'operador-privado.ini');
const sqlProcedimento = fs.readFileSync(path.join(repo, 'docs/operacao/vinculos-responsaveis.sql'), 'utf8');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const arquivoEstado = path.join(pasta, 'instancia-privada.json');
const relatorio = { inicio: new Date().toISOString(), head: comandos.git(['rev-parse', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim(),
  branch: comandos.git(['branch', '--show-current'], {cwd: repo, encoding: 'utf8'}).trim(), arvore: 'Incremento local sem commit; artefatos identificados por digest',
  baseURL, database, camada: 'Spring/HTTP/MySQL e gateway simulado reais; nenhuma interceptação, Mockito ou WireMock', cenarios: [], hashes: {} };
for (const arquivo of ['docs/operacao/vinculos-responsaveis.sql','tests/e2e-local/demonstrar-fechamento.cjs',
  'backend/src/main/java/br/senac/recursos/notificacao/GatewayNotificacaoPadrao.java',
  'backend/src/main/java/br/senac/recursos/notificacao/ProcessadorNotificacoes.java',
  'backend/src/main/java/br/senac/recursos/notificacao/NotificacaoAgendamento.java',
  'backend/src/main/resources/static/js/aprovacoes.js','backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar']) {
  relatorio.hashes[arquivo] = hash(fs.readFileSync(path.join(repo, arquivo)));
}
const salvar = () => fs.writeFileSync(path.join(pasta, 'resultados.json'), JSON.stringify(projetarRelatorio(relatorio), null, 2) + '\n');
const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));
const normal = p => path.resolve(p).toLowerCase();
let instancia = null;
const contextos = [];
const registro = { database, porta, baseURL, nome: 'qs-fechamento-delegado-' + nonce, estado: 'PREPARANDO', processo: null };
const registrar = () => fs.writeFileSync(arquivoEstado, JSON.stringify(registro, null, 2) + '\n');
function sql(texto, operador = false) {
  try { return execFileSync(mysql, [`--defaults-file=${operador ? opIni : rootIni}`, '--batch', '--raw', '--skip-column-names',
    `--database=${database}`, '--default-character-set=utf8mb4'], {input: texto, encoding: 'utf8', windowsHide: true, shell: false,
    timeout: 10000, stdio: ['pipe','pipe','pipe']}).trim(); }
  catch (erro) { fs.appendFileSync(path.join(pasta,'mysql-erros-privados.log'),String(erro.stderr||'Comando recusado')+'\n');throw new Error('Comando MySQL recusado; confira a operação e a configuração privada.'); }
}
function processo(pid) {
  assert(Number.isSafeInteger(pid) && pid > 0);
  const json = comandos.powershell(['-NoProfile','-Command',
    `$p=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}'; if($p){$p|Select-Object ExecutablePath,CommandLine,CreationDate|ConvertTo-Json -Compress}`],
  {encoding:'utf8',timeout:10000});
  return json.trim() ? JSON.parse(json) : null;
}
function conferirProcesso(p) {
  assert(p && normal(p.ExecutablePath) === normal(java), 'Executável temporário divergente.');
  assert(p.CommandLine.includes(jar) && p.CommandLine.includes(`--server.port=${porta}`) && p.CommandLine.includes(registro.nome), 'Comando temporário divergente.');
  if (registro.processo?.criadoEm) assert.equal(p.CreationDate, registro.processo.criadoEm, 'PID reutilizado.');
}
async function livre() {
  await new Promise((resolve,reject) => { const s=net.createServer();s.once('error',reject);s.listen(porta,'127.0.0.1',()=>s.close(resolve)); });
}
async function parar() {
  if (!instancia) return;
  // O handle pertence ao spawn desta execução; nunca encerrar por um PID externo.
  const filho=instancia;
  if(registro.processo?.criadoEm){
    try{const p=processo(filho.pid);if(p)conferirProcesso(p);}
    catch{registro.verificacaoCimEncerramento='INDISPONIVEL_OU_DIVERGENTE_USADO_HANDLE_PROPRIO';}
  }
  if(filho.exitCode===null&&filho.signalCode===null)assert(filho.kill(),'Não foi possível encerrar o filho próprio.');
  for(let n=0;n<40&&filho.exitCode===null&&filho.signalCode===null;n++)await pausa(200);
  assert(filho.exitCode!==null||filho.signalCode!==null,'Filho próprio não confirmou encerramento.');
  await livre();instancia=null;
  registro.encerramento='HANDLE_FILHO_PROPRIO';
  registro.estado='ENCERRADA';registrar();
}
async function iniciar(worker) {
  await livre();
  const out=fs.openSync(path.join(pasta,'backend-stdout.log'),'a'),err=fs.openSync(path.join(pasta,'backend-stderr.log'),'a');
  try {
    instancia=spawn(java,['-jar',jar,`--server.port=${porta}`,'--server.address=127.0.0.1',`--spring.application.name=${registro.nome}`,
      '--server.servlet.session.cookie.name=QS_DELEGADO_SESSION',`--notificacoes.worker.enabled=${worker}`,'--notificacoes.gateway.url='],
    {cwd:repo,windowsHide:true,stdio:['ignore',out,err],env:{...process.env,
      DB_URL:`jdbc:mysql://127.0.0.1:${estado.mysqlPort}/${database}?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true`,
      DB_USER:usuarioDB,DB_PASSWORD:senhaDB,DEMO_ADMIN_EMAIL:`admin-${nonce}@example.test`,DEMO_ADMIN_SENHA:senha,
      SPRING_PROFILES_ACTIVE:'local',RECURSOS_API_ENABLED:'true',RESERVAS_API_ENABLED:'true',MOVIMENTACOES_API_ENABLED:'true',
      NOTIFICACOES_GATEWAY_URL:'',NOTIFICACOES_WORKER_ENABLED:String(worker)}});
    instancia.on('error',()=>{registro.estado='FALHA_PROCESSO';registrar();});
  } finally {fs.closeSync(out);fs.closeSync(err);}
  assert(Number.isSafeInteger(instancia.pid),'Java não iniciou.');registro.processo={pid:instancia.pid,worker,criadoEm:null};registrar();
  if(process.argv.includes('--verificar-falha-inicial'))throw new Error('Falha inicial controlada após spawn, antes de CIM.');
  for(let n=0;n<30;n++){
    const p=processo(instancia.pid);if(p){conferirProcesso(p);registro.processo.criadoEm=p.CreationDate;registrar();break;}await pausa(200);
  }
  assert(registro.processo.criadoEm,'Não foi possível identificar Java.');
  const limite=Date.now()+75000;
  while(Date.now()<limite){
    assert(instancia.exitCode===null,'Java temporário encerrou antes da prontidão.');
    try {const r=await fetch(baseURL+'/api/auth/csrf',{signal:AbortSignal.timeout(1500)});if(r.status===200){registro.estado='PRONTO';registrar();return;}} catch { /* Somente leitura de prontidão. */ }
    await pausa(1000);
  }
  throw new Error('Tempo de prontidão excedido; veja logs privados.');
}
async function caso(nome,acao){
  try{const evidencia=await acao();relatorio.cenarios.push({nome,estado:'PASS',evidencia});salvar();console.log('PASS '+nome);}
  catch(e){relatorio.cenarios.push({nome,estado:'FAIL',erro:String(e.message).replaceAll(senha,'[REMOVIDO]').replaceAll(senhaDB,'[REMOVIDO]').replaceAll(senhaOperador,'[REMOVIDO]')});salvar();throw new Error('Falha no cenário '+nome);}
}
async function novaApi(){const c=await request.newContext({baseURL});contextos.push(c);return c;}
async function escrever(api,metodo,rota,dados,form=false){
  const r=await api.get('/api/auth/csrf');assert.equal(r.status(),200);const csrf=await r.json();
  return api.fetch(rota,{method:metodo,headers:{[csrf.header]:csrf.token,'X-Correlation-Id':'delegado-'+nonce},
    ...(dados===undefined?{}:form?{form:dados}:{data:dados})});
}
async function resposta(r,status){assert.equal(r.status(),status,'HTTP esperado '+status);return status===204?null:r.json();}
async function login(api,email,papel){await resposta(await escrever(api,'POST','/api/auth/login',{email,senha},true),204);const me=await resposta(await api.get('/api/auth/me'),200);assert.equal(me.papel,papel);return me.usuarioId;}
function operar(usuario,recurso,acao,referencia='DEMO-'+nonce){
  assert(Number.isSafeInteger(usuario)&&Number.isSafeInteger(recurso));assert(['CONCEDER','REVOGAR','INVALIDA'].includes(acao));
  assert(/^[A-Za-z0-9._-]*$/.test(referencia));
  const saida=sql(`SET @usuario_id=${usuario},@recurso_id=${recurso},@acao='${acao}',@referencia='${referencia}';\n${sqlProcedimento}`,true);
  const [resultado,base,operador,momento,acaoEfetiva,uid,rid,ref,antes,depois]=saida.split(/\r?\n/).at(-1).split('\t');
  assert.equal(base,database);assert.equal(Number(uid),usuario);assert.equal(Number(rid),recurso);
  return {resultado,base,operador,momento,acao:acaoEfetiva,usuarioId:+uid,recursoId:+rid,referencia:ref,antes:+antes,depois:+depois};
}
async function executar(){
  await principal.pronto();assert.notEqual(porta,estado.backendPort);assert.notEqual(porta,estado.mysqlPort);await livre();
  const principalEstado=fs.readFileSync(path.join(dir,'state.json'));
  const snapshot=()=>hash(principal.sql('SELECT id,reserva_id,evento,status_envio,tentativas,atualizado_em,correlacao_id FROM notificacoes ORDER BY id'));
  const antes=snapshot();const ids={};
  relatorio.principalAntes={algoritmo:'SHA-256',estadoDigest:hash(principalEstado),outboxDigest:antes};
  let erroOriginal=null;
  try{
    await caso('Base exclusiva, identidade MySQL e contas segregadas',async()=>{
      assert.equal(principal.sql(`SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name='${database}'`),'0');
      execFileSync(mysql,[`--defaults-file=${rootIni}`,'--batch'],{input:`CREATE DATABASE ${database} CHARACTER SET utf8mb4; CREATE USER '${usuarioDB}'@'127.0.0.1' IDENTIFIED BY '${senhaDB}'; GRANT ALL PRIVILEGES ON ${database}.* TO '${usuarioDB}'@'127.0.0.1'; CREATE USER '${operadorDB}'@'127.0.0.1' IDENTIFIED BY '${senhaOperador}';`,encoding:'utf8',windowsHide:true,shell:false,timeout:10000,stdio:['pipe','pipe','pipe']});
      fs.writeFileSync(opIni,`[client]\nhost=127.0.0.1\nport=${estado.mysqlPort}\nuser=${operadorDB}\npassword=${senhaOperador}\nprotocol=TCP\n`);
      fs.writeFileSync(path.join(pasta,'credenciais-privadas.json'),JSON.stringify({database,usuarioDB,senhaDB,operadorDB,senhaOperador,senha,admin:`admin-${nonce}@example.test`},null,2));
      await iniciar(false);
      assert.equal(sql('SELECT COUNT(*) FROM notificacoes'),'0');
      sql(`GRANT SELECT(id,perfil,ativo),UPDATE(id) ON ${database}.usuarios TO '${operadorDB}'@'127.0.0.1'; GRANT SELECT(id,codigo,ativo),UPDATE(id) ON ${database}.recursos TO '${operadorDB}'@'127.0.0.1'; GRANT SELECT,INSERT,DELETE,UPDATE(recurso_id) ON ${database}.responsaveis_recursos TO '${operadorDB}'@'127.0.0.1';`);
      assert.equal(sql('SELECT COUNT(*) FROM flyway_schema_history WHERE success=1'),'7');
      return {database,porta,migracoes:7,workerInicial:false,gateway:'SIMULADO_URL_VAZIA',contas:'runtime/migração da base descartável e operador de vínculos separados'};
    });
    const admin=await novaApi(),sol=await novaApi(),resp=await novaApi(),outro=await novaApi();
    await caso('Três perfis reais, recursos e sessão/CSRF na mesma origem',async()=>{
      ids.admin=await login(admin,`admin-${nonce}@example.test`,'ADMINISTRADOR');
      for(const [chave,perfil]of [['sol','SOLICITANTE'],['resp','RESPONSAVEL'],['outro','SOLICITANTE']]){
        const u=await resposta(await escrever(admin,'POST','/api/usuarios',{nome:'Demonstração '+chave,email:`${chave}-${nonce}@example.test`,senha,perfil}),201);ids[chave]=u.id;
      }
      await login(sol,`sol-${nonce}@example.test`,'SOLICITANTE');await login(resp,`resp-${nonce}@example.test`,'RESPONSAVEL');await login(outro,`outro-${nonce}@example.test`,'SOLICITANTE');
      await resposta(await escrever(admin,'PUT','/api/horarios-funcionamento',{janelas:['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(dia=>({dia,inicio:'00:00:00',fim:'23:59:59.999999'}))}),200);
      for(const chave of ['a','b'])ids[chave]=(await resposta(await escrever(admin,'POST','/api/recursos',{tipo:'MATERIAL',codigo:'DELEGADO-'+chave+'-'+nonce,ativo:true,restrito:true,patrimonio:'PAT-'+chave+'-'+nonce,descricao:'Material demonstrativo',condicao:'BOM'}),201)).id;
      const inicio=new Date(Date.now()+3600000),fim=new Date(inicio.getTime()+600000);assert.equal(inicio.toISOString().slice(0,10),fim.toISOString().slice(0,10));
      const reserva=await resposta(await escrever(sol,'POST','/api/reservas',{inicio:inicio.toISOString(),fim:fim.toISOString(),recursosIds:[ids.a,ids.b]}),201);ids.reserva=reserva.id;assert.equal(reserva.status,'SOLICITADA');
      assert.match(reserva.inicio,/-03:00$/);return {usuarios:4,perfis:3,recursos:[ids.a,ids.b],reservaId:ids.reserva,estado:reserva.status,offset:'-03:00'};
    });
    await caso('Procedimento recusa parâmetros e concessão incompatível sem efeitos',async()=>{
      assert.equal(operar(ids.sol,ids.a,'CONCEDER').resultado,'RECUSADO_USUARIO');
      assert.equal(operar(ids.resp,ids.a,'INVALIDA').resultado,'RECUSADO_PARAMETROS');
      assert.equal(operar(ids.resp,ids.a,'CONCEDER','').resultado,'RECUSADO_PARAMETROS');
      assert.equal(operar(ids.resp,2147483647,'CONCEDER').resultado,'RECUSADO_ALVO');
      assert.equal(operar(0,ids.a,'CONCEDER').resultado,'RECUSADO_PARAMETROS');
      assert.equal(operar(ids.resp,-1,'CONCEDER').resultado,'RECUSADO_PARAMETROS');
      sql(`UPDATE usuarios SET ativo=FALSE WHERE id=${ids.resp}`);assert.equal(operar(ids.resp,ids.a,'CONCEDER').resultado,'RECUSADO_USUARIO');sql(`UPDATE usuarios SET ativo=TRUE WHERE id=${ids.resp}`);
      sql(`UPDATE recursos SET ativo=FALSE WHERE id=${ids.a}`);assert.equal(operar(ids.resp,ids.a,'CONCEDER').resultado,'RECUSADO_RECURSO');sql(`UPDATE recursos SET ativo=TRUE WHERE id=${ids.a}`);
      assert.equal(sql('SELECT COUNT(*) FROM responsaveis_recursos'),'0');
      assert.throws(()=>sql(`UPDATE usuarios SET perfil='ADMINISTRADOR' WHERE id=${ids.resp}`,true));
      assert.throws(()=>sql(`SELECT senha_hash FROM usuarios WHERE id=${ids.resp}`,true));
      assert.throws(()=>sql(`SELECT email FROM usuarios WHERE id=${ids.resp}`,true));
      return {negativas:8,idsInvalidos:[0,-1],vinculos:0,operadorNaoAlteraPapel:true,operadorNaoLeHashOuEmail:true};
    });
    await caso('Q9 sem vínculo e parcial; concessão idempotente no par autorizado',async()=>{
      await resposta(await resp.get('/api/reservas/'+ids.reserva),404);await resposta(await outro.get('/api/reservas/'+ids.reserva),404);
      await resposta(await sol.get('/api/reservas/'+ids.reserva),200);await resposta(await admin.get('/api/reservas/'+ids.reserva),200);
      const operacao=operar(ids.resp,ids.a,'CONCEDER');assert.equal(operacao.resultado,'CONCEDIDO');
      const repetida=operar(ids.resp,ids.a,'CONCEDER');assert.equal(repetida.antes,1);assert.equal(repetida.depois,1);
      await resposta(await resp.get('/api/reservas/'+ids.reserva),404);return {operacao,repetida,parcial:404,outroSolicitante:404,dono:200,administrador:200};
    });
    await caso('Vínculo completo, revogação efetiva e reconcessão antes da aprovação',async()=>{
      const concessao=operar(ids.resp,ids.b,'CONCEDER');assert.equal(concessao.resultado,'CONCEDIDO');await resposta(await resp.get('/api/reservas/'+ids.reserva),200);
      const fila=await resposta(await resp.get('/api/reservas?status=SOLICITADA'),200);assert.equal(fila.total,1);
      const revogacao=operar(ids.resp,ids.b,'REVOGAR');assert.equal(revogacao.depois,0);await resposta(await resp.get('/api/reservas/'+ids.reserva),404);
      const negado=await resposta(await escrever(resp,'POST',`/api/reservas/${ids.reserva}/aprovacao`),403);assert.equal(negado.codigo,'OPERACAO_NAO_PERMITIDA');
      assert.equal(sql(`SELECT status FROM reservas WHERE id=${ids.reserva}`),'SOLICITADA');
      const ausente=operar(ids.resp,ids.b,'REVOGAR');assert.equal(ausente.antes,0);assert.equal(ausente.depois,0);
      operar(ids.resp,ids.b,'CONCEDER');const aprovada=await resposta(await escrever(resp,'POST',`/api/reservas/${ids.reserva}/aprovacao`),200);assert.equal(aprovada.status,'APROVADA');
      return {concessao,revogacao,revogacaoIdempotente:ausente,leituraRevogada:404,decisaoRevogada:403,reconcessaoAprovacao:200};
    });
    await caso('Revogação limpa vínculo obsoleto sem ampliar permissões',async()=>{
      sql(`UPDATE usuarios SET ativo=FALSE WHERE id=${ids.resp}`);const a=operar(ids.resp,ids.a,'REVOGAR');assert.equal(a.resultado,'REVOGADO');
      sql(`UPDATE usuarios SET perfil='SOLICITANTE' WHERE id=${ids.resp}`);const b=operar(ids.resp,ids.b,'REVOGAR');assert.equal(b.resultado,'REVOGADO');
      assert.equal(sql('SELECT COUNT(*) FROM responsaveis_recursos'),'0');sql(`UPDATE usuarios SET perfil='RESPONSAVEL',ativo=TRUE WHERE id=${ids.resp}`);
      return {usuarioInativo:a,perfilAlterado:b,vinculosFinais:0};
    });
    let eventos;
    await caso('RF11: outbox pendente após commit e auditoria reais',async()=>{
      eventos=sql(`SELECT id,evento,status_envio,tentativas,correlacao_id,DATE_FORMAT(criado_em,'%Y-%m-%dT%H:%i:%s.%fZ'),COALESCE(DATE_FORMAT(enviado_em,'%Y-%m-%dT%H:%i:%s.%fZ'),'AUSENTE') FROM notificacoes WHERE reserva_id=${ids.reserva} ORDER BY id`).split(/\r?\n/).map(l=>{const[id,evento,status,tentativas,correlacaoId,criadoEm,enviadoEm]=l.split('\t');return{id:+id,evento,status,tentativas:+tentativas,correlacaoId,criadoEm,enviadoEm};});
      assert.equal(eventos.length,2);assert(eventos.every(e=>e.status==='PENDENTE'&&e.tentativas===0));
      assert(eventos.every(e=>/^[A-Za-z0-9._-]{1,64}$/.test(e.correlacaoId)&&e.enviadoEm==='AUSENTE'));
      for(const e of eventos){
        const acao=e.evento==='RESERVA_CRIADA'?'CRIACAO':'APROVACAO';
        assert.equal(sql(`SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA' AND entidade_id=${ids.reserva} AND acao='${acao}' AND correlacao_id='${e.correlacaoId}'`),'1');
      }
      assert.equal(sql(`SELECT COUNT(*) FROM auditoria WHERE entidade='RESERVA' AND entidade_id=${ids.reserva} AND acao IN ('CRIACAO','APROVACAO')`),'2');
      return {eventos,auditorias:2,worker:false};
    });
    await caso('RF11: worker e gateway simulado reais processam somente a base nova',async()=>{
      await parar();await iniciar(true);const limite=Date.now()+65000;
      while(Date.now()<limite){if(sql("SELECT COUNT(*) FROM notificacoes WHERE status_envio<>'ENVIADA'")==='0')break;await pausa(1000);}
      assert.equal(sql("SELECT COUNT(*) FROM notificacoes WHERE status_envio<>'ENVIADA'"),'0');
      const log=fs.readFileSync(path.join(pasta,'backend-stdout.log'),'utf8');
      const provas=eventos.map(e=>{
        assert(log.includes(`Notificacao simulada id=${e.id} evento=${e.evento} reserva=${ids.reserva}`));
        const[correlacaoId,criadoEm,enviadoEm]=sql(`SELECT correlacao_id,DATE_FORMAT(criado_em,'%Y-%m-%dT%H:%i:%s.%fZ'),DATE_FORMAT(enviado_em,'%Y-%m-%dT%H:%i:%s.%fZ') FROM notificacoes WHERE id=${e.id} AND reserva_id=${ids.reserva} AND enviado_em>=criado_em`).split('\t');
        assert.equal(correlacaoId,e.correlacaoId);assert.equal(criadoEm,e.criadoEm);assert(enviadoEm&&Date.parse(enviadoEm)>=Date.parse(criadoEm));
        return{id:e.id,evento:e.evento,reservaId:ids.reserva,correlacaoId,criadoEm,enviadoEm,logSimuladoEncontrado:true};
      });
      assert.equal(sql('SELECT COUNT(*) FROM notificacoes WHERE tentativas=1 AND enviado_em IS NOT NULL'),'2');
      return {gateway:'GatewayNotificacaoPadrao URL vazia',worker:'NotificacaoAgendamento real',destino:'SIMULACAO_LOCAL_SEM_REDE_EMAIL',eventos:provas,estado:'ENVIADA',tentativas:1};
    });
  } catch(e) {erroOriginal=e;throw e;} finally {
    const falhas=[];const isolamento={baseDemoPreservada:database};
    const disposicoes=await Promise.allSettled(contextos.map(c=>c.dispose()));
    if(disposicoes.some(r=>r.status==='rejected'))falhas.push('Falha ao encerrar contexto HTTP.');
    try{await parar();isolamento.temporariaEncerrada=true;}catch{falhas.push('Falha ao encerrar temporária.');}
    try{assert(fs.readFileSync(path.join(dir,'state.json')).equals(principalEstado));isolamento.estadoPrincipalPreservado=true;}catch{falhas.push('Estado principal divergente.');}
    try{await principal.pronto();isolamento.principalPronto=true;}catch{falhas.push('Principal não confirmou prontidão.');}
    try{
      const depois=snapshot();relatorio.principalDepois={algoritmo:'SHA-256',estadoDigest:hash(fs.readFileSync(path.join(dir,'state.json'))),outboxDigest:depois};
      if(depois===antes)isolamento.outboxPrincipalPreservada=true;
      else{isolamento.outboxPrincipalPreservada=false;falhas.push('Digest da outbox principal divergente.');}
    }catch{isolamento.inspecaoOutbox='INDISPONIVEL';falhas.push('Inspeção da outbox principal indisponível.');}
    relatorio.isolamento=isolamento;
    if(falhas.length)relatorio.falhasDeEncerramento=falhas;
    salvar();
    if(falhas.length&&!erroOriginal)throw new Error(falhas.join(' '));
  }
}
executar().then(()=>{relatorio.fim=new Date().toISOString();relatorio.resumo={PASS:relatorio.cenarios.filter(c=>c.estado==='PASS').length,FAIL:0};salvar();console.log(JSON.stringify({pasta:path.relative(repo,pasta),resumo:relatorio.resumo}));})
  .catch(e=>{relatorio.fim=new Date().toISOString();relatorio.resumo={PASS:relatorio.cenarios.filter(c=>c.estado==='PASS').length,FAIL:relatorio.cenarios.filter(c=>c.estado==='FAIL').length||1};relatorio.erro=e.message;salvar();console.error('Demonstração não concluída; confira resultados e logs privados.');process.exitCode=1;});
