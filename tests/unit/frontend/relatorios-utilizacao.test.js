import test from 'node:test';
import assert from 'node:assert/strict';
import { criarApi, ErroApi } from '../../../backend/src/main/resources/static/js/api.js';
import { apresentarMinutos, parametrosUtilizacao, conferirUtilizacao, podeConsultarUtilizacao,
  criarRelatoriosUtilizacao } from '../../../backend/src/main/resources/static/js/relatorios-utilizacao.js';

// DTO #39 controlado; não executa Java, HTTP Spring ou autorização real.
const filtros = { inicio: '2026-11-17T10:00:00-03:00', fim: '2026-11-17T11:00:00-03:00' };
const relatorio = () => ({ ...filtros, recursoId: null, estados: ['APROVADA', 'EM_USO', 'CONCLUIDA'],
  reservasConsideradas: 1, minutosReservados: 60,
  porRecurso: [1, 2, 3].map(recursoId => ({ recursoId, minutos: 60 })),
  porStatus: [{ status: 'APROVADA', minutos: 60 }], conflitosEvitados: [] });
const conflito = (id = 1) => ({ id, recursoId: 2, origem: 'RESERVA', momento: filtros.inicio,
  intervaloInicio: '2026-12-01T10:00:00-03:00', intervaloFim: '2026-12-01T11:00:00-03:00' });
const invalida = { codigo: 'RESPOSTA_INVALIDA' };

test('minutos inteiros são exibidos com unidade, inclusive zero e valores grandes', () => {
  for (const n of [0, 1, 60, 1620, Number.MAX_SAFE_INTEGER]) assert.equal(apresentarMinutos(n), n + ' min');
  for (const n of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, '60', null]) {
    assert.throws(() => apresentarMinutos(n), invalida);
  }
});
test('guarda provisória aceita somente ADMINISTRADOR sem herdar Q9', () => {
  assert(!podeConsultarUtilizacao(null));
  for (const papel of ['SOLICITANTE', 'RESPONSAVEL', 'ADMINISTRADOR']) {
    assert.equal(podeConsultarUtilizacao({ usuarioId: 1, email: 'teste@example.test', papel }), papel === 'ADMINISTRADOR');
  }
});
test('query obrigatória multidia envia só período e recurso, sem estado ou identidade', () => {
  const consulta = { ...filtros, fim: '2026-11-19T11:00:00-03:00', recursoId: 2,
    usuarioId: 8, papel: 'ADMINISTRADOR', estados: ['CANCELADA'], pagina: 1 };
  assert.deepEqual(Object.fromEntries(parametrosUtilizacao(consulta)), {
    inicio: consulta.inicio, fim: consulta.fim, recursoId: '2',
  });
  assert.deepEqual([...parametrosUtilizacao(filtros).keys()], ['inicio', 'fim']);
  for (const f of [{}, { inicio: filtros.inicio }, { ...filtros, fim: filtros.inicio },
    { ...filtros, fim: '2026-02-30T11:00-03:00' }, { ...filtros, inicio: '2026-11-17T10:00' },
    ...[0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, null, '2'].map(recursoId => ({ ...filtros, recursoId }))]) {
    assert.throws(() => parametrosUtilizacao(f), { codigo: 'REQUISICAO_INVALIDA' });
  }
});
test('uma reserva com três recursos mantém total60min e três alocações de60min', () => {
  assert.deepEqual(conferirUtilizacao(relatorio(), filtros), relatorio());
});
test('eco de período compara instantes, aceita offsets equivalentes e mantém nanos', () => {
  const r = { ...relatorio(), inicio: '2026-11-17T13:00:00Z', fim: '2026-11-17T14:00:00Z' };
  r.estados.reverse(); assert.deepEqual(conferirUtilizacao(r, filtros), r);
  for (const v of [{ ...r, inicio: filtros.fim }, { ...r, fim: filtros.inicio }, { ...r, fim: '2026-11-17T14:00' }]) {
    assert.throws(() => conferirUtilizacao(v, filtros), invalida);
  }
  const f = { inicio: '2026-11-17T10:00:00.123456788-03:00', fim: '2026-11-17T10:00:00.123456789-03:00' };
  const curto = { ...relatorio(), ...f, minutosReservados: 0,
    porRecurso: [{ recursoId: 1, minutos: 0 }], porStatus: [{ status: 'APROVADA', minutos: 0 }] };
  assert.equal(parametrosUtilizacao(f).get('fim'), f.fim);
  assert.deepEqual(conferirUtilizacao(curto, f), curto);
});
test('reserva menor que um minuto é válida com total e linhas zero', () => {
  const r = { ...relatorio(), minutosReservados: 0, porRecurso: [{ recursoId: 1, minutos: 0 }],
    porStatus: [{ status: 'APROVADA', minutos: 0 }] };
  assert.deepEqual(conferirUtilizacao(r, filtros), r);
});
test('truncamento por grupo permite total1min e duas linhas zero em recursos e status', () => {
  // Duas reservas de59s em recursos/estados distintos: total118s→1min; grupos59s→0min.
  const r = { ...relatorio(), reservasConsideradas: 2, minutosReservados: 1,
    porRecurso: [{ recursoId: 1, minutos: 0 }, { recursoId: 2, minutos: 0 }],
    porStatus: [{ status: 'APROVADA', minutos: 0 }, { status: 'CONCLUIDA', minutos: 0 }] };
  assert.deepEqual(conferirUtilizacao(r, filtros), r);
});
test('filtro seleciona reservas mas conserva todos os recursos vinculados do DTO39', () => {
  const f = { ...filtros, recursoId: 2 }, r = { ...relatorio(), recursoId: 2 };
  assert.deepEqual(conferirUtilizacao(r, f), r);
  for (const v of [{ ...r, recursoId: null }, { ...r, porRecurso: [{ recursoId: 1, minutos: 60 }] },
    { ...r, porRecurso: [{ recursoId: 2, minutos: 59 }] }]) {
    assert.throws(() => conferirUtilizacao(v, f), invalida);
  }
});
test('zero reservas com conflitos positivos é independente de alocações', () => {
  const r = { ...relatorio(), reservasConsideradas: 0, minutosReservados: 0, porRecurso: [], porStatus: [],
    conflitosEvitados: [conflito(1), conflito(2)] };
  assert.deepEqual(conferirUtilizacao(r, filtros), r);
  assert.equal(conferirUtilizacao(r, filtros).conflitosEvitados.length, 2);
});
test('recusa estados, contagens, IDs, listas ou minutos malformados, sem aceitar DTO anterior', () => {
  for (const alterar of [r => { r.estados = ['APROVADA', 'APROVADA', 'CONCLUIDA']; },
    r => { r.estados.push('SOLICITADA'); }, r => { r.porRecurso[0].recursoId = 0; },
    r => { r.porRecurso[1].recursoId = 1; }, r => { r.porRecurso.push(null); },
    r => { r.reservasConsideradas = -1; }, r => { r.minutosReservados = '60'; },
    r => { r.minutosReservados = Number.MAX_SAFE_INTEGER + 1; }, r => { delete r.recursoId; },
    r => { r.conflitosEvitados = 0; }, r => { r.porRecurso[0].minutos = -1; },
    r => { r.porStatus[0].minutos = 0.5; }]) {
    const r = relatorio(); alterar(r); assert.throws(() => conferirUtilizacao(r, filtros), invalida);
  }
  for (const r of [null, {}, [], { periodo: filtros, duracaoReservada: 'PT1H' },
    { ...relatorio(), porRecurso: null }, { ...relatorio(), porStatus: null }]) {
    assert.throws(() => conferirUtilizacao(r, filtros), invalida);
  }
});
test('invariantes do DTO39 recusam totais impossíveis e mapas incompletos', () => {
  for (const r of [{ ...relatorio(), minutosReservados: 61 }, { ...relatorio(), reservasConsideradas: 0 },
    { ...relatorio(), porRecurso: [] }, { ...relatorio(), porStatus: [] },
    { ...relatorio(), porRecurso: [{ recursoId: 1, minutos: 0 }] },
    { ...relatorio(), porStatus: [{ status: 'APROVADA', minutos: 58 }] },
    { ...relatorio(), porRecurso: [{ recursoId: 1, minutos: 61 }] },
    { ...relatorio(), porStatus: [{ status: 'APROVADA', minutos: 60 }, { status: 'APROVADA', minutos: 0 }] },
    { ...relatorio(), porStatus: [{ status: 'CANCELADA', minutos: 60 }] }]) {
    assert.throws(() => conferirUtilizacao(r, filtros), invalida);
  }
});
test('conflitos são contados pelo momento semiaberto e não pelo intervalo tentado', () => {
  const r = { ...relatorio(), conflitosEvitados: [conflito()] };
  assert.deepEqual(conferirUtilizacao(r, filtros).conflitosEvitados, [conflito()]);
  for (const evento of [{ ...conflito(), momento: filtros.fim },
    { ...conflito(), momento: '2026-11-17T09:59:59.999999999-03:00' },
    { ...conflito(), intervaloFim: conflito().intervaloInicio }, { ...conflito(), origem: 'NOVA' },
    { ...conflito(), id: 0 }, { ...conflito(), recursoId: 0 }, { ...conflito(), momento: '2026-11-17T10:00' }]) {
    assert.throws(() => conferirUtilizacao({ ...r, conflitosEvitados: [evento] }, filtros), invalida);
  }
  assert.throws(() => conferirUtilizacao({ ...r, conflitosEvitados: [conflito(), conflito()] }, filtros), invalida);
  const f = { ...filtros, recursoId: 1 };
  assert.throws(() => conferirUtilizacao({ ...r, recursoId: 1 }, f), invalida);
});
test('somas de status não perdem precisão acima deMAX_SAFE_INTEGER', () => {
  const m = Number.MAX_SAFE_INTEGER;
  const f = { inicio: '1900-01-01T00:00:00Z', fim: '9999-01-01T00:00:00Z' };
  const r = { ...relatorio(), ...f, reservasConsideradas: Number.MAX_SAFE_INTEGER, minutosReservados: m,
    porRecurso: [{ recursoId: 1, minutos: m }], porStatus: [
      { status: 'APROVADA', minutos: m }, { status: 'CONCLUIDA', minutos: 1 }] };
  assert.throws(() => conferirUtilizacao(r, f), invalida);
});
test('projeção remove extras, copia coleções e não cria precisão ausente', () => {
  const r = { ...relatorio(), conflitosEvitados: [conflito()] };
  const recebido = { ...r, email: 'privado', conflitosEvitados: [{ ...conflito(), solicitanteId: 90 }],
    porRecurso: r.porRecurso.map(l => ({ ...l, identificacao: 'extra' })) };
  const copia = conferirUtilizacao(recebido, filtros); assert.deepEqual(copia, r);
  copia.porRecurso[0].minutos = 9; copia.conflitosEvitados[0].id = 99;
  assert.equal(recebido.porRecurso[0].minutos, 60); assert.equal(recebido.conflitosEvitados[0].id, 1);
});
test('cliente usa GET com sessão sem buscarCSRF ou enviar identidade', async () => {
  const chamadas = [];
  const api = criarApi({ fetchImpl: async (url, opcoes) => {
    chamadas.push({ url, opcoes }); return new Response(JSON.stringify(relatorio()), { status: 200 });
  } });
  assert.deepEqual(await criarRelatoriosUtilizacao(api).consultar(filtros), relatorio());
  assert.equal(chamadas.length, 1); assert.equal(chamadas[0].opcoes.method, 'GET');
  assert.equal(chamadas[0].opcoes.credentials, 'same-origin'); assert.equal(chamadas[0].opcoes.body, undefined);
  assert.deepEqual(Object.fromEntries(chamadas[0].opcoes.headers), { accept: 'application/json' });
  assert(chamadas[0].url.startsWith('/api/reservas/relatorio-utilizacao?'));
});
test('cliente captura filtros antes da resposta, não repete erro e valida antes doHTTP', async () => {
  const f = { ...filtros }, cliente = criarRelatoriosUtilizacao({ limparCsrf() {}, async requisitar() {
    f.inicio = filtros.fim; return relatorio();
  } });
  assert.deepEqual(await cliente.consultar(f), relatorio());
  let chamadas = 0;
  const erro = new ErroApi(403, 'OPERACAO_NAO_PERMITIDA', 'Sem permissão.', 'rf12-39');
  const falho = criarRelatoriosUtilizacao({ limparCsrf() {}, async requisitar() { chamadas++; throw erro; } });
  await assert.rejects(falho.consultar(filtros), e => e === erro); assert.equal(chamadas, 1);
  await assert.rejects(falho.consultar({ ...filtros, recursoId: -1 }), { codigo: 'REQUISICAO_INVALIDA' });
  assert.equal(chamadas, 1);
});
