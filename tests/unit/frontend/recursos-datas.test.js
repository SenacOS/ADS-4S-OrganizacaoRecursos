import test from 'node:test';
import assert from 'node:assert/strict';
import { paraIsoOperacional, intervaloDoFormulario, apresentarData, dataComOffset } from '../../../backend/src/main/resources/static/js/datas.js';
import { criarRecursos, parametrosPesquisa } from '../../../backend/src/main/resources/static/js/recursos.js';
import { confirmarCriacao } from '../../../backend/src/main/resources/static/js/reservas.js';

const intervalo = { inicio: '2026-11-10T13:00:00-03:00', fim: '2026-11-10T14:00:00-03:00' };
const sala = { id: 101, dados: { tipo: 'SALA', codigo: 'SALA-01', ativo: true, restrito: false, capacidade: 20, localizacao: 'Bloco A' }, disponivel: true };

test('datetime-local é convertido com o fuso operacional, incluindo horário de verão histórico', () => {
  assert.equal(paraIsoOperacional('2026-11-10T13:00'), intervalo.inicio);
  assert.equal(paraIsoOperacional('2018-11-04T01:30'), '2018-11-04T01:30:00-02:00');
  assert.match(apresentarData('2026-11-10T16:00:00Z'), /10\/11\/2026.*13:00/);
});

test('horários ausentes e ambíguos durante transições de São Paulo são recusados', () => {
  for (const valor of ['2018-11-04T00:30', '2019-02-16T23:30']) {
    assert.throws(() => paraIsoOperacional(valor), /inexistente ou ambíguo/);
  }
});

test('dias inexistentes, normalização de 24 horas e formato incompleto não viram instantes', () => {
  for (const valor of ['2026-02-30T10:00', '2026-11-10T24:00', '2026-11-10', 'x']) {
    assert.throws(() => paraIsoOperacional(valor), { codigo: 'REQUISICAO_INVALIDA' });
  }
  assert.equal(dataComOffset('2026-11-10T24:00:00-03:00'), false);
  assert.equal(dataComOffset('2026-02-30T10:00:00-03:00'), false);
});

test('intervalo opcional/obrigatório, fim posterior e limite diário têm mensagens específicas', () => {
  assert.deepEqual(intervaloDoFormulario('', ''), {});
  assert.deepEqual(intervaloDoFormulario('2026-11-10T13:00', '2026-11-10T14:00', true), intervalo);
  assert.throws(() => intervaloDoFormulario('', '', true), /juntos/);
  assert.throws(() => intervaloDoFormulario('2026-11-10T13:00', ''), /juntos/);
  assert.throws(() => intervaloDoFormulario('2026-11-10T13:00', '2026-11-10T13:00'), /posterior/);
  assert.throws(() => intervaloDoFormulario('2026-11-10T23:00', '2026-11-11T01:00'), /mesmo dia/);
});

test('filtros de recursos codificam textos/offset, booleano false e paginação sem campos extras', () => {
  const params = parametrosPesquisa({ ...intervalo, tipo: 'SALA', capacidadeMinima: 20,
    localizacao: ' A & B ', competencia: 'C++', patrimonio: 'PAT/01', disponivel: false, pagina: 2, tamanho: 50,
    solicitanteId: 999 });
  assert.equal(params.get('localizacao'), 'A & B');
  assert.equal(params.get('competencia'), 'C++');
  assert.equal(params.get('inicio'), intervalo.inicio);
  assert.equal(params.get('disponivel'), 'false');
  assert.equal(params.get('pagina'), '2');
  assert.equal(params.get('tamanho'), '50');
  assert.equal(params.has('solicitanteId'), false);
  assert.match(params.toString(), /A\+%26\+B/);
  assert.equal(parametrosPesquisa().toString(), 'pagina=0&tamanho=20');
});

test('filtros inválidos falham antes da chamada HTTP', async () => {
  let chamadas = 0;
  const cliente = criarRecursos({ requisitar: async () => { chamadas++; }, limparCsrf() {} });
  for (const filtro of [{ pagina: -1 }, { pagina: 1.5 }, { tamanho: 101 }, { capacidadeMinima: 0 },
    { tipo: 'OUTRO' }, { inicio: intervalo.inicio }, { disponivel: true }, { ...intervalo, disponivel: 'false' },
    { ...intervalo, fim: intervalo.inicio }]) {
    await assert.rejects(cliente.pesquisar(filtro), { codigo: 'REQUISICAO_INVALIDA' });
  }
  assert.equal(chamadas, 0);
});

test('pesquisa usa GET contratado e preserva envelope; não repagina a lista no cliente', async () => {
  const chamadas = [];
  const resposta = { itens: [sala], pagina: 2, tamanho: 20, total: 41 };
  const cliente = criarRecursos({ requisitar: async (rota) => { chamadas.push(rota); return resposta; }, limparCsrf() {} });
  assert.deepEqual(await cliente.pesquisar({ pagina: 2 }), resposta);
  assert.deepEqual(chamadas, ['/api/recursos?pagina=2&tamanho=20']);
});

test('página vazia além da última é válida; envelopes e recursos incoerentes são recusados', async () => {
  let resposta = { itens: [], pagina: 4, tamanho: 20, total: 1 };
  const cliente = criarRecursos({ requisitar: async () => resposta, limparCsrf() {} });
  assert.deepEqual(await cliente.pesquisar({ pagina: 4 }), resposta);
  for (const invalida of [
    { itens: [sala], pagina: 0, tamanho: 20, total: 0 },
    { itens: [sala, sala], pagina: 0, tamanho: 20, total: 2 },
    { itens: [{ ...sala, disponivel: undefined }], pagina: 0, tamanho: 20, total: 1 },
    { itens: [{ ...sala, dados: { ...sala.dados, codigo: '' } }], pagina: 0, tamanho: 20, total: 1 },
    { itens: [sala], pagina: 1, tamanho: 20, total: 21 },
  ]) {
    resposta = invalida;
    await assert.rejects(cliente.pesquisar(), { codigo: 'RESPOSTA_INVALIDA' });
  }
});

test('expediente lê somente a rota contratada e recusa zona/horário inválidos', async () => {
  let resposta = { zona: 'America/Sao_Paulo', janelas: [{ dia: 'TUESDAY', inicio: '07:00:00', fim: '22:00:00' }] };
  const cliente = criarRecursos({ requisitar: async (rota) => { assert.equal(rota, '/api/horarios-funcionamento'); return resposta; }, limparCsrf() {} });
  assert.deepEqual(await cliente.expediente(), resposta);
  resposta = { zona: 'UTC', janelas: [] };
  await assert.rejects(cliente.expediente(), { codigo: 'RESPOSTA_INVALIDA' });
  resposta = { zona: 'America/Sao_Paulo', janelas: [{ dia: 'TUESDAY', inicio: '25:00', fim: '22:00' }] };
  await assert.rejects(cliente.expediente(), { codigo: 'RESPOSTA_INVALIDA' });
});

const envio = { ...intervalo, recursosIds: [101, 102] };
const criada = { id: 1001, solicitanteId: 7, status: 'APROVADA', restrita: false,
  inicio: '2026-11-10T16:00:00Z', fim: '2026-11-10T17:00:00Z', recursosIds: [102, 101] };

test('confirmação da criação aceita mesmos instantes e IDs sem depender da ordem', () => {
  assert.deepEqual(confirmarCriacao(criada, envio, 7), criada);
  const restrita = { ...criada, status: 'SOLICITADA', restrita: true };
  assert.deepEqual(confirmarCriacao(restrita, envio, 7), restrita);
});

test('confirmação recusa identidade, status, datas e recursos divergentes sem afirmar sucesso', () => {
  for (const alteracao of [{ id: -1 }, { solicitanteId: 8 }, { status: 'SOLICITADA' }, { status: 'INVENTADO' },
    { inicio: intervalo.fim }, { recursosIds: [101] }, { recursosIds: [101, 101] }, { fim: '2026-11-10T18:00' }]) {
    assert.throws(() => confirmarCriacao({ ...criada, ...alteracao }, envio, 7), /Confira o resultado antes de reenviar/);
  }
});
