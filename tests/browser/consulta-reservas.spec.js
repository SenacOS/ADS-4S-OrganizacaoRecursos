import { test as base, expect } from '@playwright/test';

// Regressão do frontend com API controlada. E2E Spring/MySQL registrado separadamente.
const test=base.extend({page:async({page},use)=>{const erros=[];page.on('pageerror',e=>erros.push(e.message));await use(page);expect(erros).toEqual([]);}});
test.use({timezoneId:'Asia/Tokyo'});
const rota='/pages/minhas-reservas.html';
const copiar=(v)=>JSON.parse(JSON.stringify(v));
const reserva={id:31,solicitanteId:7,status:'APROVADA',restrita:false,inicio:'2026-11-12T13:00:07.123456-03:00',fim:'2026-11-12T14:00:08.987654-03:00',recursosIds:[11,12],motivoDecisao:null,
  solicitante:{usuarioId:7,identificacao:'Solicitante 7'},recursos:[{id:11,tipo:'SALA',identificacao:'Sala A'},{id:12,tipo:'MATERIAL',identificacao:'Projetor',patrimonio:'PAT-1'}]};
const rec=(id,disponivel=true)=>({id,dados:{tipo:'SALA',codigo:'SALA-'+id,ativo:true,restrito:false,capacidade:20,localizacao:'Bloco A'},disponivel});
async function preparar(page,opcoes={}){
  const estado={papel:'SOLICITANTE',usuarioId:7,autenticado:true,registro:copiar(reserva),consultas:[],escritas:[],
    falhaLista:0,falhaDetalhe:0,falhaEscrita:0,incoerente:false,falhaAposEscrita:false,esperarEscrita:null,esperarLista:null,recursoRestrito:false,inesperadas:[],...opcoes};
  const falhar=(route,status)=>route.fulfill({status,json:{codigo:status===401?'NAO_AUTENTICADO':'ERRO_TESTE',mensagem:'<b>Confira a reserva.</b>',correlationId:'consulta-suporte-1'}});
  await page.route('**/api/**',async route=>{
    const req=route.request(),url=new URL(req.url()),p=url.pathname;
    if(p==='/api/auth/me')return estado.autenticado?route.fulfill({json:{usuarioId:estado.usuarioId,email:'teste@example.test',papel:estado.papel}}):falhar(route,401);
    if(p==='/api/auth/csrf')return route.fulfill({json:{header:'X-CSRF-REAL-NOME',token:'token-teste'}});
    if(req.method()==='GET'){
      estado.consultas.push(p+url.search);
      if(p==='/api/reservas'){
        if(estado.esperarLista)await estado.esperarLista;
        if(estado.falhaLista)return falhar(route,estado.falhaLista);
        const pagina=Number(url.searchParams.get('pagina')),tamanho=Number(url.searchParams.get('tamanho'));
        return route.fulfill({json:{itens:pagina===0?[estado.registro]:[],pagina,tamanho,total:21}});
      }
      if(p==='/api/reservas/31'){
        if(estado.falhaDetalhe||(estado.falhaAposEscrita&&estado.escritas.length))return falhar(route,estado.falhaDetalhe||503);
        return route.fulfill({json:estado.registro});
      }
      if(p==='/api/recursos'){
        const pagina=Number(url.searchParams.get('pagina'));
        const novo=rec(13);novo.dados.restrito=estado.recursoRestrito;
        return route.fulfill({json:{itens:pagina===0?[rec(11,false),novo,rec(14,false)]:[rec(15)],pagina,tamanho:20,total:21}});
      }
    }else if((p==='/api/reservas/31'&&req.method()==='PATCH')||p==='/api/reservas/31/cancelamento'){
      estado.escritas.push({metodo:req.method(),p,body:req.postData()?req.postDataJSON():undefined,headers:req.headers()});
      if(estado.esperarEscrita)await estado.esperarEscrita;
      if(estado.falhaEscrita)return falhar(route,estado.falhaEscrita);
      if(estado.incoerente)return route.fulfill({json:{...estado.registro,id:999}});
      if(req.method()==='PATCH'){
        const corpo=req.postDataJSON();estado.registro={...estado.registro,...corpo,recursos:corpo.recursosIds.map(id=>estado.registro.recursos.find(r=>r.id===id)||{id,tipo:'SALA',identificacao:'SALA-'+id})};
      }else estado.registro={...estado.registro,status:'CANCELADA'};
      return route.fulfill({json:estado.registro});
    }
    estado.inesperadas.push(req.method()+' '+p);return falhar(route,404);
  });return estado;
}
async function abrir(page,opcoes){const estado=await preparar(page,opcoes);await page.goto(rota);await expect(page.locator('#lista-reservas .resource-card')).toHaveCount(1);return estado;}
async function detalhe(page){await page.getByRole('button',{name:'Consultar reserva 31',exact:true}).click();await expect(page.locator('#detalhe-reserva')).toBeVisible();}

test('lista pagina no servidor, aplica filtros completos e não envia identidade',async({page})=>{
  const e=await abrir(page);await page.locator('#seguinte-reservas').click();await expect(page.locator('#resumo-reservas')).toContainText('Total: 21');
  await page.locator('#filtro-status').selectOption('SOLICITADA');await page.locator('#filtro-inicio').fill('2026-11-12T10:00');await page.locator('#filtro-fim').fill('2026-11-13T10:00');await page.locator('#filtro-recurso').fill('11');
  await page.getByRole('button',{name:'Consultar reservas',exact:true}).click();await expect(page.locator('#lista-reservas .resource-card')).toHaveCount(1);
  const p=new URL('http://teste'+e.consultas.at(-1)).searchParams;expect(Object.fromEntries(p)).toEqual({pagina:'0',tamanho:'20',status:'SOLICITADA',inicio:'2026-11-12T10:00:00-03:00',fim:'2026-11-13T10:00:00-03:00',recursoId:'11'});
});
test('intervalo submilissegundo pode ser consultado e salvo sem truncar os originais',async({page})=>{
  const registro={...reserva,inicio:'2026-11-12T13:00:07.123001-03:00',fim:'2026-11-12T13:00:07.123002-03:00'};
  const e=await abrir(page,{registro});await detalhe(page);await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();
  await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');expect(e.escritas[0].body).toEqual({inicio:registro.inicio,fim:registro.fim,recursosIds:[11,12]});
});
test('detalhe GET preserva todos os recursos e frações no PATCH sem editar campos',async({page})=>{
  const e=await abrir(page);await detalhe(page);await expect(page.locator('#selecionados-edicao li')).toHaveCount(2);
  expect(e.consultas).toContain('/api/reservas/31');await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();
  await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');expect(e.escritas).toHaveLength(1);
  expect(e.escritas[0].body).toEqual({inicio:reserva.inicio,fim:reserva.fim,recursosIds:[11,12]});expect(e.escritas[0].headers['x-csrf-real-nome']).toBe('token-teste');
});
test('seleção original ocupada sobrevive à pesquisa e às páginas; novos indisponíveis não entram',async({page})=>{
  const e=await abrir(page);await detalhe(page);await page.getByRole('button',{name:'Pesquisar recursos para edição',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Selecionar recurso 11',exact:true})).toBeChecked();
  await expect(page.getByRole('checkbox',{name:'Selecionar recurso 11',exact:true})).toBeEnabled();
  await expect(page.getByRole('checkbox',{name:'Selecionar recurso 14',exact:true})).toBeDisabled();
  await page.getByRole('checkbox',{name:'Selecionar recurso 13',exact:true}).check();await page.locator('#seguinte-edicao').click();
  await page.getByRole('checkbox',{name:'Selecionar recurso 15',exact:true}).check();await expect(page.locator('#selecionados-edicao li')).toHaveCount(4);
  await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');
  expect(e.escritas[0].body.recursosIds).toEqual([11,12,13,15]);
});
test('remover todos permite pesquisar e selecionar substituto antes de salvar',async({page})=>{
  await abrir(page);await detalhe(page);await page.getByRole('button',{name:'Remover recurso 11',exact:true}).click();await page.getByRole('button',{name:'Remover recurso 12',exact:true}).click();
  await expect(page.locator('#salvar-reserva')).toBeDisabled();await page.getByRole('button',{name:'Pesquisar recursos para edição',exact:true}).click();
  await page.getByRole('checkbox',{name:'Selecionar recurso 13',exact:true}).check();await expect(page.locator('#salvar-reserva')).toBeEnabled();
});
test('reserva comum não oferece inclusão de recurso novo que exige aprovação',async({page})=>{
  await abrir(page,{recursoRestrito:true});await detalhe(page);await page.getByRole('button',{name:'Pesquisar recursos para edição',exact:true}).click();
  await expect(page.getByRole('checkbox',{name:'Selecionar recurso 13',exact:true})).toBeDisabled();
  await expect(page.locator('#resultados-edicao')).toContainText('Este recurso exige aprovação');
  await expect(page.locator('#selecionados-edicao li')).toHaveCount(2);
});
test('alterar um horário preserva o outro e invalida confirmação anterior',async({page})=>{
  const e=await abrir(page);await detalhe(page);await page.locator('#confirmar-edicao').check();await page.locator('#editar-inicio').fill('2026-11-12T13:30:05.125');
  await expect(page.locator('#confirmar-edicao')).not.toBeChecked();await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();
  await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');expect(e.escritas[0].body).toMatchObject({inicio:'2026-11-12T13:30:05.125-03:00',fim:reserva.fim});
});
for(const papel of ['RESPONSAVEL','ADMINISTRADOR'])test(papel+' não herda edição de reserva alheia',async({page})=>{
  const e=await abrir(page,{papel,usuarioId:9});await detalhe(page);await expect(page.locator('#form-edicao-reserva')).toBeHidden();
  await expect(page.locator('#form-cancelar-reserva')).toBeVisible({visible:papel==='ADMINISTRADOR'});
  await page.locator('#form-edicao-reserva').dispatchEvent('submit');expect(e.escritas).toHaveLength(0);
});
test('cancelamento requer conferência e confirma alvo/estado sem remover histórico',async({page})=>{
  const e=await abrir(page);await detalhe(page);await page.locator('#cancelar-reserva').click();expect(e.escritas).toHaveLength(0);
  await page.locator('#confirmar-cancelar').check();await page.locator('#cancelar-reserva').click();await expect(page.locator('#feedback-detalhe')).toContainText('Cancelamento confirmado');
  await expect(page.locator('#dados-reserva')).toContainText('CANCELADA');await expect(page.locator('#form-cancelar-reserva')).toBeHidden();
  expect(e.escritas).toHaveLength(1);expect(e.escritas[0]).toMatchObject({metodo:'POST',p:'/api/reservas/31/cancelamento',body:undefined});
});
test('estado EM_USO não oferece edição ou cancelamento',async({page})=>{
  await abrir(page,{registro:{...copiar(reserva),status:'EM_USO'}});await detalhe(page);
  await expect(page.locator('#form-edicao-reserva')).toBeHidden();await expect(page.locator('#form-cancelar-reserva')).toBeHidden();
});
test('falha 404 no detalhe não habilita ações nem expõe a lista como detalhe',async({page})=>{
  const e=await abrir(page,{falhaDetalhe:404});await page.getByRole('button',{name:'Consultar reserva 31',exact:true}).click();
  await expect(page.locator('#feedback-detalhe')).toContainText('Confira a reserva');await expect(page.locator('#detalhe-reserva')).toBeHidden();expect(e.escritas).toHaveLength(0);
});
test('consulta falha encerra carregamento e permite recuperação por GET',async({page})=>{
  const e=await preparar(page,{falhaLista:503});await page.goto(rota);await expect(page.locator('#resumo-reservas')).toContainText('Consulta não concluída');
  e.falhaLista=0;await page.locator('#atualizar-lista').click();await expect(page.locator('#lista-reservas .resource-card')).toHaveCount(1);
});
for(const tipo of ['incoerente','conflito'])test(tipo+' não repete escrita; nova tentativa exige GET detalhe e conferência',async({page})=>{
  const e=await abrir(page);await detalhe(page);e.incoerente=tipo==='incoerente';e.falhaEscrita=tipo==='conflito'?409:0;
  await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();await expect(page.locator('#feedback-detalhe')).toContainText('Atualize o detalhe');
  await page.locator('#form-edicao-reserva').dispatchEvent('submit');expect(e.escritas).toHaveLength(1);
  e.incoerente=false;e.falhaEscrita=0;await page.locator('#reconsultar-reserva').click();await expect(page.locator('#salvar-reserva')).toBeEnabled();
  await expect(page.locator('#confirmar-edicao')).not.toBeChecked();await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();
  await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');expect(e.escritas).toHaveLength(2);
});
test('GET falho após escrita confirmada mantém sucesso e impede reenvio',async({page})=>{
  const e=await abrir(page,{falhaAposEscrita:true});await detalhe(page);await page.locator('#confirmar-edicao').check();await page.locator('#salvar-reserva').click();
  await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');await expect(page.locator('#detalhe-reserva')).toBeHidden();
  await page.locator('#form-edicao-reserva').dispatchEvent('submit');expect(e.escritas).toHaveLength(1);
});
test('duplo submit mantém uma escrita durante a resposta pendente',async({page})=>{
  const e=await abrir(page);await detalhe(page);let liberar;e.esperarEscrita=new Promise(r=>{liberar=r;});await page.locator('#confirmar-edicao').check();
  await page.locator('#salvar-reserva').click();await page.locator('#form-edicao-reserva').dispatchEvent('submit');expect(e.escritas).toHaveLength(1);
  liberar();await expect(page.locator('#feedback-detalhe')).toContainText('Alteração confirmada');
});
test('sem sessão redireciona antes de consultar reservas',async({page})=>{
  const e=await preparar(page,{autenticado:false});await page.goto(rota);await expect(page).toHaveURL(/login.html\?sessao=expirada$/);expect(e.consultas).toEqual([]);
});
test('textos da API são literais e página/detalhe cabem no viewport com foco',async({page})=>{
  await abrir(page,{registro:{...copiar(reserva),solicitante:{usuarioId:7,identificacao:'<img src=x> Solicitante'}}});await detalhe(page);
  await expect(page.locator('#detalhe-reserva')).toBeFocused();await expect(page.locator('#dados-reserva img')).toHaveCount(0);
  await expect(page.locator('#dados-reserva')).toContainText('<img src=x>');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
