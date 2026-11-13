import test from 'node:test';
import assert from 'node:assert/strict';
import { criarMovimentacoes, conferirMovimentacao, prazoUltrapassado, apresentarAtraso } from '../../../backend/src/main/resources/static/js/movimentacoes.js';
import { criarApi } from '../../../backend/src/main/resources/static/js/api.js';

const aberta = { id: 11, reservaId: 1001, recursoId: 7, responsavelId: 3,
  retiradoEm: '2026-11-11T13:00:00.123456Z', fimPrevisto: '2026-11-11T14:00:00Z',
  devolvidoEm: null, devolvidoPor: null, atrasoSegundos: 0 };
const fechada = { ...aberta, devolvidoEm: '2026-11-11T15:01:01Z', devolvidoPor: 9, atrasoSegundos: 3661 };
function preparar(resposta) {
  const chamadas = [];
  const cliente = criarMovimentacoes({ limparCsrf() {}, async requisitar(url, opcoes) { chamadas.push({ url, ...opcoes }); return resposta; } });
  return { cliente, chamadas };
}
test('consulta somente abertas em array sem inventar filtros, GET de reserva ou paginação', async () => {
  const { cliente, chamadas } = preparar([aberta]);
  assert.deepEqual(await cliente.abertas(), [aberta]);
  assert.deepEqual(chamadas, [{ url: '/api/movimentacoes?abertas=true' }]);
  assert.deepEqual(await preparar([]).cliente.abertas(), []);
});
test('DTO aceita Instant com Z/fração e projeta somente o contrato', () => {
  assert.deepEqual(conferirMovimentacao({ ...aberta, email: 'privado', segredo: 1 }), aberta);
  assert.deepEqual(conferirMovimentacao(fechada), fechada);
});

test('movimentações aceitam minutos na consulta/retirada/devolução e comparam instantes equivalentes', async () => {
  const minutos = { ...aberta, retiradoEm: '2026-11-12T12:25:56.446048-03:00', fimPrevisto: '2026-11-12T13:08-03:00' };
  assert.deepEqual(conferirMovimentacao(minutos), minutos);
  assert.deepEqual(await preparar([minutos]).cliente.abertas(), [minutos]);
  assert.deepEqual(await preparar(minutos).cliente.retirar({ reservaId: 1001, recursoId: 7 }, 3), minutos);
  const devolvida = { ...minutos, fimPrevisto: '2026-11-12T16:08:00Z',
    devolvidoEm: '2026-11-12T13:09-03:00', devolvidoPor: 3, atrasoSegundos: 60 };
  assert.deepEqual(await preparar(devolvida).cliente.devolver(minutos), devolvida);
  await assert.rejects(preparar({ ...devolvida, fimPrevisto: '2026-11-12T16:09Z' }).cliente.devolver(minutos), { codigo: 'RESPOSTA_INVALIDA' });
  for (const retiradoEm of ['2026-11-12T12:25', '2026-02-30T12:25-03:00']) {
    await assert.rejects(preparar({ ...minutos, retiradoEm }).cliente.retirar({ reservaId: 1001, recursoId: 7 }, 3), { codigo: 'RESPOSTA_INVALIDA' });
  }
});
test('DTO recusa IDs inseguros, datas sem offset e par de devolução incompleto', () => {
  for (const r of [null, { ...aberta, id: Number.MAX_SAFE_INTEGER + 1 }, { ...aberta, recursoId: 0 },
    { ...aberta, retiradoEm: '2026-11-11T13:00:00' }, { ...aberta, retiradoEm: '2026-02-30T13:00:00Z' },
    { ...aberta, fimPrevisto: '2026-11-11T12:00:00Z' }, { ...aberta, devolvidoPor: 9 },
    { ...fechada, devolvidoPor: null }, { ...fechada, devolvidoEm: '2026-11-11T12:00:00Z' }, { ...aberta, atrasoSegundos: -1 }]) {
    assert.throws(() => conferirMovimentacao(r), { codigo: 'RESPOSTA_INVALIDA' });
  }
});
test('lista recusa movimento devolvido, envelope e duplicatas de movimento ou material aberto', async () => {
  for (const r of [{ itens: [aberta] }, [fechada], [aberta, aberta], [aberta, { ...aberta, id: 12 }]]) {
    await assert.rejects(preparar(r).cliente.abertas(), { codigo: 'RESPOSTA_INVALIDA' });
  }
});
test('pesquisa MATERIAL codifica patrimônio e paginação no cliente compartilhado', async () => {
  const { cliente, chamadas } = preparar({ itens: [], pagina: 1, tamanho: 20, total: 0 });
  await cliente.pesquisarMateriais('PAT & A', 1);
  assert.deepEqual(chamadas, [{ url: '/api/recursos?pagina=1&tamanho=20&tipo=MATERIAL&patrimonio=PAT+%26+A' }]);
});
test('detalhe identifica MATERIAL pelo mesmo ID sem exigir ativo para consultar pendência', async () => {
  const recurso = { id: 7, dados: { tipo: 'MATERIAL', codigo: 'MAT-01', ativo: false, restrito: true, patrimonio: 'PAT-01', descricao: 'Projetor', condicao: 'BOM' } };
  const { cliente } = preparar(recurso); assert.equal((await cliente.material(7)).dados.ativo, false);
  await assert.rejects(preparar({ ...recurso, id: 8 }).cliente.material(7), { codigo: 'RESPOSTA_INVALIDA' });
  await assert.rejects(preparar({ ...recurso, dados: { ...recurso.dados, tipo: 'SALA' } }).cliente.material(7), { codigo: 'RESPOSTA_INVALIDA' });
});
test('retirada envia apenas reserva/material, confirmando ator e IDs da resposta', async () => {
  const { cliente, chamadas } = preparar(aberta);
  assert.deepEqual(await cliente.retirar({ reservaId: 1001, recursoId: 7, responsavelId: 999, retiradoEm: 'ignorado' }, 3), aberta);
  assert.deepEqual(chamadas, [{ url: '/api/movimentacoes/retiradas', method: 'POST', body: { reservaId: 1001, recursoId: 7 } }]);
  for (const r of [{ ...aberta, responsavelId: 9 }, { ...aberta, reservaId: 999 }, { ...aberta, recursoId: 999 }, fechada]) {
    await assert.rejects(preparar(r).cliente.retirar({ reservaId: 1001, recursoId: 7 }, 3), { codigo: 'RESPOSTA_INVALIDA' });
  }
});
test('IDs inválidos falham antes do HTTP', async () => {
  const { cliente, chamadas } = preparar(aberta);
  for (const dados of [{ reservaId: 0, recursoId: 7 }, { reservaId: 1.5, recursoId: 7 }, { reservaId: 1001, recursoId: -1 }]) {
    await assert.rejects(cliente.retirar(dados, 3), { codigo: 'REQUISICAO_INVALIDA' });
  }
  await assert.rejects(cliente.material(0), { codigo: 'REQUISICAO_INVALIDA' }); assert.equal(chamadas.length, 0);
});
test('devolução sem corpo aceita idempotência por outro operador e preserva atraso final', async () => {
  const { cliente, chamadas } = preparar(fechada);
  assert.deepEqual(await cliente.devolver(aberta), fechada);
  assert.deepEqual(chamadas, [{ url: '/api/movimentacoes/11/devolucao', method: 'POST' }]);
  assert.equal(apresentarAtraso(fechada.atrasoSegundos), '1 h 1 min 1 s (3661 segundos)');
});
test('devolução recusa identidade, prazo, retirada ou estado divergente', async () => {
  for (const r of [aberta, { ...fechada, id: 12 }, { ...fechada, recursoId: 12 }, { ...fechada, reservaId: 12 },
    { ...fechada, responsavelId: 12 }, { ...fechada, retiradoEm: '2026-11-11T13:01:00Z' }, { ...fechada, fimPrevisto: '2026-11-11T14:01:00Z' }]) {
    await assert.rejects(preparar(r).cliente.devolver(aberta), { codigo: 'RESPOSTA_INVALIDA' });
  }
});
test('atraso de aberta é estimativa de prazo; passagem do tempo não fecha movimento', () => {
  assert.equal(prazoUltrapassado(aberta, Date.parse('2026-11-11T16:00:00Z')), true);
  assert.equal(aberta.atrasoSegundos, 0); assert.equal(aberta.devolvidoEm, null);
  assert.equal(prazoUltrapassado(aberta, Date.parse('2026-11-11T13:30:00Z')), false);
  assert.equal(prazoUltrapassado(fechada, Date.parse('2026-11-11T16:00:00Z')), false);
});
test('devolução usa sessão/CSRF dinâmico e não repete escrita em conflito', async () => {
  const chamadas = [];
  const cliente = criarMovimentacoes(criarApi({ aoExpirarSessao() {}, fetchImpl: async (url, opcoes) => {
    chamadas.push({ url, ...opcoes });
    if (url === '/api/auth/csrf') return Response.json({ header: 'X-CSRF-MOV', token: 'token' });
    return Response.json({ codigo: 'TENTE_NOVAMENTE', mensagem: 'Disputa.', correlationId: 'mov-123' }, { status: 409 });
  } }));
  await assert.rejects(cliente.devolver(aberta), { status: 409, codigo: 'TENTE_NOVAMENTE', correlationId: 'mov-123' });
  assert.equal(chamadas.length, 2); assert.equal(chamadas[1].credentials, 'same-origin'); assert.equal(chamadas[1].headers.get('X-CSRF-MOV'), 'token');
  assert.equal(chamadas[1].body, undefined);
});
