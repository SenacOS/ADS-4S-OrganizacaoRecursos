import { api, ErroApi } from './api.js';

/** @typedef {{inicio: string, fim: string, recursosIds: number[]}} DadosReserva */

/** Validação de formato, sem presumir o fuso do navegador.
 * @param {string} valor */
function dataComOffset(valor) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(valor)
    && Number.isFinite(Date.parse(valor))
    && new Date(valor.slice(0, 10) + 'T00:00:00Z').toISOString().slice(0, 10) === valor.slice(0, 10);
}

/** @param {DadosReserva} dados */
function corpoReserva({ inicio, fim, recursosIds }) {
  if (!dataComOffset(inicio) || !dataComOffset(fim) || Date.parse(fim) <= Date.parse(inicio)) {
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
