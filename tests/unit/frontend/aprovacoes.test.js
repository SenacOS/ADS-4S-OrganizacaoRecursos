import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAprovacoes, parametrosFila } from '../../../backend/src/main/resources/static/js/aprovacoes.js';
import { intervaloDoFormulario } from '../../../backend/src/main/resources/static/js/datas.js';

const usuario = { usuarioId: 9, email: 'responsavel@exemplo.test', papel: 'RESPONSAVEL' };
const pendente = {
  id: 1001, solicitanteId: 7, status: 'SOLICITADA', restrita: true,
  inicio: '2026-11-10T13:00:00-03:00', fim: '2026-11-10T14:00:00-03:00', recursosIds: [101, 103], motivoDecisao: null,
  solicitante: { usuarioId: 7, identificacao: 'Solicitante 7' },
  recursos: [{ id: 101, tipo: 'SALA', identificacao: 'Sala A' }, { id: 103, tipo: 'MATERIAL', identificacao: 'Projetor', patrimonio: 'PAT-01' }],
};
const envelope = (itens = [pendente]) => ({ itens, pagina: 0, tamanho: 20, total: itens.length });
const decisao = (status = 'APROVADA') => ({ id: 1001, solicitanteId: 7, status, restrita: true,
  inicio: '2026-11-10T16:00:00Z', fim: '2026-11-10T17:00:00Z', recursosIds: [103, 101], motivoDecisao: status === 'REJEITADA' ? 'Uso prioritário.' : null });
function ambiente(resposta) {
  const chamadas = [];
  const cliente = criarAprovacoes(usuario, { requisitar: async (rota, opcoes) => { chamadas.push({ rota, opcoes }); return resposta; }, limparCsrf() {} });
  return { cliente, chamadas };
}

test('fila fixa status SOLICITADA e permite período de consulta com vários dias', () => {
  const intervalo = intervaloDoFormulario('2026-11-10T13:00', '2026-11-13T14:00', false, false);
  const params = parametrosFila({ ...intervalo, recursoId: 103, pagina: 2, tamanho: 50, status: 'APROVADA', solicitanteId: 999 });
  assert.equal(params.get('status'), 'SOLICITADA');
  assert.equal(params.get('inicio'), '2026-11-10T13:00:00-03:00');
  assert.equal(params.get('fim'), '2026-11-13T14:00:00-03:00');
  assert.equal(params.get('pagina'), '2');
  assert.equal(params.get('tamanho'), '50');
  assert.equal(params.get('recursoId'), '103');
  assert.equal(params.has('solicitanteId'), false);
  assert.equal(parametrosFila().toString(), 'status=SOLICITADA&pagina=0&tamanho=20');
  assert.throws(() => intervaloDoFormulario('2026-11-10T13:00', '2026-11-13T14:00'), /mesmo dia/);
});

test('parâmetros inválidos da fila falham antes do HTTP', async () => {
  const a = ambiente(envelope());
  for (const filtro of [{ pagina: -1 }, { pagina: 1.5 }, { tamanho: 101 }, { tamanho: 0 }, { recursoId: 0 },
    { recursoId: -3 }, { inicio: pendente.inicio }, { inicio: pendente.inicio, fim: pendente.inicio },
    { inicio: '2026-11-10T13:00', fim: pendente.fim }]) {
    await assert.rejects(a.cliente.listar(filtro), { codigo: 'REQUISICAO_INVALIDA' });
  }
  assert.equal(a.chamadas.length, 0);
});

test('SOLICITANTE e ADMINISTRADOR não consultam nem decidem no cliente de fila', async () => {
  let chamadas = 0;
  for (const papel of ['SOLICITANTE', 'ADMINISTRADOR']) {
    const cliente = criarAprovacoes({ ...usuario, papel }, { requisitar: async () => { chamadas++; }, limparCsrf() {} });
    await assert.rejects(cliente.listar(), { status: 403 });
    await assert.rejects(cliente.decidir(pendente, 'APROVADA'), { status: 403 });
  }
  assert.equal(chamadas, 0);
});

test('leitura mantém somente projeção contratada e usa GET exclusivo da fila', async () => {
  const a = ambiente(envelope([{ ...pendente, dadoInterno: 'ignorar', solicitante: { ...pendente.solicitante, email: 'privado@exemplo.test' } }]));
  assert.deepEqual(await a.cliente.listar(), envelope());
  assert.deepEqual(a.chamadas, [{ rota: '/api/reservas?status=SOLICITADA&pagina=0&tamanho=20', opcoes: undefined }]);
});

test('recusa projeções com identidade, estado, recursos ou datas incoerentes', async () => {
  for (const mudanca of [{ status: 'APROVADA' }, { restrita: false }, { solicitanteId: 0 },
    { solicitante: { usuarioId: 8, identificacao: 'Outro' } }, { solicitante: { usuarioId: 7, identificacao: '' } },
    { fim: pendente.inicio }, { recursosIds: [101, 101] }, { recursos: [pendente.recursos[0]] },
    { recursos: [{ ...pendente.recursos[1], patrimonio: '' }, pendente.recursos[0]] },
    { recursos: [{ ...pendente.recursos[0], id: 999 }, pendente.recursos[1]] }]) {
    await assert.rejects(ambiente(envelope([{ ...pendente, ...mudanca }])).cliente.listar(), { codigo: 'RESPOSTA_INVALIDA' });
  }
});

test('recusa envelopes duplicados/parciais e paginação divergente sem filtrar localmente', async () => {
  for (const resposta of [envelope([pendente, pendente]), { ...envelope(), total: 0 }, { ...envelope(), pagina: 1 },
    { ...envelope(), tamanho: 100 }, { ...envelope(), total: -1 }, envelope([pendente, { ...pendente, id: 1002, restrita: false }])]) {
    await assert.rejects(ambiente(resposta).cliente.listar(), { codigo: 'RESPOSTA_INVALIDA' });
  }
});

test('página além da última pode ser vazia e não inventa um GET de detalhe', async () => {
  const resposta = { itens: [], pagina: 2, tamanho: 20, total: 1 };
  const a = ambiente(resposta);
  assert.deepEqual(await a.cliente.listar({ pagina: 2 }), resposta);
  assert.equal(a.chamadas.length, 1);
  assert.equal(a.chamadas[0].rota, '/api/reservas?status=SOLICITADA&pagina=2&tamanho=20');
});

test('aprovação reutiliza escrita sem corpo e confirma instantes/conjunto de recursos', async () => {
  const a = ambiente(decisao());
  assert.deepEqual(await a.cliente.decidir(pendente, 'APROVADA'), { id: 1001, status: 'APROVADA', motivoDecisao: null });
  assert.deepEqual(a.chamadas, [{ rota: '/api/reservas/1001/aprovacao', opcoes: { method: 'POST' } }]);
});

test('rejeição envia somente motivo aparado e exige justificativa não vazia', async () => {
  const a = ambiente(decisao('REJEITADA'));
  await assert.rejects(a.cliente.decidir(pendente, 'REJEITADA', '  '), { codigo: 'REQUISICAO_INVALIDA' });
  assert.equal(a.chamadas.length, 0);
  assert.deepEqual(await a.cliente.decidir(pendente, 'REJEITADA', '  Uso prioritário.  '), { id: 1001, status: 'REJEITADA', motivoDecisao: 'Uso prioritário.' });
  assert.deepEqual(a.chamadas[0], { rota: '/api/reservas/1001/rejeicao', opcoes: { method: 'POST', body: { motivo: 'Uso prioritário.' } } });
});

test('resposta de decisão divergente não é sucesso e não provoca replay', async () => {
  for (const mudanca of [{ id: 1002 }, { solicitanteId: 8 }, { restrita: false }, { status: 'REJEITADA' },
    { inicio: pendente.fim }, { recursosIds: [101] }, { recursosIds: [101, 101] }]) {
    const a = ambiente({ ...decisao(), ...mudanca });
    await assert.rejects(a.cliente.decidir(pendente, 'APROVADA'), /confira o resultado antes de reenviar/);
    assert.equal(a.chamadas.length, 1);
  }
});

test('decisão desconhecida é recusada antes do HTTP', async () => {
  const a = ambiente(decisao());
  await assert.rejects(a.cliente.decidir(pendente, 'CANCELADA'), { codigo: 'REQUISICAO_INVALIDA' });
  assert.equal(a.chamadas.length, 0);
});
