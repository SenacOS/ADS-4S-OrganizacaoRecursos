import { ErroApi } from './api.js';
import { podeAprovar } from './auth.js';
import { criarAprovacoes } from './aprovacoes.js';
import { apresentarData, intervaloDoFormulario } from './datas.js';
import { criarEnvioUnico } from './forms.js';
import { iniciarPaginaAutenticada } from './sessao-page.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

/** @param {string} id */
function botao(id) { return /** @type {HTMLButtonElement} */ (elemento(id)); }
/** @param {string} id */
function campo(id) { return /** @type {HTMLInputElement|HTMLSelectElement} */ (elemento(id)); }
/** @param {string} tag @param {string} valor @param {string} [classe] */
function texto(tag, valor, classe = '') {
  const item = document.createElement(tag);
  item.textContent = valor;
  item.className = classe;
  return item;
}

iniciarPaginaAutenticada('Aprovações', (usuario) => {
  if (!podeAprovar(usuario)) {
    elemento('acesso-negado').hidden = false;
    queueMicrotask(() => elemento('acesso-negado').focus());
    return;
  }
  elemento('area-aprovacoes').hidden = false;
  const cliente = criarAprovacoes(usuario);
  const formFila = /** @type {HTMLFormElement} */ (elemento('form-fila'));
  const formDecisao = /** @type {HTMLFormElement} */ (elemento('form-decisao'));
  if (!(formFila instanceof HTMLFormElement) || !(formDecisao instanceof HTMLFormElement)) throw new Error('Estrutura de aprovação inválida.');
  const enviarDecisao = criarEnvioUnico(formDecisao);
  const camposFila = /** @type {HTMLFieldSetElement} */ (elemento('filtros-fila'));
  const camposDecisao = /** @type {HTMLFieldSetElement} */ (elemento('campos-decisao'));
  const motivo = /** @type {HTMLTextAreaElement} */ (elemento('motivo-decisao'));
  const feedbackFila = elemento('feedback-fila');
  const referenciaFila = elemento('referencia-fila');
  const feedbackDecisao = elemento('feedback-decisao');
  const referenciaDecisao = elemento('referencia-decisao');
  /** @type {import('./aprovacoes.js').PaginaFila|undefined} */
  let pagina;
  /** @type {import('./aprovacoes.js').FiltrosFila|undefined} */
  let consulta;
  /** @type {import('./aprovacoes.js').Pendente|undefined} */
  let selecionada;
  let versao = 0;
  let carregando = false;
  let decidindo = false;

  /** @returns {'APROVADA'|'REJEITADA'} */
  function escolha() {
    return formDecisao.querySelector('input[value="REJEITADA"]:checked') ? 'REJEITADA' : 'APROVADA';
  }

  function atualizarControles() {
    camposFila.disabled = decidindo;
    camposDecisao.disabled = decidindo;
    botao('atualizar-fila').disabled = carregando || decidindo;
    botao('fila-anterior').disabled = carregando || decidindo || !pagina || pagina.pagina === 0;
    botao('fila-seguinte').disabled = carregando || decidindo || !pagina || (pagina.pagina + 1) * pagina.tamanho >= pagina.total;
    botao('confirmar-decisao').disabled = carregando || decidindo || !selecionada;
    botao('confirmar-decisao').textContent = decidindo ? 'Registrando decisão…' : escolha() === 'APROVADA' ? 'Confirmar aprovação' : 'Confirmar rejeição';
    elemento('pagina-fila').textContent = pagina
      ? `Página ${pagina.pagina + 1} de ${Math.max(1, Math.ceil(pagina.total / pagina.tamanho))}` : 'Consulte a fila para ver as páginas';
    for (const controle of Array.from(elemento('lista-fila').querySelectorAll('button'))) controle.disabled = carregando || decidindo;
  }

  function limparDetalhes() {
    selecionada = undefined;
    elemento('detalhes-pendente').hidden = true;
    elemento('dados-pendente').replaceChildren();
    elemento('recursos-pendente').replaceChildren();
    formDecisao.reset();
    elemento('campo-motivo').hidden = true;
    motivo.required = false;
  }

  /** @param {import('./aprovacoes.js').Pendente} pendente */
  function mostrarDetalhes(pendente) {
    if (carregando || decidindo) return;
    limparDetalhes();
    selecionada = pendente;
    mostrarMensagem(feedbackDecisao, referenciaDecisao, '');
    const dados = elemento('dados-pendente');
    for (const [rotulo, valor] of [
      ['Reserva', '#' + pendente.id], ['Solicitante', pendente.solicitante.identificacao],
      ['Início em São Paulo', apresentarData(pendente.inicio)], ['Fim em São Paulo', apresentarData(pendente.fim)],
    ]) {
      const grupo = document.createElement('div');
      grupo.append(texto('dt', rotulo), texto('dd', valor));
      dados.append(grupo);
    }
    const lista = elemento('recursos-pendente');
    for (const recurso of pendente.recursos) {
      const tipo = { SALA: 'Sala', PROFESSOR: 'Docente', MATERIAL: 'Material' }[recurso.tipo];
      lista.append(texto('li', `${tipo}: ${recurso.identificacao}` + (recurso.patrimonio ? ` · Patrimônio: ${recurso.patrimonio}` : '')));
    }
    elemento('detalhes-pendente').hidden = false;
    atualizarControles();
    elemento('detalhes-pendente').focus();
  }

  function desenharFila() {
    const lista = elemento('lista-fila');
    lista.replaceChildren();
    if (!pagina) return;
    for (const pendente of pagina.itens) {
      const card = texto('article', '', 'resource-card pending-card');
      card.append(texto('p', 'SOLICITADA · RESTRITA', 'eyebrow'), texto('h3', 'Reserva #' + pendente.id),
        texto('p', pendente.solicitante.identificacao), texto('p', apresentarData(pendente.inicio) + ' até ' + apresentarData(pendente.fim), 'resource-description'),
        texto('p', pendente.recursos.map((r) => r.identificacao).join('; '), 'resource-description'));
      const avaliar = document.createElement('button');
      avaliar.type = 'button';
      avaliar.className = 'button button-secondary';
      avaliar.id = 'avaliar-' + pendente.id;
      avaliar.textContent = 'Avaliar solicitação';
      avaliar.setAttribute('aria-label', 'Avaliar reserva ' + pendente.id);
      avaliar.addEventListener('click', () => mostrarDetalhes(pendente));
      card.append(avaliar);
      lista.append(card);
    }
    atualizarControles();
  }

  /** @returns {import('./aprovacoes.js').FiltrosFila} */
  function lerFiltros() {
    return { ...intervaloDoFormulario(campo('inicio-fila').value, campo('fim-fila').value, false, false),
      recursoId: campo('recurso-fila').value ? Number(campo('recurso-fila').value) : undefined,
      tamanho: Number(campo('tamanho-fila').value), pagina: 0 };
  }

  /** @param {import('./aprovacoes.js').FiltrosFila} filtros @param {number} atual */
  async function lerPagina(filtros, atual) {
    let resposta = await cliente.listar(filtros);
    if (atual !== versao) return;
    if (resposta.itens.length === 0 && resposta.pagina > 0) {
      const ultima = Math.max(0, Math.ceil(resposta.total / resposta.tamanho) - 1);
      resposta = await cliente.listar({ ...filtros, pagina: Math.min(resposta.pagina - 1, ultima) });
      if (atual !== versao) return;
    }
    pagina = resposta;
    consulta = { ...filtros, pagina: resposta.pagina };
    elemento('resumo-fila').textContent = resposta.total ? `${resposta.total} solicitação(ões) pendente(s)` : 'Nenhuma solicitação pendente para estes filtros.';
    mostrarMensagem(feedbackFila, referenciaFila, '');
    desenharFila();
  }

  /** @param {import('./aprovacoes.js').FiltrosFila} [filtros] */
  async function carregarFila(filtros) {
    if (carregando || decidindo) return;
    let atual = versao;
    try {
      const proxima = filtros ?? lerFiltros();
      atual = ++versao;
      carregando = true;
      limparDetalhes();
      pagina = undefined;
      desenharFila();
      atualizarControles();
      mostrarMensagem(feedbackFila, referenciaFila, 'Consultando solicitações…');
      elemento('resumo-fila').textContent = '';
      await lerPagina(proxima, atual);
    } catch (erro) {
      if (atual === versao) mostrarErro(erro, feedbackFila, referenciaFila);
    } finally { carregando = false; atualizarControles(); }
  }

  function invalidarFila() {
    if (decidindo) return;
    versao++;
    pagina = undefined;
    consulta = undefined;
    limparDetalhes();
    desenharFila();
    atualizarControles();
    elemento('resumo-fila').textContent = 'Filtros alterados. Consulte a fila novamente.';
    mostrarMensagem(feedbackFila, referenciaFila, '');
  }
  formFila.addEventListener('input', invalidarFila);
  formFila.addEventListener('reset', () => { queueMicrotask(invalidarFila); });
  formFila.addEventListener('submit', (evento) => { evento.preventDefault(); if (formFila.reportValidity()) void carregarFila(); });
  botao('atualizar-fila').addEventListener('click', () => { if (formFila.reportValidity()) void carregarFila(consulta); });
  botao('fila-anterior').addEventListener('click', () => { if (pagina && consulta) void carregarFila({ ...consulta, pagina: pagina.pagina - 1 }); });
  botao('fila-seguinte').addEventListener('click', () => { if (pagina && consulta) void carregarFila({ ...consulta, pagina: pagina.pagina + 1 }); });
  formDecisao.addEventListener('change', () => {
    const rejeitar = escolha() === 'REJEITADA';
    elemento('campo-motivo').hidden = !rejeitar;
    motivo.required = rejeitar;
    atualizarControles();
  });
  botao('fechar-detalhes').addEventListener('click', () => {
    const id = selecionada?.id;
    limparDetalhes();
    atualizarControles();
    if (id) botao('avaliar-' + id).focus();
  });
  formDecisao.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (decidindo || carregando || !selecionada || !consulta || !formDecisao.reportValidity()) return;
    const pendente = selecionada;
    const filtros = { ...consulta };
    const status = escolha();
    const justificativa = motivo.value;
    try {
      await enviarDecisao(async () => {
        decidindo = true;
        atualizarControles();
        mostrarMensagem(feedbackDecisao, referenciaDecisao, 'Registrando sua decisão…');
        try {
          const resposta = await cliente.decidir(pendente, status, justificativa);
          mostrarMensagem(feedbackDecisao, referenciaDecisao, `Decisão confirmada: reserva #${resposta.id} ${resposta.status}.`, 'success');
          feedbackDecisao.focus();
          limparDetalhes();
          pagina = undefined;
          desenharFila();
          carregando = true;
          mostrarMensagem(feedbackFila, referenciaFila, 'Atualizando a fila…');
          try { await lerPagina(filtros, ++versao); }
          catch (erro) {
            mostrarErro(erro, feedbackFila, referenciaFila);
            elemento('resumo-fila').textContent = 'A decisão foi confirmada. Atualize a fila para consultar as demais solicitações.';
          }
        } finally { decidindo = false; carregando = false; }
      });
    } catch (erro) {
      mostrarErro(erro, feedbackDecisao, referenciaDecisao);
      if (erro instanceof ErroApi && (erro.status === 409 || erro.status === 0)) {
        limparDetalhes();
        pagina = undefined;
        desenharFila();
        elemento('resumo-fila').textContent = 'Atualize a fila antes de tomar outra decisão.';
      }
    } finally { atualizarControles(); }
  });
  void carregarFila();
});
