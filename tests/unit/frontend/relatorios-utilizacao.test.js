import test from 'node:test';
import assert from 'node:assert/strict';
import { criarApi, ErroApi } from '../../../backend/src/main/resources/static/js/api.js';
import { duracaoEmNanos, apresentarDuracao, parametrosUtilizacao, conferirUtilizacao,
  criarRelatoriosUtilizacao } from '../../../backend/src/main/resources/static/js/relatorios-utilizacao.js';

// DTO candidato controlado: não executa o agregador, HTTP Spring ou banco RF12.
const filtros = { inicio: '2026-11-17T10:00:00-03:00', fim: '2026-11-17T11:00:00-03:00' };
const relatorio = () => ({ periodo: { ...filtros }, recursoId: null,
  estadosConsiderados: ['APROVADA', 'EM_USO', 'CONCLUIDA'], reservasConsideradas: 1,
  duracaoReservada: 'PT1H', porRecurso: [1, 2, 3].map(recursoId => ({ recursoId, duracaoAlocada: 'PT1H' })),
  conflitosEvitados: 0 });
const invalida = { codigo: 'RESPOSTA_INVALIDA' };

test('Duration temporal conserva nanossegundos e horas grandes sem passar por Date/float', () => {
  assert.equal(duracaoEmNanos('PT1H30M0.123456789S'), 5400123456789n);
  assert.equal(duracaoEmNanos('PT0.000000001S'), 1n);
  assert.equal(duracaoEmNanos('PT9007199254740993H'), 9007199254740993n * 3600000000000n);
  assert.equal(duracaoEmNanos('PT0S'), 0n);
});
test('Duration recusa sinal, calendário, frações impróprias, vazio e tipos inesperados', () => {
  for (const valor of [null, undefined, 1, '', 'PT', 'P1D', 'P1M', '-PT1H', 'PT-1H', 'PT+1H',
    'PT1.5H', 'PT1.5M', 'PT1,5S', 'PT1.1234567890S', 'PTNaNS', 'PT1Sx', ' PT1H', 'PT1S\n']) {
    assert.throws(() => duracaoEmNanos(valor), invalida, String(valor));
  }
});
test('apresentação usa h/min/s sem ciclo de24h, arredondamento ou perda da fração', () => {
  for (const [valor, texto] of [['PT0S', '0 s'], ['PT27H', '27 h'], ['PT90M', '1 h 30 min'],
    ['PT1H0.123456789S', '1 h 0,123456789 s'], ['PT0.000000001S', '0,000000001 s'],
    ['PT1M30.500000000S', '1 min 30,5 s'], ['PT9007199254740993H', '9007199254740993 h']]) {
    assert.equal(apresentarDuracao(valor), texto);
  }
});
test('query obrigatória multidia projeta somente período e recurso opcional', () => {
  const consulta = { ...filtros, fim: '2026-11-19T11:00:00-03:00', recursoId: 2,
    usuarioId: 8, papel: 'ADMINISTRADOR', status: 'CANCELADA', pagina: 1 };
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
test('uma reserva com3recursos conserva total1h e as3alocações sem somá-las como total', () => {
  assert.deepEqual(conferirUtilizacao(relatorio(), filtros), relatorio());
  assert.equal(conferirUtilizacao(relatorio(), filtros).duracaoReservada, 'PT1H');
});
test('período aceita eco com offset equivalente e preserva sua representação', () => {
  const r = relatorio();
  r.periodo = { inicio: '2026-11-17T13:00:00Z', fim: '2026-11-17T14:00:00Z' };
  r.estadosConsiderados.reverse();
  assert.deepEqual(conferirUtilizacao(r, filtros), r);
  for (const periodo of [{ ...r.periodo, inicio: filtros.fim }, { ...r.periodo, fim: filtros.inicio },
    { ...r.periodo, fim: '2026-11-17T14:00' }]) {
    assert.throws(() => conferirUtilizacao({ ...r, periodo }, filtros), invalida);
  }
});
test('período e duração de1nanossegundo não colapsam para milissegundo', () => {
  const f = { inicio: '2026-11-17T10:00:00.123456788-03:00', fim: '2026-11-17T10:00:00.123456789-03:00' };
  const r = { ...relatorio(), periodo: f, duracaoReservada: 'PT0.000000001S',
    porRecurso: [{ recursoId: 1, duracaoAlocada: 'PT0.000000001S' }] };
  assert.equal(parametrosUtilizacao(f).get('fim'), f.fim);
  assert.equal(conferirUtilizacao(r, f).duracaoReservada, 'PT0.000000001S');
  assert.throws(() => conferirUtilizacao({ ...r, periodo: { ...f, fim: f.inicio } }, f), invalida);
});
test('resposta vazia e reservas0 com conflitospositivos são válidas e distintas', () => {
  const r = { ...relatorio(), reservasConsideradas: 0, duracaoReservada: 'PT0S', porRecurso: [], conflitosEvitados: 2 };
  assert.deepEqual(conferirUtilizacao(r, filtros), r);
  assert.equal(conferirUtilizacao({ ...r, conflitosEvitados: 0 }, filtros).conflitosEvitados, 0);
});
test('IDs e estados têm conjunto único; contagens são inteiros seguros não negativos', () => {
  for (const alterar of [r => { r.estadosConsiderados = ['APROVADA', 'APROVADA', 'CONCLUIDA']; },
    r => { r.estadosConsiderados.push('SOLICITADA'); }, r => { r.estadosConsiderados = ['SOLICITADA', 'EM_USO', 'CONCLUIDA']; },
    r => { r.porRecurso[0].recursoId = 0; }, r => { r.porRecurso[1].recursoId = 1; },
    r => { r.porRecurso.push(null); }, r => { r.reservasConsideradas = -1; },
    r => { r.conflitosEvitados = 1.5; }, r => { r.conflitosEvitados = Number.MAX_SAFE_INTEGER + 1; },
    r => { delete r.recursoId; }, r => { r.periodo = null; }]) {
    const r = relatorio(); alterar(r);
    assert.throws(() => conferirUtilizacao(r, filtros), invalida);
  }
  for (const r of [null, {}, [], { ...relatorio(), porRecurso: null }]) {
    assert.throws(() => conferirUtilizacao(r, filtros), invalida);
  }
});
test('recurso filtrado exige eco e só sua linha com duração igual ao total', () => {
  const f = { ...filtros, recursoId: 2 }, r = { ...relatorio(), recursoId: 2,
    porRecurso: [{ recursoId: 2, duracaoAlocada: 'PT1H' }] };
  assert.deepEqual(conferirUtilizacao(r, f), r);
  for (const v of [{ ...r, recursoId: null }, { ...r, porRecurso: relatorio().porRecurso },
    { ...r, porRecurso: [{ recursoId: 2, duracaoAlocada: 'PT30M' }] }]) {
    assert.throws(() => conferirUtilizacao(v, f), invalida);
  }
  assert.throws(() => conferirUtilizacao(r, filtros), invalida);
});
test('invariantes recusam totais impossíveis sem exigir igualdade entre soma e total', () => {
  for (const r of [{ ...relatorio(), duracaoReservada: 'PT2H' },
    { ...relatorio(), reservasConsideradas: 0 }, { ...relatorio(), duracaoReservada: 'PT0S' },
    { ...relatorio(), porRecurso: [] },
    { ...relatorio(), porRecurso: [{ recursoId: 1, duracaoAlocada: 'PT2H' }] },
    { ...relatorio(), porRecurso: [{ recursoId: 1, duracaoAlocada: 'PT0S' }] },
    { ...relatorio(), porRecurso: [{ recursoId: 1, duracaoAlocada: 'PT30M' }] }]) {
    assert.throws(() => conferirUtilizacao(r, filtros), invalida);
  }
  const duas = { ...relatorio(), reservasConsideradas: 2, duracaoReservada: 'PT2H',
    porRecurso: [{ recursoId: 1, duracaoAlocada: 'PT2H' }] };
  assert.equal(conferirUtilizacao(duas, filtros).duracaoReservada, 'PT2H');
});
test('projeção descarta campos adicionais e mantém Duration bruto sem mutação', () => {
  const r = relatorio(); r.duracaoReservada = 'PT60M';
  const recebido = { ...r, email: 'privado', porRecurso: r.porRecurso.map(l => ({ ...l, solicitante: 'privado' })) };
  assert.deepEqual(conferirUtilizacao(recebido, filtros), r);
  const copia = conferirUtilizacao(recebido, filtros); copia.porRecurso[0].recursoId = 90;
  assert.equal(recebido.porRecurso[0].recursoId, 1);
});
test('cada reserva considerada contribui ao menos1ns para o total', () => {
  const r = { ...relatorio(), reservasConsideradas: 2, duracaoReservada: 'PT0.000000001S',
    porRecurso: [{ recursoId: 1, duracaoAlocada: 'PT0.000000001S' }] };
  assert.throws(() => conferirUtilizacao(r, filtros), invalida);
  const valido = { ...r, duracaoReservada: 'PT0.000000002S',
    porRecurso: [{ recursoId: 1, duracaoAlocada: 'PT0.000000002S' }] };
  assert.deepEqual(conferirUtilizacao(valido, filtros), valido);
});
test('cliente usa GET com sessão sem pedirCSRF ou enviar identidade', async () => {
  const chamadas = [];
  const api = criarApi({ fetchImpl: async (url, opcoes) => {
    chamadas.push({ url, opcoes }); return new Response(JSON.stringify(relatorio()), { status: 200 });
  } });
  assert.deepEqual(await criarRelatoriosUtilizacao(api).consultar(filtros), relatorio());
  assert.equal(chamadas.length, 1); assert.equal(chamadas[0].opcoes.method, 'GET');
  assert.equal(chamadas[0].opcoes.credentials, 'same-origin');
  assert.equal(chamadas[0].opcoes.body, undefined);
  assert.deepEqual(Object.fromEntries(chamadas[0].opcoes.headers), { accept: 'application/json' });
  assert(chamadas[0].url.startsWith('/api/relatorios/utilizacao?'));
});
test('cliente captura filtros antes da resposta e não repete consulta em erro', async () => {
  const f = { ...filtros };
  const cliente = criarRelatoriosUtilizacao({ limparCsrf() {}, async requisitar() {
    f.inicio = filtros.fim; return relatorio();
  } });
  assert.deepEqual(await cliente.consultar(f), relatorio());
  let chamadas = 0;
  const erro = new ErroApi(403, 'OPERACAO_NAO_PERMITIDA', 'Sem permissão.', 'rf12-1');
  const falho = criarRelatoriosUtilizacao({ limparCsrf() {}, async requisitar() { chamadas++; throw erro; } });
  await assert.rejects(falho.consultar(filtros), e => e === erro); assert.equal(chamadas, 1);
  await assert.rejects(falho.consultar({ ...filtros, recursoId: -1 }), { codigo: 'REQUISICAO_INVALIDA' });
  assert.equal(chamadas, 1);
});
