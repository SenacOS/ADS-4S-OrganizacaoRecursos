import test from 'node:test';
import assert from 'node:assert/strict';
import { conferirReserva, parametrosReservas, podeEditarReserva, podeCancelarReserva, criarConsultaReservas, paraCampoReserva, horarioDaEdicao } from '../../../backend/src/main/resources/static/js/consulta-reservas.js';

const usuario={usuarioId:7,email:'teste@example.test',papel:'SOLICITANTE'};
const r={id:31,solicitanteId:7,status:'APROVADA',restrita:false,inicio:'2026-11-12T13:00:07.123456789-03:00',fim:'2026-11-12T14:00:08.987654321-03:00',
  recursosIds:[11,12],motivoDecisao:null,solicitante:{usuarioId:7,identificacao:'Solicitante 7'},
  recursos:[{id:11,tipo:'SALA',identificacao:'Sala A'},{id:12,tipo:'MATERIAL',identificacao:'Projetor',patrimonio:'PAT-1'}]};
function preparar(resposta,u=usuario){const chamadas=[];return {chamadas,cliente:criarConsultaReservas(u,{limparCsrf(){},async requisitar(url,opcoes){chamadas.push({url,...opcoes});return resposta;}})};}

test('intervalo submilissegundo válido permanece legível e editável; igual/invertido é recusado',async()=>{
  const curto={...r,inicio:'2026-11-12T13:00:07.123001-03:00',fim:'2026-11-12T13:00:07.123002-03:00'};
  assert.deepEqual(conferirReserva(curto),curto);assert.equal(parametrosReservas(curto).get('fim'),curto.fim);
  const p=preparar(curto);await p.cliente.editar(curto,curto);assert.equal(p.chamadas[0].body.fim,curto.fim);
  for(const fim of [curto.inicio,'2026-11-12T13:00:07.123000-03:00']){
    assert.throws(()=>conferirReserva({...curto,fim}),{codigo:'RESPOSTA_INVALIDA'});
    assert.throws(()=>parametrosReservas({...curto,fim}),{codigo:'REQUISICAO_INVALIDA'});
  }
});

test('leitura projeta somente contrato e exige correspondência completa dos recursos',()=>{
  assert.deepEqual(conferirReserva({...r,email:'privado',solicitante:{...r.solicitante,contato:'privado'}}),r);
  for(const v of [null,{...r,id:0},{...r,status:'NOVO'},{...r,solicitante:{usuarioId:8,identificacao:'x'}},
    {...r,recursosIds:[11,11]},{...r,recursos:[r.recursos[0]]},{...r,recursos:[r.recursos[0],r.recursos[0]]},
    {...r,inicio:'2026-02-30T10:00-03:00'},{...r,fim:r.inicio}])assert.throws(()=>conferirReserva(v),{codigo:'RESPOSTA_INVALIDA'});
});
test('consulta codifica só filtros contratados, inclusive período multidia; identidade não é filtro',()=>{
  const p=parametrosReservas({status:'CANCELADA',inicio:r.inicio,fim:'2026-11-13T14:00:00-03:00',recursoId:11,pagina:2,tamanho:50,usuarioId:99,papel:'ADMINISTRADOR'});
  assert.deepEqual([...p.keys()],['pagina','tamanho','status','inicio','fim','recursoId']);assert.equal(p.get('pagina'),'2');
  assert.equal(p.get('inicio'),r.inicio);assert.equal(parametrosReservas().toString(),'pagina=0&tamanho=20');
  for(const f of [{status:'x'},{pagina:-1},{tamanho:101},{recursoId:0},{inicio:r.inicio},{inicio:r.fim,fim:r.inicio}])assert.throws(()=>parametrosReservas(f),{codigo:'REQUISICAO_INVALIDA'});
});
test('listagem preserva total/página vazia, rejeita duplicação, envelope e vazamento de outro Solicitante',async()=>{
  const vazio={itens:[],pagina:3,tamanho:20,total:1};assert.deepEqual(await preparar(vazio).cliente.listar({pagina:3}),vazio);
  for(const v of [{itens:[r],pagina:0,tamanho:20,total:0},{itens:[r,r],pagina:0,tamanho:20,total:2},
    {itens:[{...r,solicitanteId:8,solicitante:{usuarioId:8,identificacao:'Outro'}}],pagina:0,tamanho:20,total:1}])await assert.rejects(preparar(v).cliente.listar(),{codigo:'RESPOSTA_INVALIDA'});
});
test('detalhe exige mesmo ID e escopo do Solicitante; IDs inválidos falham antes do HTTP',async()=>{
  const p=preparar(r);assert.deepEqual(await p.cliente.detalhe(31),r);assert.equal(p.chamadas[0].url,'/api/reservas/31');
  await assert.rejects(p.cliente.detalhe(0),{codigo:'REQUISICAO_INVALIDA'});assert.equal(p.chamadas.length,1);
  await assert.rejects(preparar(r).cliente.detalhe(32),{codigo:'RESPOSTA_INVALIDA'});
});
test('leitura não herda escrita: dono/estado para editar; dono ou admin nos estados canceláveis',()=>{
  const admin={...usuario,usuarioId:99,papel:'ADMINISTRADOR'},resp={...admin,papel:'RESPONSAVEL'};
  assert(podeEditarReserva(r,usuario));assert(!podeEditarReserva(r,admin));assert(!podeCancelarReserva(r,resp));assert(podeCancelarReserva(r,admin));
  assert(!podeEditarReserva({...r,restrita:true},usuario));assert(podeEditarReserva({...r,status:'SOLICITADA',restrita:true},usuario));
  for(const status of ['EM_USO','CONCLUIDA','REJEITADA','CANCELADA','NAO_COMPARECEU']){
    assert(!podeEditarReserva({...r,status},usuario));assert(!podeCancelarReserva({...r,status},admin));
  }
});
test('formulário SP preserva ISO original não editado e converte alterações sem depender do navegador',()=>{
  const exibido=paraCampoReserva(r.inicio);assert.equal(exibido,'2026-11-12T13:00:07.123');
  assert.equal(horarioDaEdicao(exibido,exibido,r.inicio),r.inicio);
  assert.equal(paraCampoReserva('2026-11-12T16:00Z'),'2026-11-12T13:00:00');
  assert.equal(horarioDaEdicao('2026-11-12T13:30:07.125',exibido,r.inicio),'2026-11-12T13:30:07.125-03:00');
  assert.throws(()=>horarioDaEdicao('2026-02-30T13:00',exibido,r.inicio),{codigo:'REQUISICAO_INVALIDA'});
});
test('PATCH envia os três campos, sem identidade, e confirma instante exato/conjunto/estado',async()=>{
  const envio={inicio:r.inicio,fim:r.fim,recursosIds:[12,11],solicitanteId:99,status:'CANCELADA'};
  const p=preparar({...r,recursosIds:[11,12]});await p.cliente.editar(r,envio);
  assert.deepEqual(p.chamadas,[{url:'/api/reservas/31',method:'PATCH',body:{inicio:r.inicio,fim:r.fim,recursosIds:[12,11]}}]);
  for(const v of [{...r,status:'CANCELADA'},{...r,id:32},{...r,restrita:true},{...r,recursosIds:[11]},
    {...r,inicio:'2026-11-12T13:00:07.123456788-03:00'}])await assert.rejects(preparar(v).cliente.editar(r,envio),{codigo:'RESPOSTA_INVALIDA'});
});
test('cancelamento sem corpo exige CANCELADA e preservação de alvo/intervalo/recursos; sem permissão não envia',async()=>{
  const p=preparar({...r,status:'CANCELADA'});await p.cliente.cancelar(r);
  assert.deepEqual(p.chamadas,[{url:'/api/reservas/31/cancelamento',method:'POST'}]);
  await assert.rejects(preparar(r).cliente.cancelar(r),{codigo:'RESPOSTA_INVALIDA'});
  const outro=preparar(r,{...usuario,usuarioId:9});await assert.rejects(outro.cliente.cancelar(r),{status:403});assert.deepEqual(outro.chamadas,[]);
});
