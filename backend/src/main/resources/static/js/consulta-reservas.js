import { api, ErroApi } from './api.js';
import { dataComOffset, paraIsoOperacional, instanteComPrecisao as instante } from './datas.js';
import { criarReservas } from './reservas.js';

export const estadosReserva = ['SOLICITADA', 'APROVADA', 'EM_USO', 'CONCLUIDA', 'REJEITADA', 'CANCELADA', 'NAO_COMPARECEU'];
/** @typedef {{id:number,tipo:'SALA'|'PROFESSOR'|'MATERIAL',identificacao:string,patrimonio?:string}} ResumoRecurso */
/** @typedef {{id:number,solicitanteId:number,status:string,restrita:boolean,inicio:string,fim:string,
 * recursosIds:number[],motivoDecisao:string|null,solicitante:{usuarioId:number,identificacao:string},recursos:ResumoRecurso[]}} ReservaConsulta */
/** @typedef {{status?:string,inicio?:string,fim?:string,recursoId?:number,pagina?:number,tamanho?:number}} FiltrosReservas */
/** @typedef {{itens:ReservaConsulta[],pagina:number,tamanho:number,total:number}} PaginaReservas */
/** @param {unknown} n @returns {n is number} */
const positivo = (n) => typeof n === 'number' && Number.isSafeInteger(n) && n > 0;
/** @param {unknown} s @returns {s is string} */
const texto = (s) => typeof s === 'string' && !!s.trim();
/** @param {any} ids @returns {ids is number[]} */
const conjunto = (ids) => Array.isArray(ids) && ids.length > 0 && ids.every(positivo) && new Set(ids).size === ids.length;
/** @param {string} mensagem */
const invalida = (mensagem) => new ErroApi(400, 'REQUISICAO_INVALIDA', mensagem);
const incerta = () => new ErroApi(0, 'RESPOSTA_INVALIDA', 'Não foi possível confirmar a reserva. Atualize o detalhe antes de tentar outra operação.');

/** Projeta somente o contrato de leitura. @param {any} r @returns {ReservaConsulta} */
export function conferirReserva(r) {
  if (!positivo(r?.id) || !positivo(r.solicitanteId) || !estadosReserva.includes(r.status) || typeof r.restrita !== 'boolean'
    || !dataComOffset(r.inicio) || !dataComOffset(r.fim) || instante(r.fim) <= instante(r.inicio)
    || !conjunto(r.recursosIds) || r.solicitante?.usuarioId !== r.solicitanteId || !texto(r.solicitante.identificacao)
    || !(r.motivoDecisao === null || typeof r.motivoDecisao === 'string')
    || !Array.isArray(r.recursos) || r.recursos.length !== r.recursosIds.length
    || !r.recursos.every((/** @type {any} */ rec) => positivo(rec?.id) && r.recursosIds.includes(rec.id)
      && ['SALA', 'PROFESSOR', 'MATERIAL'].includes(rec.tipo) && texto(rec.identificacao)
      && (rec.tipo !== 'MATERIAL' || texto(rec.patrimonio)))
    || new Set(r.recursos.map((/** @type {any} */ rec) => rec.id)).size !== r.recursosIds.length) throw incerta();
  return { id:r.id,solicitanteId:r.solicitanteId,status:r.status,restrita:r.restrita,inicio:r.inicio,fim:r.fim,
    recursosIds:[...r.recursosIds],motivoDecisao:r.motivoDecisao,
    solicitante:{usuarioId:r.solicitanteId,identificacao:r.solicitante.identificacao},
    recursos:r.recursos.map((/** @type {any} */ rec) => ({id:rec.id,tipo:rec.tipo,identificacao:rec.identificacao,
      ...(rec.tipo === 'MATERIAL' ? {patrimonio:rec.patrimonio} : {})})) };
}

/** @param {FiltrosReservas} [f] */
export function parametrosReservas(f = {}) {
  const { status, inicio, fim, recursoId, pagina=0, tamanho=20 } = f;
  if (!Number.isSafeInteger(pagina) || pagina < 0 || !Number.isSafeInteger(tamanho) || tamanho < 1 || tamanho > 100
    || (recursoId !== undefined && !positivo(recursoId)) || (status && !estadosReserva.includes(status))) throw invalida('Informe estado, recurso e paginação válidos.');
  if ((inicio === undefined) !== (fim === undefined)
    || (inicio !== undefined && (!dataComOffset(inicio) || !dataComOffset(fim ?? '') || instante(fim ?? '') <= instante(inicio)))) throw invalida('Informe início e fim válidos juntos, com fuso horário.');
  const p=new URLSearchParams({pagina:String(pagina),tamanho:String(tamanho)});
  if (status) p.set('status',status);
  if (inicio !== undefined && fim !== undefined) { p.set('inicio',inicio);p.set('fim',fim); }
  if (recursoId !== undefined) p.set('recursoId',String(recursoId));
  return p;
}

/** Guardas de conveniência; servidor revalida. @param {ReservaConsulta} r @param {import('./auth.js').Usuario} u */
export function podeEditarReserva(r,u) {
  return ['SOLICITANTE','RESPONSAVEL','ADMINISTRADOR'].includes(u.papel) && r.solicitanteId === u.usuarioId
    && (r.status === 'SOLICITADA' || (r.status === 'APROVADA' && !r.restrita));
}
/** @param {ReservaConsulta} r @param {import('./auth.js').Usuario} u */
export function podeCancelarReserva(r,u) {
  return ['SOLICITANTE','RESPONSAVEL','ADMINISTRADOR'].includes(u.papel)
    && (r.solicitanteId === u.usuarioId || u.papel === 'ADMINISTRADOR') && ['SOLICITADA','APROVADA'].includes(r.status);
}
/** @param {any} r @param {ReservaConsulta} anterior @param {import('./reservas.js').DadosReserva} envio @param {string} estado */
function confirmar(r,anterior,envio,estado) {
  if (r?.id !== anterior.id || r.solicitanteId !== anterior.solicitanteId || r.status !== estado || r.restrita !== anterior.restrita
    || !dataComOffset(r.inicio) || !dataComOffset(r.fim) || instante(r.inicio) !== instante(envio.inicio) || instante(r.fim) !== instante(envio.fim)
    || !conjunto(r.recursosIds) || r.recursosIds.length !== envio.recursosIds.length || r.recursosIds.some((/** @type {number} */ id) => !envio.recursosIds.includes(id))
    || !(r.motivoDecisao === null || typeof r.motivoDecisao === 'string')) throw incerta();
  return r;
}

/** Horário civil exibido pelo input; original ISO é guardado separadamente. @param {string} iso */
export function paraCampoReserva(iso) {
  if (!dataComOffset(iso)) throw invalida('Horário recebido inválido.');
  const d=new Date(iso);
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d).map(v=>[v.type,v.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}` + (d.getUTCMilliseconds() ? '.'+String(d.getUTCMilliseconds()).padStart(3,'0') : '');
}
/** Preserva literalmente o campo não editado. @param {string} valor @param {string} inicial @param {string} original */
export function horarioDaEdicao(valor,inicial,original) {
  if (valor === inicial) return original;
  const partes=/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?)(\.\d{1,3})?$/.exec(valor);
  if (!partes) throw invalida('Informe um horário válido para a reserva.');
  const iso=paraIsoOperacional(partes[1]);
  return partes[2] ? iso.replace(/([+-]\d{2}:\d{2})$/,partes[2]+'$1') : iso;
}

/** @param {import('./auth.js').Usuario} usuario @param {typeof api} [cliente] */
export function criarConsultaReservas(usuario,cliente=api) {
  const escritas=criarReservas(cliente);
  /** @param {ReservaConsulta} r */
  function conferirEscopo(r) { if (usuario.papel === 'SOLICITANTE' && r.solicitanteId !== usuario.usuarioId) throw incerta();return r; }
  /** @param {number} id */
  function rota(id) { if (!positivo(id)) throw invalida('Reserva inválida.');return '/api/reservas/'+id; }
  return {
    /** @param {FiltrosReservas} [f] @returns {Promise<PaginaReservas>} */
    async listar(f={}) {
      const p=parametrosReservas(f),r=await cliente.requisitar('/api/reservas?'+p);
      if (!Array.isArray(r?.itens) || r.pagina !== Number(p.get('pagina')) || r.tamanho !== Number(p.get('tamanho'))
        || !Number.isSafeInteger(r.total) || r.total < 0 || r.itens.length > r.tamanho || r.itens.length > r.total
        || (r.itens.length && r.pagina*r.tamanho+r.itens.length > r.total)) throw incerta();
      const itens=r.itens.map((/** @type {any} */ v)=>conferirEscopo(conferirReserva(v)));
      if (new Set(itens.map((/** @type {ReservaConsulta} */ v)=>v.id)).size !== itens.length) throw incerta();
      return {itens,pagina:r.pagina,tamanho:r.tamanho,total:r.total};
    },
    /** @param {number} id */
    async detalhe(id) { const r=conferirEscopo(conferirReserva(await cliente.requisitar(rota(id))));if (r.id !== id) throw incerta();return r; },
    /** @param {ReservaConsulta} anterior @param {import('./reservas.js').DadosReserva} envio */
    async editar(anterior,envio) {
      if (!podeEditarReserva(anterior,usuario)) throw new ErroApi(403,'OPERACAO_NAO_PERMITIDA','Esta reserva não permite edição pelo seu usuário.');
      return confirmar(await escritas.editar(anterior.id,envio),anterior,envio,anterior.status);
    },
    /** @param {ReservaConsulta} anterior */
    async cancelar(anterior) {
      if (!podeCancelarReserva(anterior,usuario)) throw new ErroApi(403,'OPERACAO_NAO_PERMITIDA','Esta reserva não permite cancelamento pelo seu usuário.');
      return confirmar(await escritas.cancelar(anterior.id),anterior,anterior,'CANCELADA');
    },
  };
}
