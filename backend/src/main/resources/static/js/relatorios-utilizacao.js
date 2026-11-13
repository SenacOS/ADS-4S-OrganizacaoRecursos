import { api, ErroApi } from './api.js';
import { dataComOffset, instanteComPrecisao as instante } from './datas.js';

/** DTO do PR #39; a rota HTTP ainda é candidata.
 * @typedef {{inicio:string,fim:string,recursoId?:number}} FiltrosUtilizacao
 * @typedef {{recursoId:number,minutos:number}} AlocacaoRecurso
 * @typedef {{status:string,minutos:number}} AlocacaoStatus
 * @typedef {{id:number,recursoId:number,origem:string,momento:string,intervaloInicio:string,intervaloFim:string}} ConflitoUtilizacao
 * @typedef {{inicio:string,fim:string,recursoId:number|null,estados:string[],minutosReservados:number,
 * reservasConsideradas:number,porRecurso:AlocacaoRecurso[],porStatus:AlocacaoStatus[],conflitosEvitados:ConflitoUtilizacao[]}} RelatorioUtilizacao
 */
export const estadosUtilizacao = Object.freeze(['APROVADA', 'EM_USO', 'CONCLUIDA']);
const origensConflito = ['RESERVA', 'MANUTENCAO', 'RETIRADA_ABERTA'];
/** @param {unknown} valor @returns {valor is number} */
const contagem = (valor) => typeof valor === 'number' && Number.isSafeInteger(valor) && valor >= 0;
/** @param {unknown} valor @returns {valor is number} */
const positivo = (valor) => contagem(valor) && valor > 0;
const respostaInvalida = () => new ErroApi(0, 'RESPOSTA_INVALIDA',
  'O relatório recebido não corresponde à consulta. Consulte novamente ou contate o suporte.');

/** Conveniência visual provisória do #39; servidor deve autorizar cada consulta.
 * @param {import('./auth.js').Usuario|null} usuario */
export function podeConsultarUtilizacao(usuario) { return usuario?.papel === 'ADMINISTRADOR'; }

/** Minutos já truncados pelo servidor; não recuperar precisão que o DTO não envia.
 * @param {number} minutos */
export function apresentarMinutos(minutos) {
  if (!contagem(minutos)) throw respostaInvalida();
  return String(minutos) + ' min';
}

/** Projeta somente filtros candidatos; estados customizados ficam fora da tela.
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

/** Projeta/valida o DTO #39, sem interpretar o esquema Duration anterior.
 * A validação não substitui autorização no servidor. @param {any} dados @param {FiltrosUtilizacao} filtros
 * @returns {RelatorioUtilizacao} */
export function conferirUtilizacao(dados, filtros) {
  if (!dataComOffset(dados?.inicio) || !dataComOffset(dados?.fim)
    || instante(dados.inicio) !== instante(filtros.inicio) || instante(dados.fim) !== instante(filtros.fim)
    || dados.recursoId !== (filtros.recursoId ?? null)
    || !Array.isArray(dados.estados) || dados.estados.length !== estadosUtilizacao.length
    || new Set(dados.estados).size !== estadosUtilizacao.length
    || !dados.estados.every((/** @type {string} */ estado) => estadosUtilizacao.includes(estado))
    || !contagem(dados.reservasConsideradas) || !contagem(dados.minutosReservados)
    || !Array.isArray(dados.porRecurso) || !Array.isArray(dados.porStatus)
    || !Array.isArray(dados.conflitosEvitados)) throw respostaInvalida();
  const total = BigInt(dados.minutosReservados), ids = new Set();
  let somaRecursos = 0n;
  const recursos = dados.porRecurso.map((/** @type {any} */ linha) => {
    if (!positivo(linha?.recursoId) || ids.has(linha.recursoId)
      || !contagem(linha.minutos) || linha.minutos > dados.minutosReservados) throw respostaInvalida();
    ids.add(linha.recursoId);
    somaRecursos += BigInt(linha.minutos);
    return { recursoId: linha.recursoId, minutos: linha.minutos };
  });
  const estados = new Set();
  let somaStatus = 0n;
  const porStatus = dados.porStatus.map((/** @type {any} */ linha) => {
    if (!dados.estados.includes(linha?.status) || estados.has(linha.status)
      || !contagem(linha.minutos) || linha.minutos > dados.minutosReservados) throw respostaInvalida();
    estados.add(linha.status); somaStatus += BigInt(linha.minutos);
    return { status: linha.status, minutos: linha.minutos };
  });
  const semReservas = dados.reservasConsideradas === 0;
  const limite = (instante(filtros.fim) - instante(filtros.inicio)) * BigInt(dados.reservasConsideradas) / 60000000000n;
  // Duration.toMinutes é aplicado a cada agregado. Não exigir soma das linhas=total,
  // nem duração positiva em minutos para uma reserva com interseção positiva.
  if (total > limite || (semReservas && (total !== 0n || recursos.length || porStatus.length))
    || (!semReservas && (!recursos.length || !porStatus.length))
    || porStatus.length > dados.reservasConsideradas || somaStatus > total
    || (!semReservas && total - somaRecursos >= BigInt(recursos.length))
    || (!semReservas && total - somaStatus >= BigInt(porStatus.length))) throw respostaInvalida();
  if (filtros.recursoId !== undefined && !semReservas
    && !recursos.some((/** @type {AlocacaoRecurso} */ linha) => linha.recursoId === filtros.recursoId
      && linha.minutos === dados.minutosReservados)) throw respostaInvalida();

  const eventos = new Set();
  const conflitos = dados.conflitosEvitados.map((/** @type {any} */ evento) => {
    if (!positivo(evento?.id) || eventos.has(evento.id) || !positivo(evento.recursoId)
      || (filtros.recursoId !== undefined && evento.recursoId !== filtros.recursoId)
      || !origensConflito.includes(evento.origem) || !dataComOffset(evento.momento)
      || instante(evento.momento) < instante(filtros.inicio) || instante(evento.momento) >= instante(filtros.fim)
      || !dataComOffset(evento.intervaloInicio) || !dataComOffset(evento.intervaloFim)
      || instante(evento.intervaloFim) <= instante(evento.intervaloInicio)) throw respostaInvalida();
    eventos.add(evento.id);
    return { id: evento.id, recursoId: evento.recursoId, origem: evento.origem,
      momento: evento.momento, intervaloInicio: evento.intervaloInicio, intervaloFim: evento.intervaloFim };
  });
  return { inicio: dados.inicio, fim: dados.fim, recursoId: dados.recursoId, estados: [...dados.estados],
    minutosReservados: dados.minutosReservados, reservasConsideradas: dados.reservasConsideradas,
    porRecurso: recursos, porStatus, conflitosEvitados: conflitos };
}

/** @param {typeof api} [cliente] */
export function criarRelatoriosUtilizacao(cliente = api) {
  return {
    /** @param {FiltrosUtilizacao} filtros @returns {Promise<RelatorioUtilizacao>} */
    async consultar(filtros) {
      const parametros = parametrosUtilizacao(filtros);
      const consulta = { inicio: filtros.inicio, fim: filtros.fim,
        ...(filtros.recursoId === undefined ? {} : { recursoId: filtros.recursoId }) };
      return conferirUtilizacao(await cliente.requisitar('/api/relatorios/utilizacao?' + parametros), consulta);
    },
  };
}
