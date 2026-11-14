import { api, ErroApi } from './api.js';
import { dataComOffset } from './datas.js';

/** @typedef {'SALA'|'PROFESSOR'|'MATERIAL'} TipoRecurso */
/** @typedef {{tipo: TipoRecurso, codigo: string, ativo: boolean, restrito: boolean,
 * capacidade?: number, localizacao?: string, tipoSala?: string, nome?: string,
 * competencias?: string[], patrimonio?: string, descricao?: string, condicao?: string}} DadosRecurso */
/** @typedef {{id: number, dados: DadosRecurso, disponivel: boolean|null}} Recurso */
/** @typedef {{tipo?: string, capacidadeMinima?: number, localizacao?: string,
 * competencia?: string, patrimonio?: string, inicio?: string, fim?: string,
 * disponivel?: boolean, pagina?: number, tamanho?: number}} FiltrosRecursos */
/** @typedef {{itens: Recurso[], pagina: number, tamanho: number, total: number}} PaginaRecursos */

const tipos = ['SALA', 'PROFESSOR', 'MATERIAL'];
const dias = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/** @param {string} mensagem */
function invalido(mensagem) { return new ErroApi(400, 'REQUISICAO_INVALIDA', mensagem); }
function respostaInvalida() {
  return new ErroApi(200, 'RESPOSTA_INVALIDA', 'Não foi possível interpretar a consulta. Tente pesquisar novamente.');
}

/** Lista explícita de filtros: não aceita identidade ou campos de administração.
 * @param {FiltrosRecursos} [filtros] */
export function parametrosPesquisa(filtros = {}) {
  const { tipo, capacidadeMinima, inicio, fim, disponivel, pagina = 0, tamanho = 20 } = filtros;
  if (!Number.isSafeInteger(pagina) || pagina < 0 || !Number.isSafeInteger(tamanho) || tamanho < 1 || tamanho > 100
    || (capacidadeMinima !== undefined && (!Number.isSafeInteger(capacidadeMinima) || capacidadeMinima < 1))) {
    throw invalido('Informe paginação e capacidade válidas.');
  }
  if (tipo && !tipos.includes(tipo)) throw invalido('Escolha um tipo de recurso válido.');
  if ((inicio === undefined) !== (fim === undefined)
    || (inicio !== undefined && (!dataComOffset(inicio) || !dataComOffset(fim ?? '') || Date.parse(fim ?? '') <= Date.parse(inicio)))
    || (disponivel !== undefined && (typeof disponivel !== 'boolean' || inicio === undefined))) {
    throw invalido('A disponibilidade exige início e fim válidos, com fuso horário.');
  }
  const params = new URLSearchParams({ pagina: String(pagina), tamanho: String(tamanho) });
  if (tipo) params.set('tipo', tipo);
  if (capacidadeMinima !== undefined) params.set('capacidadeMinima', String(capacidadeMinima));
  for (const chave of ['localizacao', 'competencia', 'patrimonio']) {
    const texto = filtros[/** @type {'localizacao'|'competencia'|'patrimonio'} */ (chave)];
    if (texto?.trim()) params.set(chave, texto.trim());
  }
  if (inicio !== undefined && fim !== undefined) { params.set('inicio', inicio); params.set('fim', fim); }
  if (disponivel !== undefined) params.set('disponivel', String(disponivel));
  return params;
}

/** @param {any} item @returns {item is Recurso} */
function recursoValido(item) {
  const d = item?.dados;
  const texto = (/** @type {unknown} */ valor) => typeof valor === 'string' && !!valor.trim();
  return Number.isSafeInteger(item?.id) && item.id > 0 && !!d && tipos.includes(d.tipo)
    && texto(d.codigo) && typeof d.ativo === 'boolean' && typeof d.restrito === 'boolean'
    && (item.disponivel === null || typeof item.disponivel === 'boolean')
    && (d.tipo !== 'SALA' || (Number.isSafeInteger(d.capacidade) && d.capacidade > 0 && texto(d.localizacao)))
    && (d.tipo !== 'PROFESSOR' || (texto(d.nome) && Array.isArray(d.competencias) && d.competencias.every(texto)))
    && (d.tipo !== 'MATERIAL' || (texto(d.patrimonio) && texto(d.descricao)));
}

/** @param {Recurso} recurso */
export function identificarRecurso({ dados }) {
  if (dados.tipo === 'PROFESSOR') return `${dados.nome} · ${dados.codigo}`;
  if (dados.tipo === 'MATERIAL') return `${dados.descricao} · ${dados.patrimonio}`;
  return dados.codigo;
}

/** @param {typeof api} [cliente] */
export function criarRecursos(cliente = api) {
  return {
    /** @param {FiltrosRecursos} [filtros] @returns {Promise<PaginaRecursos>} */
    async pesquisar(filtros = {}) {
      const params = parametrosPesquisa(filtros);
      const resposta = await cliente.requisitar('/api/recursos?' + params);
      if (!Array.isArray(resposta?.itens) || !resposta.itens.every(recursoValido)
        || resposta.pagina !== Number(params.get('pagina')) || resposta.tamanho !== Number(params.get('tamanho'))
        || !Number.isSafeInteger(resposta.total) || resposta.total < 0
        || resposta.itens.length > resposta.tamanho || resposta.itens.length > resposta.total
        || new Set(resposta.itens.map((/** @type {Recurso} */ r) => r.id)).size !== resposta.itens.length
        || (resposta.itens.length && resposta.pagina * resposta.tamanho + resposta.itens.length > resposta.total)) {
        throw respostaInvalida();
      }
      return resposta;
    },
    /** @returns {Promise<{zona: string, janelas: {dia: string, inicio: string, fim: string}[]}>} */
    async expediente() {
      const resposta = await cliente.requisitar('/api/horarios-funcionamento');
      const hora = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?$/;
      if (resposta?.zona !== 'America/Sao_Paulo' || !Array.isArray(resposta.janelas)
        || !resposta.janelas.every((/** @type {any} */ j) => dias.includes(j?.dia)
          && typeof j.inicio === 'string' && hora.test(j.inicio) && typeof j.fim === 'string' && hora.test(j.fim))) {
        throw respostaInvalida();
      }
      return resposta;
    },
  };
}

export const recursos = criarRecursos();
