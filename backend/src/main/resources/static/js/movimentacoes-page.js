import { ErroApi } from './api.js';
import { movimentacoes, prazoUltrapassado, apresentarAtraso } from './movimentacoes.js';
import { identificarRecurso } from './recursos.js';
import { apresentarData } from './datas.js';
import { iniciarPaginaAutenticada } from './sessao-page.js';
import { criarEnvioUnico } from './forms.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

/** @param {string} id */
const campo = (id) => /** @type {HTMLInputElement} */ (elemento(id));
/** @param {string} id */
const formulario = (id) => /** @type {HTMLFormElement} */ (elemento(id));
/** @template {keyof HTMLElementTagNameMap} T @param {T} tag @param {string} valor */
function texto(tag, valor) { const el = document.createElement(tag); el.textContent = valor; return el; }
/** @param {string} area @param {string} mensagem @param {'info'|'success'} [estado] */
function aviso(area, mensagem, estado = 'info') { mostrarMensagem(elemento('feedback-' + area), elemento('referencia-' + area), mensagem, estado); }

iniciarPaginaAutenticada('Movimentações', (usuario) => {
  if (!['RESPONSAVEL', 'ADMINISTRADOR'].includes(usuario.papel)) {
    throw new ErroApi(403, 'OPERACAO_NAO_PERMITIDA', 'As movimentações estão disponíveis para Responsáveis e Administradores.');
  }
  const podeOperar = usuario.papel === 'RESPONSAVEL';
  const controles = /** @type {HTMLFieldSetElement} */ (elemento('controles-mov'));
  let ocupado = false;
  let retiradaConcluida = false;
  let retiradaIncerta = false;
  let devolucaoIncerta = false;
  let pesquisaVersao = 0;
  let pendenciasVersao = 0;
  let consultouPendencias = false;
  /** @type {HTMLElement|undefined} */ let foco;
  /** @type {import('./recursos.js').PaginaRecursos|undefined} */ let pagina;
  /** @type {string|undefined} */ let filtroPesquisado;
  /** @type {import('./recursos.js').Recurso|undefined} */ let selecionado;
  /** @type {import('./movimentacoes.js').Movimentacao[]} */ let abertas = [];
  /** @type {import('./movimentacoes.js').Movimentacao|undefined} */ let devolvendo;
  /** @type {Map<number, import('./recursos.js').Recurso>} */ const detalhes = new Map();
  const guards = new Map(['form-pesquisa-material', 'form-retirada', 'form-pendencias', 'form-devolucao']
    .map((id) => [id, criarEnvioUnico(formulario(id))]));

  /** @param {string} id @param {string} area @param {() => Promise<void>} acao */
  async function executar(id, area, acao) {
    if (ocupado) return;
    const guard = guards.get(id);
    if (!guard) throw new Error('Formulário de movimentação ausente.');
    await guard(async () => {
      ocupado = true; controles.disabled = true; aviso(area, 'Processando…');
      try { await acao(); }
      catch (erro) {
        if (erro instanceof ErroApi && ['FALHA_DE_REDE', 'RESPOSTA_INVALIDA'].includes(erro.codigo)) {
          if (id === 'form-retirada') {
            retiradaIncerta = true; campo('confirmar-retirada').checked = false;
            atualizarConfirmacao();
          }
          if (id === 'form-devolucao') {
            devolucaoIncerta = true; devolvendo = undefined;
            campo('confirmar-devolucao').checked = false; elemento('form-devolucao').hidden = true;
          }
        }
        mostrarErro(erro, elemento('feedback-' + area), elemento('referencia-' + area));
      }
      finally { ocupado = false; controles.disabled = false; paginacao(); }
    });
    if (foco) { foco.focus(); foco = undefined; }
  }
  /** @param {string} id @param {string} area @param {() => Promise<void>} acao @param {boolean} [operacao] */
  function aoEnviar(id, area, acao, operacao = false) {
    formulario(id).addEventListener('submit', (evento) => {
      evento.preventDefault();
      if (operacao && !podeOperar) return;
      if (!ocupado && formulario(id).reportValidity()) void executar(id, area, acao);
    });
  }
  function paginacao() {
    campo('anterior-material').disabled = !pagina || pagina.pagina === 0 || retiradaConcluida;
    campo('seguinte-material').disabled = !pagina || (pagina.pagina + 1) * pagina.tamanho >= pagina.total || retiradaConcluida;
    elemento('pagina-material').textContent = pagina ? `Página ${pagina.pagina + 1} · ${pagina.total} material(is)` : 'Nenhuma consulta';
  }
  function atualizarConfirmacao() {
    campo('confirmar-retirada').checked = false;
    if (retiradaIncerta) {
      elemento('form-retirada').hidden = true;
      elemento('resumo-materiais').textContent = 'Operação sem confirmação. Atualize as pendências antes de conferir e confirmar outra tentativa.';
      return;
    }
    const numero = Number(campo('numero-reserva').value);
    const valido = Number.isSafeInteger(numero) && numero > 0;
    elemento('form-retirada').hidden = !selecionado || !valido || retiradaConcluida;
    if (selecionado) {
      elemento('alvo-retirada').textContent = `Reserva #${numero} · ${identificarRecurso(selecionado)} · Material #${selecionado.id}.`;
      elemento('resumo-materiais').textContent = valido ? 'Material selecionado. Confira os dados abaixo.' : 'Material selecionado. Informe o número da reserva para confirmar.';
    }
  }
  function invalidarPesquisa() {
    pesquisaVersao++; pagina = undefined; selecionado = undefined; filtroPesquisado = undefined;
    elemento('materiais').replaceChildren(); elemento('resumo-materiais').textContent = 'Patrimônio alterado. Pesquise e selecione novamente.';
    atualizarConfirmacao(); paginacao();
  }
  /** @param {number} [numero] @param {string} [patrimonio] */
  async function pesquisar(numero = 0, patrimonio = campo('patrimonio-material').value) {
    const versao = ++pesquisaVersao;
    selecionado = undefined; pagina = undefined; atualizarConfirmacao(); paginacao(); elemento('materiais').replaceChildren();
    elemento('resumo-materiais').textContent = 'Consultando materiais…';
    let resposta;
    try { resposta = await movimentacoes.pesquisarMateriais(patrimonio, numero); }
    catch (erro) {
      if (versao !== pesquisaVersao) return;
      elemento('resumo-materiais').textContent = 'Consulta não concluída. Tente novamente.'; throw erro;
    }
    if (versao !== pesquisaVersao) return;
    pagina = resposta; filtroPesquisado = patrimonio;
    elemento('resumo-materiais').textContent = resposta.total ? `${resposta.total} material(is) encontrado(s). Escolha a unidade conferida.` : 'Nenhum material encontrado. Confira o patrimônio.';
    for (const r of resposta.itens) {
      const card = texto('article', ''); card.className = 'movement-material';
      card.append(texto('h3', identificarRecurso(r)), texto('p', `Código ${r.dados.codigo} · ${r.dados.ativo ? 'Ativo' : 'Desativado'}`));
      const escolher = texto('button', 'Escolher material'); escolher.type = 'button'; escolher.className = 'button button-secondary';
      escolher.disabled = !r.dados.ativo || r.dados.tipo !== 'MATERIAL';
      escolher.setAttribute('aria-label', 'Escolher ' + identificarRecurso(r));
      escolher.addEventListener('click', () => {
        if (ocupado || retiradaConcluida) return;
        selecionado = r; atualizarConfirmacao();
        if (!elemento('form-retirada').hidden) campo('confirmar-retirada').focus(); else campo('numero-reserva').focus();
      });
      card.append(escolher); elemento('materiais').append(card);
    }
    aviso('materiais', '');
  }
  /** @param {number} recursoId */
  function nomeMaterial(recursoId) { return detalhes.has(recursoId) ? identificarRecurso(/** @type {import('./recursos.js').Recurso} */ (detalhes.get(recursoId))) : 'Material #' + recursoId; }
  function desenharPendencias() {
    elemento('pendencias').replaceChildren();
    elemento('resumo-pendencias').textContent = abertas.length ? `${abertas.length} retirada(s) aberta(s).` : 'Nenhuma retirada aberta.';
    for (const m of abertas) {
      const card = texto('article', ''); card.className = 'movement-card'; card.dataset.movimento = String(m.id);
      card.append(texto('p', `Movimentação #${m.id}`));
      const nome = texto('h3', nomeMaterial(m.recursoId)); nome.dataset.nomeMaterial = String(m.recursoId); card.append(nome);
      const identificacao = texto('p', detalhes.has(m.recursoId) ? 'Identificação consultada no cadastro.' : 'Consultando identificação; a pendência permanece registrada pelo número do material.');
      identificacao.className = 'field-help'; identificacao.dataset.identificacao = String(m.recursoId); card.append(identificacao);
      const status = texto('span', ''); status.className = 'movement-status'; status.dataset.prazo = String(m.id); card.append(status);
      const lista = texto('dl', ''); lista.className = 'movement-meta';
      for (const [titulo, valor] of [['Reserva', '#' + m.reservaId], ['Material', '#' + m.recursoId],
        ['Retirado por', 'Operador #' + m.responsavelId], ['Retirada em São Paulo', apresentarData(m.retiradoEm)], ['Fim previsto em São Paulo', apresentarData(m.fimPrevisto)]]) {
        const grupo = texto('div', ''); grupo.append(texto('dt', titulo), texto('dd', valor)); lista.append(grupo);
      }
      card.append(lista);
      if (podeOperar) {
        const devolver = texto('button', 'Registrar devolução'); devolver.type = 'button'; devolver.className = 'button button-secondary';
        devolver.setAttribute('aria-label', 'Devolver movimentação #' + m.id);
        devolver.addEventListener('click', () => {
          if (ocupado) return;
          if (devolucaoIncerta) { aviso('devolucao', 'Atualize as pendências antes de conferir e confirmar outra tentativa.'); return; }
          devolvendo = m;
          elemento('alvo-devolucao').textContent = `Movimentação #${m.id} · Reserva #${m.reservaId} · ${nomeMaterial(m.recursoId)} · Material #${m.recursoId}.`;
          campo('confirmar-devolucao').checked = false; elemento('form-devolucao').hidden = false; campo('confirmar-devolucao').focus();
        });
        card.append(devolver);
      }
      elemento('pendencias').append(card);
    }
    atualizarPrazos();
  }
  function atualizarPrazos() {
    for (const m of abertas) {
      const status = document.querySelector(`[data-prazo="${m.id}"]`);
      if (!(status instanceof HTMLElement)) continue;
      const ultrapassado = prazoUltrapassado(m);
      status.textContent = ultrapassado ? 'Prazo ultrapassado · estimativa do navegador' : 'Retirada aberta';
      status.dataset.atrasado = String(ultrapassado);
    }
  }
  /** Consulta de identificação em pequenos lotes, sem bloquear a devolução nem ocultar pendências.
   * @param {number} versao */
  async function enriquecer(versao) {
    const ids = [...new Set(abertas.map((m) => m.recursoId))].filter((id) => !detalhes.has(id));
    for (let i = 0; i < ids.length; i += 4) {
      if (versao !== pendenciasVersao) return;
      await Promise.all(ids.slice(i, i + 4).map(async (id) => {
        try {
          const r = await movimentacoes.material(id);
          if (versao !== pendenciasVersao) return;
          detalhes.set(id, r);
          document.querySelectorAll(`[data-nome-material="${id}"]`).forEach((el) => { el.textContent = identificarRecurso(r); });
          document.querySelectorAll(`[data-identificacao="${id}"]`).forEach((el) => { el.textContent = 'Identificação consultada no cadastro.'; });
        } catch {
          if (versao !== pendenciasVersao) return;
          document.querySelectorAll(`[data-identificacao="${id}"]`).forEach((el) => { el.textContent = 'Cadastro indisponível. Confira o material pelo número; a pendência e a devolução foram preservadas.'; });
        }
      }));
    }
  }
  async function carregarPendencias() {
    const versao = ++pendenciasVersao;
    devolvendo = undefined; elemento('form-devolucao').hidden = true;
    try {
      const resposta = await movimentacoes.abertas();
      if (versao !== pendenciasVersao) return;
      const recuperandoRetirada = retiradaIncerta;
      const recuperandoDevolucao = devolucaoIncerta;
      abertas = resposta; consultouPendencias = true;
      retiradaIncerta = false; devolucaoIncerta = false;
      if (recuperandoRetirada) {
        const encontrada = selecionado && abertas.find((m) => m.recursoId === selecionado?.id);
        if (encontrada) {
          selecionado = undefined;
          elemento('resumo-materiais').textContent = `O material consta na movimentação #${encontrada.id}. Confira a pendência antes de iniciar outra retirada.`;
          aviso('retirada', 'Material encontrado entre as retiradas abertas. A operação anterior não será reenviada.');
        } else aviso('retirada', 'Pendências atualizadas. Confira os dados e faça uma nova confirmação se precisar tentar novamente.');
        atualizarConfirmacao();
      }
      if (recuperandoDevolucao) aviso('devolucao', 'Pendências atualizadas. Confira o registro e faça uma nova confirmação se ainda estiver aberto.');
      desenharPendencias(); aviso('pendencias', ''); void enriquecer(versao);
    } catch (erro) {
      elemento('resumo-pendencias').textContent = consultouPendencias
        ? 'A atualização falhou. A lista mostra a última consulta confirmada.' : 'Consulta indisponível. Atualize para tentar novamente.';
      mostrarErro(erro, elemento('feedback-pendencias'), elemento('referencia-pendencias'));
    }
  }

  aoEnviar('form-pendencias', 'pendencias', carregarPendencias);
  aoEnviar('form-pesquisa-material', 'materiais', async () => { if (podeOperar && !retiradaConcluida) await pesquisar(); });
  campo('patrimonio-material').addEventListener('input', invalidarPesquisa);
  campo('numero-reserva').addEventListener('input', atualizarConfirmacao);
  elemento('anterior-material').addEventListener('click', () => { if (pagina && podeOperar) void executar('form-pesquisa-material', 'materiais', () => pesquisar((pagina?.pagina ?? 1) - 1, filtroPesquisado)); });
  elemento('seguinte-material').addEventListener('click', () => { if (pagina && podeOperar) void executar('form-pesquisa-material', 'materiais', () => pesquisar((pagina?.pagina ?? 0) + 1, filtroPesquisado)); });
  aoEnviar('form-retirada', 'retirada', async () => {
    if (retiradaConcluida || retiradaIncerta || !selecionado || !campo('confirmar-retirada').checked) return;
    const reservaId = Number(campo('numero-reserva').value);
    const nome = identificarRecurso(selecionado);
    const r = await movimentacoes.retirar({ reservaId, recursoId: selecionado.id }, usuario.usuarioId);
    retiradaConcluida = true; selecionado = undefined;
    elemento('form-retirada').hidden = true; elemento('form-pesquisa-material').hidden = true;
    elemento('materiais').replaceChildren(); pagina = undefined;
    elemento('resumo-materiais').textContent = 'Retirada confirmada. Inicie outra operação para pesquisar novamente.';
    elemento('detalhes-retirada').textContent = `Movimentação #${r.id} · Reserva #${r.reservaId} · ${nome} · Retirada ${apresentarData(r.retiradoEm)} · Fim previsto ${apresentarData(r.fimPrevisto)}.`;
    elemento('confirmacao-retirada').hidden = false; foco = elemento('confirmacao-retirada');
    // Estado local vem da resposta da escrita, mesmo se o GET seguinte falhar.
    abertas = [...abertas.filter((m) => m.id !== r.id && m.recursoId !== r.recursoId), r]; consultouPendencias = true; desenharPendencias();
    aviso('retirada', 'Retirada confirmada pelo servidor.', 'success'); await carregarPendencias();
  }, true);
  elemento('outra-retirada').addEventListener('click', () => {
    if (ocupado) return;
    retiradaConcluida = false; formulario('form-pesquisa-material').reset(); formulario('form-retirada').reset();
    elemento('confirmacao-retirada').hidden = true; elemento('form-pesquisa-material').hidden = false;
    invalidarPesquisa(); aviso('retirada', ''); campo('numero-reserva').focus();
  });
  aoEnviar('form-devolucao', 'devolucao', async () => {
    if (devolucaoIncerta || !devolvendo || !campo('confirmar-devolucao').checked) return;
    const nome = nomeMaterial(devolvendo.recursoId);
    const r = await movimentacoes.devolver(devolvendo);
    abertas = abertas.filter((m) => m.id !== r.id); devolvendo = undefined;
    elemento('form-devolucao').hidden = true; desenharPendencias();
    elemento('detalhes-devolucao').textContent = `Movimentação #${r.id} · Reserva #${r.reservaId} · ${nome} · Devolvida ${apresentarData(/** @type {string} */ (r.devolvidoEm))} · Operador #${r.devolvidoPor} · Atraso final: ${apresentarAtraso(r.atrasoSegundos)}.`;
    elemento('confirmacao-devolucao').hidden = false; foco = elemento('confirmacao-devolucao');
    aviso('devolucao', 'Devolução confirmada pelo servidor.', 'success'); await carregarPendencias();
  }, true);
  elemento('voltar-devolucao').addEventListener('click', () => {
    if (ocupado) return;
    devolvendo = undefined; elemento('form-devolucao').hidden = true;
    formulario('form-pendencias').querySelector('button')?.focus();
  });
  elemento('retirada').hidden = !podeOperar; elemento('perfil-leitura').hidden = podeOperar;
  const timer = window.setInterval(atualizarPrazos, 60000);
  window.addEventListener('pagehide', () => { window.clearInterval(timer); pendenciasVersao++; pesquisaVersao++; });
  void executar('form-pendencias', 'pendencias', carregarPendencias);
});
