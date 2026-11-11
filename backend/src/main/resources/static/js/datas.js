import { ErroApi } from './api.js';

export const zonaOperacional = 'America/Sao_Paulo';
const formatoCivil = new Intl.DateTimeFormat('en-CA', {
  timeZone: zonaOperacional, calendar: 'gregory', numberingSystem: 'latn',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

/** @param {number} instante */
function civil(instante) {
  const partes = Object.fromEntries(formatoCivil.formatToParts(instante).map((p) => [p.type, p.value]));
  return `${partes.year.padStart(4, '0')}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}`;
}

/** @param {string} mensagem */
function invalida(mensagem) {
  return new ErroApi(400, 'REQUISICAO_INVALIDA', mensagem);
}

/** Valida também o dia civil, sem aceitar normalização como 30/02.
 * @param {string} valor */
export function dataComOffset(valor) {
  if (typeof valor !== 'string'
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(valor)
    || !Number.isFinite(Date.parse(valor))) return false;
  return new Date(valor.slice(0, 10) + 'T00:00:00Z').toISOString().slice(0, 10) === valor.slice(0, 10)
    && Number(valor.slice(11, 13)) < 24;
}

/** datetime-local representa um horário civil de São Paulo, independentemente do navegador.
 * Compara offsets dos dois lados de uma transição para recusar horários ausentes/ambíguos.
 * @param {string} valor */
export function paraIsoOperacional(valor) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(valor)) {
    throw invalida('Informe uma data e um horário válidos.');
  }
  const completo = valor.length === 16 ? valor + ':00' : valor;
  const parede = Date.parse(completo + 'Z');
  if (!Number.isFinite(parede) || new Date(parede).toISOString().slice(0, 19) !== completo) {
    throw invalida('Informe uma data e um horário válidos.');
  }
  const offsets = new Set([-36, 0, 36].map((horas) => {
    const amostra = parede + horas * 3600000;
    return Date.parse(civil(amostra) + 'Z') - amostra;
  }));
  const candidatos = [...offsets].filter((offset) => civil(parede - offset) === completo);
  if (candidatos.length !== 1 || candidatos[0] % 60000 !== 0) {
    throw invalida('Esse horário é inexistente ou ambíguo em São Paulo. Escolha outro horário.');
  }
  const minutos = candidatos[0] / 60000;
  const absoluto = Math.abs(minutos);
  const sufixo = (minutos < 0 ? '-' : '+')
    + String(Math.floor(absoluto / 60)).padStart(2, '0') + ':' + String(absoluto % 60).padStart(2, '0');
  return completo + sufixo;
}

/** @param {string} inicio @param {string} fim @param {boolean} [obrigatorio] */
export function intervaloDoFormulario(inicio, fim, obrigatorio = false) {
  if (!inicio && !fim && !obrigatorio) return {};
  if (!inicio || !fim) throw invalida('Informe início e fim juntos.');
  const intervalo = { inicio: paraIsoOperacional(inicio), fim: paraIsoOperacional(fim) };
  if (Date.parse(intervalo.fim) <= Date.parse(intervalo.inicio)) {
    throw invalida('O fim deve ser posterior ao início.');
  }
  if (inicio.slice(0, 10) !== fim.slice(0, 10)) {
    throw invalida('Escolha início e fim no mesmo dia de funcionamento.');
  }
  return intervalo;
}

/** @param {string} valor */
export function apresentarData(valor) {
  if (!dataComOffset(valor)) throw invalida('Data recebida sem fuso horário válido.');
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: zonaOperacional, dateStyle: 'short', timeStyle: 'short',
  }).format(new Date(valor));
}
