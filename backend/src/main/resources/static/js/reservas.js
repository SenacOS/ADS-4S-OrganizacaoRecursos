import { api, ErroApi } from './api.js';
import { dataComOffset, instanteComPrecisao } from './datas.js';

/** @typedef {{inicio: string, fim: string, recursosIds: number[]}} DadosReserva */

/** @typedef {{id: number, solicitanteId: number, status: 'APROVADA'|'SOLICITADA',
 * restrita: boolean, inicio: string, fim: string, recursosIds: number[]}} ReservaCriada */

/** Uma resposta inválida após a escrita não autoriza repetir o POST.
 * @param {any} resposta @param {DadosReserva} envio @param {number} usuarioId
 * @returns {ReservaCriada} */
export function confirmarCriacao(resposta, envio, usuarioId) {
  const ids = resposta?.recursosIds;
  const esperados = [...new Set(envio.recursosIds)];
  if (!Number.isSafeInteger(resposta?.id) || resposta.id <= 0
    || resposta.solicitanteId !== usuarioId || typeof resposta.restrita !== 'boolean'
    || resposta.status !== (resposta.restrita ? 'SOLICITADA' : 'APROVADA')
    || !dataComOffset(resposta.inicio) || !dataComOffset(resposta.fim)
    || Date.parse(resposta.inicio) !== Date.parse(envio.inicio)
    || Date.parse(resposta.fim) !== Date.parse(envio.fim)
    || !Array.isArray(ids) || ids.length !== esperados.length
    || new Set(ids).size !== ids.length || ids.some((id) => !esperados.includes(id))) {
    throw new ErroApi(0, 'RESPOSTA_INVALIDA',
      'Não foi possível confirmar os dados da reserva. Confira o resultado antes de reenviar.');
  }
  return { id: resposta.id, solicitanteId: usuarioId, status: resposta.status,
    restrita: resposta.restrita, inicio: resposta.inicio, fim: resposta.fim, recursosIds: [...ids] };
}

/** @param {DadosReserva} dados */
function corpoReserva({ inicio, fim, recursosIds }) {
  if (!dataComOffset(inicio) || !dataComOffset(fim) || instanteComPrecisao(fim) <= instanteComPrecisao(inicio)) {
    throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Informe início e fim com fuso horário; o fim deve ser posterior ao início.');
  }
  if (!Array.isArray(recursosIds) || !recursosIds.length
    || recursosIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Selecione ao menos um recurso válido.');
  }
  // Lista explícita: identidade, papel e status nunca vêm do formulário.
  return { inicio, fim, recursosIds: [...new Set(recursosIds)] };
}

/** @param {number} id */
function rota(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Identificador de reserva inválido.');
  }
  return '/api/reservas/' + id;
}

/** Somente escritas já contratadas. Não simula GETs ainda inexistentes.
 * @param {typeof api} [cliente] */
export function criarReservas(cliente = api) {
  return {
    /** @param {DadosReserva} dados */
    async criar(dados) {
      return cliente.requisitar('/api/reservas', { method: 'POST', body: corpoReserva(dados) });
    },
    /** PATCH substitui os três campos juntos.
     * @param {number} id @param {DadosReserva} dados */
    async editar(id, dados) {
      return cliente.requisitar(rota(id), { method: 'PATCH', body: corpoReserva(dados) });
    },
    /** @param {number} id */
    cancelar(id) {
      return cliente.requisitar(rota(id) + '/cancelamento', { method: 'POST' });
    },
    /** @param {number} id */
    aprovar(id) {
      return cliente.requisitar(rota(id) + '/aprovacao', { method: 'POST' });
    },
    /** @param {number} id @param {string} motivo */
    async rejeitar(id, motivo) {
      if (!motivo?.trim()) {
        throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Informe o motivo da rejeição.');
      }
      return cliente.requisitar(rota(id) + '/rejeicao', { method: 'POST', body: { motivo: motivo.trim() } });
    },
  };
}

export const reservas = criarReservas();
