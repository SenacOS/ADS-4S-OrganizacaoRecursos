import { api, ErroApi } from './api.js';
import { dataComOffset, instanteComPrecisao as instante } from './datas.js';

/** Contrato controlado RF12; endpoint e política reais ainda dependem do backend.
 * @typedef {{inicio:string,fim:string,recursoId?:number}} FiltrosUtilizacao
 * @typedef {{recursoId:number,duracaoAlocada:string}} AlocacaoRecurso
 * @typedef {{periodo:{inicio:string,fim:string},recursoId:number|null,estadosConsiderados:string[],
 * reservasConsideradas:number,duracaoReservada:string,porRecurso:AlocacaoRecurso[],conflitosEvitados:number}} RelatorioUtilizacao
 */
export const estadosUtilizacao = Object.freeze(['APROVADA', 'EM_USO', 'CONCLUIDA']);
/** @param {unknown} valor @returns {valor is number} */
const contagem = (valor) => typeof valor === 'number' && Number.isSafeInteger(valor) && valor >= 0;
/** @param {unknown} valor @returns {valor is number} */
const positivo = (valor) => contagem(valor) && valor > 0;
const respostaInvalida = () => new ErroApi(0, 'RESPOSTA_INVALIDA',
  'O relatório recebido não corresponde à consulta. Consulte novamente ou contate o suporte.');

/** Subconjunto temporal de Duration Java, exato em nanossegundos; não é data civil.
 * @param {unknown} valor @returns {bigint} */
export function duracaoEmNanos(valor) {
  const partes = typeof valor === 'string'
    ? /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d{1,9}))?S)?$/.exec(valor) : null;
  if (!partes || partes[0] !== valor || !partes.slice(1, 4).some(v => v !== undefined)) throw respostaInvalida();
  return (BigInt(partes[1] ?? 0) * 3600n + BigInt(partes[2] ?? 0) * 60n
    + BigInt(partes[3] ?? 0)) * 1000000000n + BigInt((partes[4] ?? '').padEnd(9, '0'));
}

/** Exibe horas acumuladas, minutos e segundos sem arredondamento/float.
 * O DTO conserva a string original. @param {string} valor */
export function apresentarDuracao(valor) {
  const nanos = duracaoEmNanos(valor);
  const segundos = nanos / 1000000000n;
  const horas = segundos / 3600n, minutos = segundos % 3600n / 60n;
  const fracao = (nanos % 1000000000n).toString().padStart(9, '0').replace(/0+$/, '');
  const partes = [];
  if (horas) partes.push(horas.toString() + ' h');
  if (minutos) partes.push(minutos.toString() + ' min');
  if (segundos % 60n || fracao || !partes.length) {
    partes.push((segundos % 60n).toString() + (fracao ? ',' + fracao : '') + ' s');
  }
  return partes.join(' ');
}

/** Projeta somente os filtros candidatos; nenhum papel/solicitante é enviado.
 * @param {FiltrosUtilizacao} filtros */
export function parametrosUtilizacao(filtros) {
  const { inicio, fim, recursoId } = filtros;
  if (!dataComOffset(inicio) || !dataComOffset(fim) || instante(fim) <= instante(inicio)) {
    throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Informe início e fim válidos, com fuso e fim posterior ao início.');
  }
  if (recursoId !== undefined && !positivo(recursoId)) {
    throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Informe um ID de recurso inteiro e positivo.');
  }
  const parametros = new URLSearchParams({ inicio, fim });
  if (recursoId !== undefined) parametros.set('recursoId', String(recursoId));
  return parametros;
}

/** Invariantes do DTO completo controlado, sem paginação. Validação não substitui
 * a autorização/projeção do servidor. @param {any} dados @param {FiltrosUtilizacao} filtros
 * @returns {RelatorioUtilizacao} */
export function conferirUtilizacao(dados, filtros) {
  if (!dataComOffset(dados?.periodo?.inicio) || !dataComOffset(dados?.periodo?.fim)
    || instante(dados.periodo.inicio) !== instante(filtros.inicio)
    || instante(dados.periodo.fim) !== instante(filtros.fim)
    || dados.recursoId !== (filtros.recursoId ?? null)
    || !Array.isArray(dados.estadosConsiderados) || dados.estadosConsiderados.length !== estadosUtilizacao.length
    || new Set(dados.estadosConsiderados).size !== estadosUtilizacao.length
    || !dados.estadosConsiderados.every((/** @type {string} */ estado) => estadosUtilizacao.includes(estado))
    || !contagem(dados.reservasConsideradas) || !contagem(dados.conflitosEvitados)
    || !Array.isArray(dados.porRecurso)) throw respostaInvalida();
  const total = duracaoEmNanos(dados.duracaoReservada);
  let somaAlocacoes = 0n;
  const ids = new Set();
  const linhas = dados.porRecurso.map((/** @type {any} */ linha) => {
    if (!positivo(linha?.recursoId) || ids.has(linha.recursoId)
      || (filtros.recursoId !== undefined && linha.recursoId !== filtros.recursoId)) throw respostaInvalida();
    ids.add(linha.recursoId);
    const duracao = duracaoEmNanos(linha.duracaoAlocada);
    if (duracao <= 0n || duracao > total) throw respostaInvalida();
    somaAlocacoes += duracao;
    return { recursoId: linha.recursoId, duracaoAlocada: linha.duracaoAlocada };
  });
  const limite = (instante(filtros.fim) - instante(filtros.inicio)) * BigInt(dados.reservasConsideradas);
  if (total > limite || total < BigInt(dados.reservasConsideradas)
    || (dados.reservasConsideradas === 0 && (total !== 0n || linhas.length !== 0))
    || (dados.reservasConsideradas > 0 && (total === 0n || linhas.length === 0))
    || somaAlocacoes < total || (filtros.recursoId !== undefined && somaAlocacoes !== total)) throw respostaInvalida();
  return {
    periodo: { inicio: dados.periodo.inicio, fim: dados.periodo.fim }, recursoId: dados.recursoId,
    estadosConsiderados: [...dados.estadosConsiderados], reservasConsideradas: dados.reservasConsideradas,
    duracaoReservada: dados.duracaoReservada, porRecurso: linhas, conflitosEvitados: dados.conflitosEvitados,
  };
}

/** @param {typeof api} [cliente] */
export function criarRelatoriosUtilizacao(cliente = api) {
  return {
    /** @param {FiltrosUtilizacao} filtros @returns {Promise<RelatorioUtilizacao>} */
    async consultar(filtros) {
      const parametros = parametrosUtilizacao(filtros);
      // Captura o filtro antes do await: o chamador pode alterar o objeto depois.
      const consulta = { inicio: filtros.inicio, fim: filtros.fim,
        ...(filtros.recursoId === undefined ? {} : { recursoId: filtros.recursoId }) };
      return conferirUtilizacao(await cliente.requisitar('/api/relatorios/utilizacao?' + parametros), consulta);
    },
  };
}
