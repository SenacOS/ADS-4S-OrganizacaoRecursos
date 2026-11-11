import { api, ErroApi } from './api.js';
import { criarRecursos } from './recursos.js';
import { dataComOffset } from './datas.js';

export const diasSemana = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
export const nomesDias = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
/** @typedef {{dia: string, inicio: string, fim: string}} Janela */
/** @typedef {{id: number, recurso_id: number, inicio_utc: string, fim_utc: string, motivo: string, status: string}} Bloqueio */
/** @param {string} mensagem */
function invalido(mensagem) { return new ErroApi(400, 'REQUISICAO_INVALIDA', mensagem); }
function incerta() {
  return new ErroApi(200, 'RESPOSTA_INVALIDA', 'Não foi possível confirmar os dados retornados. Consulte o estado atual antes de reenviar uma alteração.');
}
/** @param {number} valor */
function idValido(valor) {
  if (!Number.isSafeInteger(valor) || valor < 1) throw invalido('Identificador de recurso ou bloqueio inválido.');
  return valor;
}
/** @param {any} valor @param {number} max */
function texto(valor, max) {
  if (typeof valor !== 'string' || !valor.trim()) throw invalido('Preencha os campos obrigatórios.');
  const normal = valor.trim().replace(/\s+/g, ' ');
  // Java mede String em unidades UTF-16; o limite coincide com maxlength no formulário.
  if (normal.length > max) throw invalido(`Um campo excede o limite de ${max} caracteres.`);
  return normal;
}

/** Lista explícita por tipo: nunca envia identidade, envelope ou campos de outros tipos.
 * @param {any} entrada @returns {import('./recursos.js').DadosRecurso} */
export function dadosCadastro(entrada) {
  if (!entrada || !['SALA', 'PROFESSOR', 'MATERIAL'].includes(entrada.tipo)
    || typeof entrada.ativo !== 'boolean' || typeof entrada.restrito !== 'boolean') {
    throw invalido('Informe tipo, estado e restrição válidos.');
  }
  const comum = { tipo: entrada.tipo, codigo: texto(entrada.codigo, 80), ativo: entrada.ativo, restrito: entrada.restrito };
  if (entrada.tipo === 'SALA') {
    if (!Number.isSafeInteger(entrada.capacidade) || entrada.capacidade < 1 || entrada.capacidade > 2147483647) {
      throw invalido('Informe uma capacidade inteira positiva válida.');
    }
    return { ...comum, capacidade: entrada.capacidade, localizacao: texto(entrada.localizacao, 200), tipoSala: texto(entrada.tipoSala, 80) };
  }
  if (entrada.tipo === 'PROFESSOR') {
    if (!Array.isArray(entrada.competencias)) throw invalido('Informe as competências como uma lista.');
    return { ...comum, nome: texto(entrada.nome, 120), competencias: entrada.competencias.map((/** @type {any} */ c) => texto(c, 120)) };
  }
  return { ...comum, patrimonio: texto(entrada.patrimonio, 80), descricao: texto(entrada.descricao, 500), condicao: texto(entrada.condicao, 120) };
}

/** @param {any} resposta @param {number} [id] @param {string} [tipo] @returns {import('./recursos.js').Recurso} */
function conferirRecurso(resposta, id, tipo) {
  try {
    idValido(resposta?.id);
    const dados = dadosCadastro(resposta?.dados);
    if ((id !== undefined && resposta.id !== id) || (tipo && dados.tipo !== tipo)
      || !(resposta.disponivel === null || typeof resposta.disponivel === 'boolean')) throw incerta();
    return { id: resposta.id, dados, disponivel: resposta.disponivel };
  } catch { throw incerta(); }
}

/** LocalTime não é UTC. A comparação preserva frações de até nove casas do contrato Java.
 * @param {string} valor */
function hora(valor) {
  if (typeof valor !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?$/.test(valor)) {
    throw invalido('Informe horários válidos para o expediente.');
  }
  const [h, m, s = '00'] = valor.split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/** @param {Janela[]} entrada @returns {{janelas: Janela[]}} */
export function dadosExpediente(entrada) {
  if (!Array.isArray(entrada)) throw invalido('Informe todas as janelas de funcionamento.');
  const janelas = entrada.map((j) => {
    if (!j || !diasSemana.includes(j.dia) || hora(j.fim) <= hora(j.inicio)) {
      throw invalido('O fim de cada janela deve ser posterior ao início.');
    }
    return { dia: j.dia, inicio: j.inicio, fim: j.fim };
  });
  if (janelas.some((j, i) => janelas.some((k, n) => n > i && j.dia === k.dia
    && hora(j.inicio) < hora(k.fim) && hora(j.fim) > hora(k.inicio)))) {
    throw invalido('As janelas do mesmo dia não podem se sobrepor.');
  }
  return { janelas };
}

/** @param {any} resposta @param {number} recursoId @param {number} [id] @returns {Bloqueio} */
function conferirBloqueio(resposta, recursoId, id) {
  if (!Number.isSafeInteger(resposta?.id) || resposta.id < 1 || resposta.recurso_id !== recursoId
    || (id !== undefined && resposta.id !== id) || !['ATIVO', 'CANCELADO'].includes(resposta.status)
    || !dataComOffset(resposta.inicio_utc) || !dataComOffset(resposta.fim_utc)
    || Date.parse(resposta.fim_utc) <= Date.parse(resposta.inicio_utc)
    || typeof resposta.motivo !== 'string' || !resposta.motivo.trim()) throw incerta();
  return { id: resposta.id, recurso_id: recursoId, inicio_utc: resposta.inicio_utc,
    fim_utc: resposta.fim_utc, motivo: resposta.motivo, status: resposta.status };
}

/** @param {typeof api} [cliente] */
export function criarAdministracao(cliente = api) {
  const leitura = criarRecursos(cliente);
  return {
    pesquisar: leitura.pesquisar,
    /** @param {number} id */
    async obter(id) { return conferirRecurso(await cliente.requisitar('/api/recursos/' + idValido(id)), id); },
    /** @param {import('./recursos.js').DadosRecurso} entrada @param {import('./recursos.js').Recurso} [original] */
    async salvar(entrada, original) {
      const dados = dadosCadastro(entrada);
      if (original && original.dados.tipo !== dados.tipo) throw invalido('O tipo do recurso não pode ser alterado.');
      const caminho = '/api/recursos' + (original ? '/' + idValido(original.id) : '');
      const resposta = conferirRecurso(await cliente.requisitar(caminho, { method: original ? 'PUT' : 'POST', body: dados }), original?.id, dados.tipo);
      for (const chave of Object.keys(dados)) {
        const k = /** @type {keyof typeof dados} */ (chave);
        if (k === 'competencias') {
          const canonico = (/** @type {string[]} */ cs) => JSON.stringify([...new Set(cs.map((c) => c.toLowerCase()))].sort());
          if (canonico(dados.competencias ?? []) !== canonico(resposta.dados.competencias ?? [])) throw incerta();
        } else if (dados[k] !== resposta.dados[k]) throw incerta();
      }
      return resposta;
    },
    /** @param {number} id */
    async desativar(id) {
      if (await cliente.requisitar('/api/recursos/' + idValido(id), { method: 'DELETE' }) !== null) throw incerta();
    },
    /** @param {number} recursoId */
    async bloqueios(recursoId) {
      const resposta = await cliente.requisitar('/api/recursos/' + idValido(recursoId) + '/bloqueios');
      if (!Array.isArray(resposta)) throw incerta();
      const itens = resposta.map((r) => conferirBloqueio(r, recursoId));
      if (new Set(itens.map((r) => r.id)).size !== itens.length) throw incerta();
      return itens;
    },
    /** @param {number} recursoId @param {{inicio: string, fim: string, motivo: string}} entrada */
    async bloquear(recursoId, entrada) {
      idValido(recursoId);
      if (!dataComOffset(entrada.inicio) || !dataComOffset(entrada.fim) || Date.parse(entrada.fim) <= Date.parse(entrada.inicio)) {
        throw invalido('Informe início e fim válidos, com offset e fim posterior.');
      }
      const body = { inicio: entrada.inicio, fim: entrada.fim, motivo: texto(entrada.motivo, 500) };
      const r = conferirBloqueio(await cliente.requisitar(`/api/recursos/${recursoId}/bloqueios`, { method: 'POST', body }), recursoId);
      if (r.status !== 'ATIVO' || Date.parse(r.inicio_utc) !== Date.parse(body.inicio)
        || Date.parse(r.fim_utc) !== Date.parse(body.fim) || texto(r.motivo, 500) !== body.motivo) throw incerta();
      return r;
    },
    /** @param {number} id @param {number} recursoId */
    async cancelarBloqueio(id, recursoId) {
      idValido(recursoId);
      const r = conferirBloqueio(await cliente.requisitar(`/api/bloqueios/${idValido(id)}/cancelamento`, { method: 'POST' }), recursoId, id);
      if (r.status !== 'CANCELADO') throw incerta();
      return r;
    },
    async expediente() {
      const resposta = await leitura.expediente();
      try { dadosExpediente(resposta.janelas); } catch { throw incerta(); }
      return resposta;
    },
    /** @param {Janela[]} janelas */
    async salvarExpediente(janelas) {
      const body = dadosExpediente(janelas);
      const resposta = await cliente.requisitar('/api/horarios-funcionamento', { method: 'PUT', body });
      try {
        if (resposta?.zona !== 'America/Sao_Paulo') throw incerta();
        const confirmado = dadosExpediente(resposta.janelas);
        const canonico = (/** @type {Janela[]} */ js) => JSON.stringify(js.map((j) => `${j.dia}/${hora(j.inicio)}/${hora(j.fim)}`).sort());
        if (canonico(body.janelas) !== canonico(confirmado.janelas)) throw incerta();
        return { zona: resposta.zona, ...confirmado };
      } catch { throw incerta(); }
    },
  };
}

export const administracao = criarAdministracao();
