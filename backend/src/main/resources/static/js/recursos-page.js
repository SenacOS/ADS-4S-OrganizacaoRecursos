import { ErroApi } from './api.js';
import { intervaloDoFormulario, apresentarData } from './datas.js';
import { criarEnvioUnico } from './forms.js';
import { recursos, identificarRecurso } from './recursos.js';
import { reservas, confirmarCriacao } from './reservas.js';
import { iniciarPaginaAutenticada } from './sessao-page.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

const modoReserva = document.body.dataset.reserva === 'true';
const tipos = { SALA: 'Sala', PROFESSOR: 'Docente', MATERIAL: 'Material' };

/** @param {string} id @returns {HTMLInputElement|HTMLSelectElement} */
function campo(id) { return /** @type {HTMLInputElement|HTMLSelectElement} */ (elemento(id)); }
/** @param {string} id @returns {HTMLButtonElement} */
function botao(id) { return /** @type {HTMLButtonElement} */ (elemento(id)); }
/** @param {string} tag @param {string} texto @param {string} [classe] */
function textoElemento(tag, texto, classe = '') {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;
  elemento.className = classe;
  return elemento;
}

iniciarPaginaAutenticada(modoReserva ? 'Nova reserva' : 'Disponibilidade', (usuario) => {
  const formulario = elemento('form-pesquisa');
  if (!(formulario instanceof HTMLFormElement)) throw new Error('Pesquisa ausente.');
  const enviarPesquisa = criarEnvioUnico(formulario);
  const filtros = /** @type {HTMLFieldSetElement} */ (elemento('filtros'));
  const resultados = elemento('resultados');
  const feedback = elemento('feedback-pesquisa');
  const referencia = elemento('referencia-pesquisa');
  /** @type {Map<number, import('./recursos.js').Recurso>} */
  const selecionados = new Map();
  /** @type {import('./recursos.js').FiltrosRecursos|undefined} */
  let consulta;
  /** @type {import('./recursos.js').PaginaRecursos|undefined} */
  let pagina;
  /** @type {{inicio: string, fim: string}|undefined} */
  let periodoSelecao;
  let versao = 0;
  let consultando = false;
  let escrevendo = false;
  let concluida = false;
  let periodoCivil = campo('inicio').value + '/' + campo('fim').value;

  function atualizarPaginacao() {
    botao('pagina-anterior').disabled = consultando || escrevendo || !pagina || pagina.pagina === 0;
    botao('pagina-seguinte').disabled = consultando || escrevendo || !pagina || (pagina.pagina + 1) * pagina.tamanho >= pagina.total;
    elemento('pagina-atual').textContent = pagina
      ? `Página ${pagina.pagina + 1} de ${Math.max(1, Math.ceil(pagina.total / pagina.tamanho))}`
      : 'Pesquise para consultar as páginas';
  }

  function atualizarSelecao() {
    if (!modoReserva) return;
    const lista = elemento('selecionados');
    lista.replaceChildren();
    for (const recurso of selecionados.values()) {
      const item = document.createElement('li');
      const nome = identificarRecurso(recurso);
      const remover = document.createElement('button');
      remover.className = 'button button-secondary';
      remover.type = 'button';
      remover.textContent = 'Remover';
      remover.setAttribute('aria-label', 'Remover ' + nome);
      remover.disabled = escrevendo || concluida;
      remover.addEventListener('click', () => {
        selecionados.delete(recurso.id);
        atualizarSelecao();
        desenharResultados();
        const quantidade = elemento('quantidade-selecionada');
        quantidade.tabIndex = -1;
        quantidade.focus();
      });
      item.append(textoElemento('span', nome + (recurso.dados.restrito ? ' · restrito' : '')), remover);
      lista.append(item);
    }
    elemento('quantidade-selecionada').textContent = selecionados.size ? `${selecionados.size} recurso(s) selecionado(s)` : 'Nenhum recurso selecionado';
    elemento('periodo-selecionado').textContent = periodoSelecao
      ? `${apresentarData(periodoSelecao.inicio)} até ${apresentarData(periodoSelecao.fim)} · São Paulo`
      : 'Pesquise um período para selecionar recursos.';
    botao('criar-reserva').disabled = !selecionados.size || !periodoSelecao || consultando || escrevendo || concluida;
  }

  function desenharResultados() {
    resultados.replaceChildren();
    if (!pagina) return;
    for (const recurso of pagina.itens) {
      const d = recurso.dados;
      const card = textoElemento('article', '', 'resource-card');
      card.append(textoElemento('p', tipos[d.tipo], 'eyebrow'), textoElemento('h3', identificarRecurso(recurso)));
      const descricao = d.tipo === 'SALA' ? `${d.capacidade} pessoas · ${d.localizacao}`
        : d.tipo === 'PROFESSOR' ? `Competências: ${d.competencias?.join(', ') || 'Não informadas'}` : `Código ${d.codigo} · ${d.condicao ?? ''}`;
      card.append(textoElemento('p', descricao, 'resource-description'));
      const disponivel = d.ativo && recurso.disponivel === true;
      const estado = !d.ativo ? 'Desativado' : recurso.disponivel === null ? 'Informe um período' : disponivel ? 'Disponível' : 'Indisponível';
      card.append(textoElemento('span', estado, 'availability ' + (disponivel ? 'available' : 'unavailable')));
      if (d.restrito) card.append(textoElemento('p', 'Restrito · exige aprovação', 'restriction-note'));
      if (modoReserva) {
        const label = document.createElement('label');
        label.className = 'resource-choice';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selecionados.has(recurso.id);
        checkbox.disabled = !disponivel || !periodoSelecao || consultando || escrevendo || concluida;
        checkbox.setAttribute('aria-label', 'Selecionar ' + identificarRecurso(recurso));
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) selecionados.set(recurso.id, recurso);
          else selecionados.delete(recurso.id);
          atualizarSelecao();
        });
        label.append(checkbox, textoElemento('span', 'Selecionar recurso'));
        card.append(label);
      }
      resultados.append(card);
    }
  }

  /** @returns {import('./recursos.js').FiltrosRecursos} */
  function lerFiltros() {
    const intervalo = intervaloDoFormulario(campo('inicio').value, campo('fim').value, modoReserva);
    return { ...intervalo, tipo: campo('tipo').value, capacidadeMinima: campo('capacidade').value ? Number(campo('capacidade').value) : undefined,
      localizacao: campo('localizacao').value, competencia: campo('competencia').value, patrimonio: campo('patrimonio').value,
      disponivel: campo('disponivel').value === '' ? undefined : campo('disponivel').value === 'true', tamanho: Number(campo('tamanho').value) };
  }

  /** @param {number} [numero] @param {import('./recursos.js').FiltrosRecursos} [filtrosPagina] */
  async function pesquisar(numero = 0, filtrosPagina) {
    if (consultando || escrevendo || concluida) return;
    let atual = versao;
    try {
      const proxima = { ...(filtrosPagina ?? lerFiltros()), pagina: numero };
      await enviarPesquisa(async () => {
        atual = ++versao;
        consultando = true;
        pagina = undefined;
        resultados.replaceChildren();
        atualizarPaginacao();
        atualizarSelecao();
        elemento('resultados-resumo').textContent = 'Consultando recursos…';
        mostrarMensagem(feedback, referencia, 'Pesquisando…');
        try {
          const resposta = await recursos.pesquisar(proxima);
          if (atual !== versao) return;
          pagina = resposta;
          consulta = proxima;
          if (proxima.inicio && proxima.fim) periodoSelecao = { inicio: proxima.inicio, fim: proxima.fim };
          let selecaoAtualizada = false;
          for (const item of resposta.itens) {
            if (selecionados.has(item.id) && (!item.dados.ativo || item.disponivel !== true)) {
              selecionados.delete(item.id);
              selecaoAtualizada = true;
            }
          }
          elemento('resultados-resumo').textContent = resposta.total ? `${resposta.total} recurso(s) encontrado(s)` : 'Nenhum recurso encontrado. Ajuste os filtros ou o período.';
          mostrarMensagem(feedback, referencia, selecaoAtualizada ? 'Um recurso selecionado ficou indisponível e foi removido. Confira a seleção.' : '');
        } finally { consultando = false; }
      });
    } catch (erro) {
      if (atual === versao) {
        elemento('resultados-resumo').textContent = 'A consulta não foi concluída.';
        mostrarErro(erro, feedback, referencia);
      }
    } finally {
      atualizarPaginacao();
      atualizarSelecao();
      desenharResultados();
    }
  }

  function invalidarPesquisa() {
    versao++;
    pagina = undefined;
    consulta = undefined;
    resultados.replaceChildren();
    elemento('resultados-resumo').textContent = 'Filtros alterados. Pesquise novamente.';
    mostrarMensagem(feedback, referencia, '');
    const novoPeriodo = campo('inicio').value + '/' + campo('fim').value;
    if (novoPeriodo !== periodoCivil) {
      const tinhaSelecao = selecionados.size > 0;
      selecionados.clear();
      periodoSelecao = undefined;
      periodoCivil = novoPeriodo;
      if (tinhaSelecao) mostrarMensagem(feedback, referencia, 'O período mudou. Selecione novamente os recursos após pesquisar.');
    }
    atualizarPaginacao();
    atualizarSelecao();
  }
  formulario.addEventListener('input', invalidarPesquisa);
  formulario.addEventListener('reset', () => { queueMicrotask(invalidarPesquisa); });
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (formulario.reportValidity()) void pesquisar();
  });
  botao('pagina-anterior').addEventListener('click', () => { if (pagina && consulta) void pesquisar(pagina.pagina - 1, consulta); });
  botao('pagina-seguinte').addEventListener('click', () => { if (pagina && consulta) void pesquisar(pagina.pagina + 1, consulta); });

  async function carregarExpediente() {
    try {
      const horario = await recursos.expediente();
      const nomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      const dias = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      elemento('expediente').textContent = horario.janelas.length
        ? horario.janelas.map((j) => `${nomes[dias.indexOf(j.dia)]}: ${j.inicio.slice(0, 5)}–${j.fim.slice(0, 5)}`).join(' · ') + ' (São Paulo)'
        : 'Não há horários de funcionamento cadastrados. Os recursos estão fechados para novas reservas.';
    } catch (erro) { mostrarErro(erro, elemento('expediente'), elemento('referencia-expediente')); }
  }
  void carregarExpediente();

  if (modoReserva) {
    const formReserva = elemento('form-reserva');
    if (!(formReserva instanceof HTMLFormElement)) throw new Error('Solicitação ausente.');
    const enviarReserva = criarEnvioUnico(formReserva);
    const feedbackReserva = elemento('feedback-reserva');
    const referenciaReserva = elemento('referencia-reserva');
    formReserva.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      if (consultando || escrevendo || concluida) return;
      try {
        if (!periodoSelecao || !selecionados.size) throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Pesquise o período e selecione ao menos um recurso disponível.');
        const dados = { ...periodoSelecao, recursosIds: [...selecionados.keys()] };
        const nomes = [...selecionados.values()].map(identificarRecurso);
        await enviarReserva(async () => {
          escrevendo = true;
          filtros.disabled = true;
          botao('criar-reserva').textContent = 'Solicitando…';
          atualizarPaginacao();
          desenharResultados();
          mostrarMensagem(feedbackReserva, referenciaReserva, 'Enviando sua solicitação…');
          try {
            const resposta = confirmarCriacao(await reservas.criar(dados), dados, usuario.usuarioId);
            concluida = true;
            const detalhes = elemento('detalhes-confirmacao');
            detalhes.replaceChildren();
            for (const [titulo, valor] of [
              ['Reserva', '#' + resposta.id], ['Status', resposta.status],
              ['Período em São Paulo', apresentarData(resposta.inicio) + ' até ' + apresentarData(resposta.fim)], ['Recursos', nomes.join('; ')],
            ]) {
              const grupo = document.createElement('div');
              grupo.append(textoElemento('dt', titulo), textoElemento('dd', valor));
              detalhes.append(grupo);
            }
            elemento('orientacao-status').textContent = resposta.restrita
              ? 'Sua solicitação aguarda avaliação do Responsável. O período já está reservado enquanto aguarda a decisão.'
              : 'Sua reserva foi aprovada.';
            mostrarMensagem(feedbackReserva, referenciaReserva, 'Solicitação confirmada: ' + resposta.status, 'success');
            elemento('confirmacao').hidden = false;
            formReserva.hidden = true;
            elemento('confirmacao').focus();
            pagina = undefined;
            elemento('resultados-resumo').textContent = 'Faça outra solicitação para consultar a disponibilidade novamente.';
          } finally {
            escrevendo = false;
            filtros.disabled = concluida;
            botao('criar-reserva').textContent = 'Solicitar reserva';
          }
        });
      } catch (erro) { mostrarErro(erro, feedbackReserva, referenciaReserva); }
      finally { atualizarSelecao(); atualizarPaginacao(); desenharResultados(); }
    });
    botao('nova-solicitacao').addEventListener('click', () => {
      concluida = false;
      selecionados.clear();
      periodoSelecao = undefined;
      filtros.disabled = false;
      formReserva.hidden = false;
      elemento('confirmacao').hidden = true;
      mostrarMensagem(feedbackReserva, referenciaReserva, '');
      invalidarPesquisa();
      campo('inicio').focus();
    });
    atualizarSelecao();
  } else { void pesquisar(); }
});
