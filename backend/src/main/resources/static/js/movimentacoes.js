import { api, ErroApi } from './api.js';
import { dataComOffset } from './datas.js';
import { criarRecursos } from './recursos.js';

/** @typedef {{id: number, recursoId: number, reservaId: number, responsavelId: number,
 * retiradoEm: string, devolvidoEm: string|null, devolvidoPor: number|null,
 * fimPrevisto: string, atrasoSegundos: number}} Movimentacao */
/** @param {number} id */
function positivo(id) { return Number.isSafeInteger(id) && id > 0; }
/** @param {string} mensagem */
function invalido(mensagem) { return new ErroApi(400, 'REQUISICAO_INVALIDA', mensagem); }
function incerta() {
  return new ErroApi(200, 'RESPOSTA_INVALIDA', 'Não foi possível confirmar os dados da movimentação. Atualize as pendências antes de reenviar uma operação.');
}

/** Instantes da API podem vir com Z; não são datetime-local nem horários do navegador.
 * @param {any} r @returns {Movimentacao} */
export function conferirMovimentacao(r) {
  if (!r || ![r.id, r.recursoId, r.reservaId, r.responsavelId].every(positivo)
    || !dataComOffset(r.retiradoEm) || !dataComOffset(r.fimPrevisto)
    || Date.parse(r.retiradoEm) > Date.parse(r.fimPrevisto)
    || !Number.isSafeInteger(r.atrasoSegundos) || r.atrasoSegundos < 0
    || !((r.devolvidoEm === null && r.devolvidoPor === null)
      || (dataComOffset(r.devolvidoEm) && positivo(r.devolvidoPor)
        && Date.parse(r.devolvidoEm) >= Date.parse(r.retiradoEm)))) throw incerta();
  return { id: r.id, recursoId: r.recursoId, reservaId: r.reservaId, responsavelId: r.responsavelId,
    retiradoEm: r.retiradoEm, devolvidoEm: r.devolvidoEm, devolvidoPor: r.devolvidoPor,
    fimPrevisto: r.fimPrevisto, atrasoSegundos: r.atrasoSegundos };
}

/** @param {Movimentacao} m @param {number} [agora] */
export function prazoUltrapassado(m, agora = Date.now()) {
  return m.devolvidoEm === null && Number.isFinite(agora) && agora > Date.parse(m.fimPrevisto);
}

/** @param {number} segundos */
export function apresentarAtraso(segundos) {
  if (!Number.isSafeInteger(segundos) || segundos < 0) throw incerta();
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  return `${horas} h ${minutos} min ${segundos % 60} s (${segundos} segundos)`;
}

/** @param {typeof api} [cliente] */
export function criarMovimentacoes(cliente = api) {
  const leitura = criarRecursos(cliente);
  return {
    async abertas() {
      const resposta = await cliente.requisitar('/api/movimentacoes?abertas=true');
      if (!Array.isArray(resposta)) throw incerta();
      const itens = resposta.map(conferirMovimentacao);
      if (itens.some((m) => m.devolvidoEm !== null)
        || new Set(itens.map((m) => m.id)).size !== itens.length
        || new Set(itens.map((m) => m.recursoId)).size !== itens.length) throw incerta();
      return itens;
    },
    /** @param {number} id @returns {Promise<import('./recursos.js').Recurso>} */
    async material(id) {
      if (!positivo(id)) throw invalido('Identificador do material inválido.');
      const r = await cliente.requisitar('/api/recursos/' + id);
      const d = r?.dados;
      if (r?.id !== id || !d || d.tipo !== 'MATERIAL'
        || ![d.codigo, d.patrimonio, d.descricao].every((v) => typeof v === 'string' && !!v.trim())
        || typeof d.ativo !== 'boolean' || typeof d.restrito !== 'boolean') throw incerta();
      return { id, dados: { tipo: 'MATERIAL', codigo: d.codigo, patrimonio: d.patrimonio,
        descricao: d.descricao, ativo: d.ativo, restrito: d.restrito, condicao: d.condicao }, disponivel: null };
    },
    /** @param {string} patrimonio @param {number} [pagina] */
    pesquisarMateriais(patrimonio, pagina = 0) {
      return leitura.pesquisar({ tipo: 'MATERIAL', patrimonio, pagina, tamanho: 20 });
    },
    /** @param {{reservaId: number, recursoId: number}} entrada @param {number} usuarioId */
    async retirar(entrada, usuarioId) {
      if (!positivo(entrada.reservaId) || !positivo(entrada.recursoId) || !positivo(usuarioId)) {
        throw invalido('Informe o número da reserva e selecione um material válido.');
      }
      const body = { reservaId: entrada.reservaId, recursoId: entrada.recursoId };
      const r = conferirMovimentacao(await cliente.requisitar('/api/movimentacoes/retiradas', { method: 'POST', body }));
      if (r.reservaId !== body.reservaId || r.recursoId !== body.recursoId
        || r.responsavelId !== usuarioId || r.devolvidoEm !== null) throw incerta();
      return r;
    },
    /** O retorno idempotente pode registrar outro operador; preservar quem consta na API.
     * @param {Movimentacao} original */
    async devolver(original) {
      const anterior = conferirMovimentacao(original);
      const r = conferirMovimentacao(await cliente.requisitar(`/api/movimentacoes/${anterior.id}/devolucao`, { method: 'POST' }));
      if (r.id !== anterior.id || r.recursoId !== anterior.recursoId || r.reservaId !== anterior.reservaId
        || r.responsavelId !== anterior.responsavelId || r.devolvidoEm === null
        || Date.parse(r.retiradoEm) !== Date.parse(anterior.retiradoEm)
        || Date.parse(r.fimPrevisto) !== Date.parse(anterior.fimPrevisto)) throw incerta();
      return r;
    },
  };
}

export const movimentacoes = criarMovimentacoes();
