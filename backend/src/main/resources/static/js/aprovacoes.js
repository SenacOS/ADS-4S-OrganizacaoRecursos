import { api, ErroApi } from './api.js';
import { podeAprovar } from './auth.js';
import { dataComOffset } from './datas.js';
import { criarReservas } from './reservas.js';

/** @typedef {{id: number, tipo: 'SALA'|'PROFESSOR'|'MATERIAL', identificacao: string, patrimonio?: string}} RecursoFila */
/** @typedef {{id: number, solicitanteId: number, status: 'SOLICITADA', restrita: true,
 * inicio: string, fim: string, recursosIds: number[], motivoDecisao: string|null,
 * solicitante: {usuarioId: number, identificacao: string}, recursos: RecursoFila[]}} Pendente */
/** @typedef {{inicio?: string, fim?: string, recursoId?: number, pagina?: number, tamanho?: number}} FiltrosFila */
/** @typedef {{itens: Pendente[], pagina: number, tamanho: number, total: number}} PaginaFila */

/** @param {unknown} valor */
function idValido(valor) { return typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0; }
/** @param {unknown} valor */
function textoValido(valor) { return typeof valor === 'string' && !!valor.trim(); }
/** @param {unknown} valor @returns {valor is number[]} */
function idsValidos(valor) {
  return Array.isArray(valor) && valor.length > 0 && valor.every(idValido) && new Set(valor).size === valor.length;
}
function respostaInvalida() {
  return new ErroApi(200, 'RESPOSTA_INVALIDA', 'Não foi possível interpretar a fila. Atualize a consulta antes de decidir.');
}

/** Leitura especificada para RESPONSAVEL; não implementa listagem geral/Q9.
 * @param {FiltrosFila} [filtros] */
export function parametrosFila({ inicio, fim, recursoId, pagina = 0, tamanho = 20 } = {}) {
  if (!Number.isSafeInteger(pagina) || pagina < 0 || !Number.isSafeInteger(tamanho) || tamanho < 1 || tamanho > 100
    || (recursoId !== undefined && !idValido(recursoId))) {
    throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Informe recurso e paginação válidos.');
  }
  if ((inicio === undefined) !== (fim === undefined)
    || (inicio !== undefined && (!dataComOffset(inicio) || !dataComOffset(fim ?? '') || Date.parse(fim ?? '') <= Date.parse(inicio)))) {
    throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Informe início e fim válidos juntos, com fuso horário.');
  }
  const params = new URLSearchParams({ status: 'SOLICITADA', pagina: String(pagina), tamanho: String(tamanho) });
  if (inicio !== undefined && fim !== undefined) { params.set('inicio', inicio); params.set('fim', fim); }
  if (recursoId !== undefined) params.set('recursoId', String(recursoId));
  return params;
}

/** Projeção explícita: dados extras da API não passam para a interface.
 * @param {any} item @returns {Pendente} */
function pendenteValida(item) {
  if (!idValido(item?.id) || !idValido(item.solicitanteId) || item.status !== 'SOLICITADA' || item.restrita !== true
    || !dataComOffset(item.inicio) || !dataComOffset(item.fim) || Date.parse(item.fim) <= Date.parse(item.inicio)
    || !idsValidos(item.recursosIds) || item.solicitante?.usuarioId !== item.solicitanteId
    || !textoValido(item.solicitante.identificacao)
    || (item.motivoDecisao !== null && typeof item.motivoDecisao !== 'string')
    || !Array.isArray(item.recursos) || item.recursos.length !== item.recursosIds.length
    || !item.recursos.every((/** @type {any} */ r) => idValido(r?.id) && item.recursosIds.includes(r.id)
      && ['SALA', 'PROFESSOR', 'MATERIAL'].includes(r.tipo) && textoValido(r.identificacao)
      && (r.tipo !== 'MATERIAL' || textoValido(r.patrimonio)))
    || new Set(item.recursos.map((/** @type {any} */ r) => r.id)).size !== item.recursosIds.length) {
    throw respostaInvalida();
  }
  return { id: item.id, solicitanteId: item.solicitanteId, status: 'SOLICITADA', restrita: true,
    inicio: item.inicio, fim: item.fim, recursosIds: [...item.recursosIds], motivoDecisao: item.motivoDecisao,
    solicitante: { usuarioId: item.solicitanteId, identificacao: item.solicitante.identificacao },
    recursos: item.recursos.map((/** @type {any} */ r) => ({ id: r.id, tipo: r.tipo, identificacao: r.identificacao,
      ...(r.tipo === 'MATERIAL' ? { patrimonio: r.patrimonio } : {}) })) };
}

/** @param {any} resposta @param {Pendente} anterior @param {'APROVADA'|'REJEITADA'} status */
function confirmarDecisao(resposta, anterior, status) {
  if (resposta?.id !== anterior.id || resposta.solicitanteId !== anterior.solicitanteId
    || resposta.status !== status || resposta.restrita !== true
    || !dataComOffset(resposta.inicio) || !dataComOffset(resposta.fim)
    || Date.parse(resposta.inicio) !== Date.parse(anterior.inicio) || Date.parse(resposta.fim) !== Date.parse(anterior.fim)
    || !idsValidos(resposta.recursosIds) || resposta.recursosIds.length !== anterior.recursosIds.length
    || resposta.recursosIds.some((/** @type {number} */ id) => !anterior.recursosIds.includes(id))
    || (status === 'REJEITADA' && !textoValido(resposta.motivoDecisao))) {
    throw new ErroApi(0, 'RESPOSTA_INVALIDA', 'Não foi possível confirmar a decisão. Atualize a fila e confira o resultado antes de reenviar.');
  }
  return { id: resposta.id, status, motivoDecisao: typeof resposta.motivoDecisao === 'string' ? resposta.motivoDecisao : null };
}

/** Guardas de conveniência não substituem autorização do servidor.
 * @param {import('./auth.js').Usuario} usuario @param {typeof api} [cliente] */
export function criarAprovacoes(usuario, cliente = api) {
  const reservas = criarReservas(cliente);
  function exigirResponsavel() {
    if (!podeAprovar(usuario)) throw new ErroApi(403, 'OPERACAO_NAO_PERMITIDA', 'Esta área é exclusiva do perfil Responsável.');
  }
  return {
    /** @param {FiltrosFila} [filtros] @returns {Promise<PaginaFila>} */
    async listar(filtros = {}) {
      exigirResponsavel();
      const params = parametrosFila(filtros);
      const resposta = await cliente.requisitar('/api/reservas?' + params);
      if (!Array.isArray(resposta?.itens) || resposta.pagina !== Number(params.get('pagina'))
        || resposta.tamanho !== Number(params.get('tamanho')) || !Number.isSafeInteger(resposta.total) || resposta.total < 0
        || resposta.itens.length > resposta.tamanho || resposta.itens.length > resposta.total
        || (resposta.itens.length && resposta.pagina * resposta.tamanho + resposta.itens.length > resposta.total)) {
        throw respostaInvalida();
      }
      const itens = resposta.itens.map(pendenteValida);
      if (new Set(itens.map((/** @type {Pendente} */ item) => item.id)).size !== itens.length) throw respostaInvalida();
      return { itens, pagina: resposta.pagina, tamanho: resposta.tamanho, total: resposta.total };
    },
    /** @param {Pendente} pendente @param {'APROVADA'|'REJEITADA'} status @param {string} [motivo] */
    async decidir(pendente, status, motivo = '') {
      exigirResponsavel();
      const anterior = pendenteValida(pendente);
      if (!['APROVADA', 'REJEITADA'].includes(status)) throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Escolha aprovar ou rejeitar.');
      const resposta = status === 'APROVADA' ? await reservas.aprovar(anterior.id) : await reservas.rejeitar(anterior.id, motivo);
      return confirmarDecisao(resposta, anterior, status);
    },
  };
}
