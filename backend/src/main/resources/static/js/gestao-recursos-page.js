import { ErroApi } from './api.js';
import { administracao, diasSemana, nomesDias } from './administracao-recursos.js';
import { identificarRecurso } from './recursos.js';
import { paraIsoOperacional, apresentarData } from './datas.js';
import { iniciarPaginaAutenticada } from './sessao-page.js';
import { criarEnvioUnico } from './forms.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

/** @param {string} id */
const campo = (id) => /** @type {HTMLInputElement} */ (elemento(id));
/** @param {string} id */
const form = (id) => /** @type {HTMLFormElement} */ (elemento(id));
/** @template {keyof HTMLElementTagNameMap} T @param {T} tag @param {string} valor */
function texto(tag, valor) { const el = document.createElement(tag); el.textContent = valor; return el; }
/** @param {string} area @param {string} mensagem @param {'info'|'success'} [estado] */
function aviso(area, mensagem, estado = 'info') { mostrarMensagem(elemento('feedback-' + area), elemento('referencia-' + area), mensagem, estado); }

iniciarPaginaAutenticada('Gerenciar recursos', (usuario) => {
  if (usuario.papel !== 'ADMINISTRADOR') {
    throw new ErroApi(403, 'OPERACAO_NAO_PERMITIDA', 'Esta área está disponível somente para Administradores.');
  }
  const controles = /** @type {HTMLFieldSetElement} */ (elemento('controles-admin'));
  /** @type {import('./recursos.js').Recurso|undefined} */
  let original;
  /** @type {import('./recursos.js').PaginaRecursos|undefined} */
  let pagina;
  /** @type {import('./recursos.js').FiltrosRecursos|undefined} */
  let consulta;
  /** @type {import('./administracao-recursos.js').Bloqueio[]} */
  let bloqueios = [];
  /** @type {import('./administracao-recursos.js').Bloqueio|undefined} */
  let cancelando;
  let ocupado = false;
  let filtroVersao = 0;
  let sequenciaJanela = 0;
  const guards = new Map(['form-busca-admin', 'form-cadastro', 'form-desativacao', 'form-bloqueio', 'form-cancelar-bloqueio', 'form-expediente']
    .map((id) => [id, criarEnvioUnico(form(id))]));

  function ajustarTipo() {
    campo('cad-tipo').disabled = !!original;
    for (const grupo of Array.from(document.querySelectorAll('fieldset[data-tipo]'))) {
      if (!(grupo instanceof HTMLFieldSetElement)) continue;
      grupo.hidden = grupo.dataset.tipo !== campo('cad-tipo').value;
      grupo.disabled = grupo.hidden;
    }
  }
  function paginacao() {
    campo('anterior-admin').disabled = !pagina || pagina.pagina === 0;
    campo('seguinte-admin').disabled = !pagina || (pagina.pagina + 1) * pagina.tamanho >= pagina.total;
    elemento('pagina-admin').textContent = pagina ? `Página ${pagina.pagina + 1} · ${pagina.total} recurso(s)` : 'Faça uma consulta';
  }
  /** Serialização da área impede trocar de recurso durante uma leitura/escrita pendente.
   * @param {string} formulario @param {string} area @param {() => Promise<unknown>} acao */
  async function executar(formulario, area, acao) {
    if (ocupado) return;
    const guard = guards.get(formulario);
    if (!guard) throw new Error('Guard ausente.');
    await guard(async () => {
      ocupado = true;
      controles.disabled = true;
      aviso(area, 'Processando…');
      try { await acao(); }
      catch (erro) { mostrarErro(erro, elemento('feedback-' + area), elemento('referencia-' + area)); }
      finally { controles.disabled = false; ocupado = false; ajustarTipo(); paginacao(); }
    });
  }
  /** @param {string} id @param {string} area @param {() => Promise<void>} acao */
  function aoEnviar(id, area, acao) {
    form(id).addEventListener('submit', (evento) => {
      evento.preventDefault();
      if (!ocupado && form(id).reportValidity()) void executar(id, area, acao);
    });
  }

  /** @param {number} [numero] @param {import('./recursos.js').FiltrosRecursos} [filtros] */
  async function pesquisar(numero = 0, filtros) {
    const versao = filtroVersao;
    const params = { ...(filtros ?? { tipo: campo('filtro-tipo').value, localizacao: campo('filtro-local').value,
      competencia: campo('filtro-competencia').value, patrimonio: campo('filtro-patrimonio').value,
      tamanho: Number(campo('filtro-tamanho').value) }), pagina: numero };
    pagina = undefined;
    elemento('lista-admin').replaceChildren();
    elemento('resumo-admin').textContent = 'Consultando recursos…';
    paginacao();
    let resposta;
    try { resposta = await administracao.pesquisar(params); }
    catch (erro) {
      if (versao !== filtroVersao) return;
      elemento('resumo-admin').textContent = 'Consulta não concluída. Ajuste os filtros ou tente novamente.';
      throw erro;
    }
    if (versao !== filtroVersao) return;
    pagina = resposta;
    consulta = params;
    elemento('resumo-admin').textContent = resposta.total ? `${resposta.total} recurso(s) encontrado(s)` : 'Nenhum recurso encontrado. Ajuste os filtros.';
    for (const r of resposta.itens) {
      const item = texto('article', ''); item.className = 'admin-row';
      const detalhes = texto('div', '');
      detalhes.append(texto('h3', identificarRecurso(r)), texto('p', `${r.dados.tipo === 'PROFESSOR' ? 'Docente' : r.dados.tipo === 'SALA' ? 'Sala' : 'Material'} · ${r.dados.ativo ? 'Ativo' : 'Desativado'} · ${r.dados.restrito ? 'Exige aprovação' : 'Uso comum'}`));
      const editar = texto('button', 'Gerenciar'); editar.type = 'button'; editar.className = 'button button-secondary';
      editar.setAttribute('aria-label', 'Gerenciar ' + identificarRecurso(r));
      editar.addEventListener('click', () => { void executar('form-busca-admin', 'busca', () => abrir(r.id)); });
      item.append(detalhes, editar); elemento('lista-admin').append(item);
    }
    aviso('busca', ''); paginacao();
  }
  async function atualizarLista() {
    try { await pesquisar(pagina?.pagina ?? 0, consulta); }
    catch (erro) { mostrarErro(erro, elemento('feedback-busca'), elemento('referencia-busca')); }
  }
  function preencherEditor() {
    const d = original?.dados;
    form('form-cadastro').reset();
    campo('cad-tipo').value = d?.tipo ?? 'SALA';
    for (const chave of ['codigo', 'capacidade', 'localizacao', 'tipoSala', 'nome', 'patrimonio', 'descricao', 'condicao']) {
      campo('cad-' + chave).value = String(d?.[/** @type {keyof import('./recursos.js').DadosRecurso} */ (chave)] ?? '');
    }
    campo('cad-competencias').value = d?.competencias?.join('\n') ?? '';
    campo('cad-ativo').checked = d?.ativo ?? true;
    campo('cad-restrito').checked = d?.restrito ?? false;
    elemento('editor-title').textContent = original ? 'Editar ' + identificarRecurso(original) : 'Novo recurso';
    elemento('editor-recurso').hidden = false;
    elemento('acoes-recurso').hidden = !original;
    elemento('form-desativacao').hidden = !d?.ativo;
    elemento('alvo-desativacao').textContent = original ? `Desativar ${identificarRecurso(original)} (#${original.id}). Reservas ativas ou retiradas podem impedir esta operação.` : '';
    campo('confirmar-desativacao').checked = false;
    form('form-bloqueio').reset();
    elemento('form-cancelar-bloqueio').hidden = true;
    cancelando = undefined;
    bloqueios = []; elemento('lista-bloqueios').replaceChildren();
    elemento('resumo-bloqueios').textContent = 'Consulte os bloqueios deste recurso.';
    aviso('cadastro', ''); aviso('bloqueios', ''); ajustarTipo();
  }
  /** @param {number} id */
  async function abrir(id) {
    // Não reutilizar o resumo da pesquisa como objeto completo de edição.
    original = undefined;
    elemento('editor-recurso').hidden = true;
    original = await administracao.obter(id);
    preencherEditor();
    elemento('editor-title').focus();
    aviso('busca', '');
    await carregarBloqueios();
  }
  function desenharBloqueios() {
    elemento('lista-bloqueios').replaceChildren();
    elemento('resumo-bloqueios').textContent = bloqueios.length ? `${bloqueios.length} bloqueio(s)` : 'Nenhum bloqueio cadastrado.';
    for (const b of bloqueios) {
      const item = texto('article', ''); item.className = 'admin-row';
      const detalhes = texto('div', '');
      detalhes.append(texto('h3', b.motivo), texto('p', `${apresentarData(b.inicio_utc)} até ${apresentarData(b.fim_utc)} · ${b.status === 'ATIVO' ? 'Ativo' : 'Cancelado'}`));
      item.append(detalhes);
      if (b.status === 'ATIVO') {
        const cancelar = texto('button', 'Cancelar bloqueio'); cancelar.type = 'button'; cancelar.className = 'button button-secondary';
        cancelar.setAttribute('aria-label', 'Cancelar bloqueio #' + b.id);
        cancelar.addEventListener('click', () => {
          if (ocupado) return;
          cancelando = b;
          elemento('alvo-cancelamento').textContent = `Cancelar bloqueio #${b.id}: ${b.motivo}, ${apresentarData(b.inicio_utc)} até ${apresentarData(b.fim_utc)}.`;
          campo('confirmar-cancelamento').checked = false;
          elemento('form-cancelar-bloqueio').hidden = false; campo('confirmar-cancelamento').focus();
        });
        item.append(cancelar);
      }
      elemento('lista-bloqueios').append(item);
    }
  }
  async function carregarBloqueios() {
    if (!original) return false;
    try {
      elemento('resumo-bloqueios').textContent = 'Consultando bloqueios…';
      elemento('lista-bloqueios').replaceChildren();
      cancelando = undefined; elemento('form-cancelar-bloqueio').hidden = true;
      bloqueios = await administracao.bloqueios(original.id); desenharBloqueios();
      aviso('bloqueios', '');
      return true;
    } catch (erro) {
      elemento('resumo-bloqueios').textContent = 'Não foi possível consultar os bloqueios. Atualize para tentar novamente.';
      mostrarErro(erro, elemento('feedback-bloqueios'), elemento('referencia-bloqueios'));
      return false;
    }
  }
  function resumoJanelas() {
    const total = elemento('janelas').children.length;
    elemento('resumo-janelas').textContent = total ? `${total} janela(s) de funcionamento.` : 'Sem janelas: ao salvar, o funcionamento ficará fechado.';
    campo('confirmar-expediente').checked = false;
  }
  /** @param {import('./administracao-recursos.js').Janela} [janela] */
  function adicionarJanela(janela) {
    const row = texto('div', ''); row.className = 'schedule-row';
    const n = ++sequenciaJanela;
    const dia = document.createElement('select'); dia.dataset.campo = 'dia'; dia.id = 'dia-' + n;
    diasSemana.forEach((valor, i) => { const op = texto('option', nomesDias[i]); op.value = valor; dia.append(op); });
    dia.value = janela?.dia ?? diasSemana[0];
    const grupoDia = texto('div', ''); const labelDia = texto('label', 'Dia da semana'); labelDia.htmlFor = dia.id; grupoDia.append(labelDia, dia); row.append(grupoDia);
    for (const chave of ['inicio', 'fim']) {
      const input = document.createElement('input'); input.type = 'text'; input.placeholder = 'HH:MM'; input.required = true;
      input.dataset.campo = chave; input.id = chave + '-' + n;
      input.value = janela?.[/** @type {'inicio'|'fim'} */ (chave)] ?? '';
      // Alguns navegadores não representam toda a precisão de LocalTime. Preservar o original enquanto não editado.
      input.dataset.original = janela?.[/** @type {'inicio'|'fim'} */ (chave)] ?? '';
      input.dataset.editado = 'false';
      input.addEventListener('input', () => { input.dataset.editado = 'true'; });
      const grupo = texto('div', ''); const label = texto('label', chave === 'inicio' ? 'Abre às' : 'Fecha às');
      label.htmlFor = input.id; grupo.append(label, input); row.append(grupo);
    }
    const remover = texto('button', 'Remover janela'); remover.type = 'button'; remover.className = 'button button-secondary';
    remover.addEventListener('click', () => { row.remove(); resumoJanelas(); });
    row.append(remover); elemento('janelas').append(row); resumoJanelas();
  }
  /** @param {import('./administracao-recursos.js').Janela[]} janelas */
  function preencherJanelas(janelas) {
    elemento('janelas').replaceChildren(); janelas.forEach(adicionarJanela); resumoJanelas();
    elemento('form-expediente').hidden = false;
  }
  async function carregarExpediente() {
    elemento('form-expediente').hidden = true;
    const resposta = await administracao.expediente(); preencherJanelas(resposta.janelas); aviso('expediente', '');
  }

  aoEnviar('form-busca-admin', 'busca', () => pesquisar());
  form('form-busca-admin').addEventListener('input', () => {
    filtroVersao++; pagina = undefined; consulta = undefined; elemento('lista-admin').replaceChildren();
    elemento('resumo-admin').textContent = 'Filtros alterados. Consulte novamente.'; paginacao();
  });
  elemento('anterior-admin').addEventListener('click', () => { if (pagina) void executar('form-busca-admin', 'busca', () => pesquisar((pagina?.pagina ?? 1) - 1, consulta)); });
  elemento('seguinte-admin').addEventListener('click', () => { if (pagina) void executar('form-busca-admin', 'busca', () => pesquisar((pagina?.pagina ?? 0) + 1, consulta)); });
  elemento('novo-recurso').addEventListener('click', () => { if (!ocupado) { original = undefined; preencherEditor(); elemento('editor-title').focus(); } });
  elemento('fechar-editor').addEventListener('click', () => { if (!ocupado) { elemento('editor-recurso').hidden = true; campo('novo-recurso').focus(); } });
  campo('cad-tipo').addEventListener('change', ajustarTipo);
  aoEnviar('form-cadastro', 'cadastro', async () => {
    if (original?.dados.ativo && !campo('cad-ativo').checked && !campo('confirmar-desativacao').checked) {
      throw new ErroApi(400, 'REQUISICAO_INVALIDA', 'Confirme a desativação identificada abaixo antes de salvar o recurso como inativo.');
    }
    const tipo = original?.dados.tipo ?? campo('cad-tipo').value;
    const dados = { tipo: /** @type {import('./recursos.js').TipoRecurso} */ (tipo), codigo: campo('cad-codigo').value,
      ativo: campo('cad-ativo').checked, restrito: campo('cad-restrito').checked,
      capacidade: Number(campo('cad-capacidade').value), localizacao: campo('cad-localizacao').value, tipoSala: campo('cad-tipoSala').value,
      nome: campo('cad-nome').value, competencias: campo('cad-competencias').value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
      patrimonio: campo('cad-patrimonio').value, descricao: campo('cad-descricao').value, condicao: campo('cad-condicao').value };
    original = await administracao.salvar(dados, original);
    preencherEditor(); aviso('cadastro', 'Recurso salvo. Confira os dados confirmados pelo servidor.', 'success');
    await atualizarLista(); await carregarBloqueios();
  });
  aoEnviar('form-desativacao', 'cadastro', async () => {
    if (!original || !campo('confirmar-desativacao').checked) return;
    await administracao.desativar(original.id);
    original = { ...original, dados: { ...original.dados, ativo: false } };
    preencherEditor(); aviso('cadastro', 'Recurso desativado. O histórico foi preservado.', 'success');
    await atualizarLista(); await carregarBloqueios();
  });
  elemento('consultar-bloqueios').addEventListener('click', () => { void executar('form-bloqueio', 'bloqueios', carregarBloqueios); });
  aoEnviar('form-bloqueio', 'bloqueios', async () => {
    if (!original) return;
    const novo = await administracao.bloquear(original.id, { inicio: paraIsoOperacional(campo('bloqueio-inicio').value),
      fim: paraIsoOperacional(campo('bloqueio-fim').value), motivo: campo('bloqueio-motivo').value });
    // Exibir somente o bloqueio confirmado; a leitura posterior reconcilia a coleção completa.
    form('form-bloqueio').reset();
    if (await carregarBloqueios()) aviso('bloqueios', `Bloqueio #${novo.id} criado.`, 'success');
    else elemento('resumo-bloqueios').textContent = `Bloqueio #${novo.id} criado. Atualize a consulta para conferir a lista completa.`;
  });
  aoEnviar('form-cancelar-bloqueio', 'bloqueios', async () => {
    if (!original || !cancelando || !campo('confirmar-cancelamento').checked) return;
    const resposta = await administracao.cancelarBloqueio(cancelando.id, original.id);
    bloqueios = bloqueios.map((b) => b.id === resposta.id ? resposta : b);
    cancelando = undefined; elemento('form-cancelar-bloqueio').hidden = true;
    desenharBloqueios(); aviso('bloqueios', 'Cancelamento confirmado.', 'success');
  });
  elemento('desistir-cancelamento').addEventListener('click', () => { cancelando = undefined; elemento('form-cancelar-bloqueio').hidden = true; campo('consultar-bloqueios').focus(); });
  elemento('consultar-expediente').addEventListener('click', () => { void executar('form-expediente', 'expediente', carregarExpediente); });
  elemento('adicionar-janela').addEventListener('click', () => { adicionarJanela(); });
  elemento('janelas').addEventListener('input', () => { campo('confirmar-expediente').checked = false; });
  aoEnviar('form-expediente', 'expediente', async () => {
    if (!campo('confirmar-expediente').checked) return;
    const janelas = Array.from(elemento('janelas').children).map((row) => {
      const dia = /** @type {HTMLSelectElement} */ (row.querySelector('[data-campo="dia"]'));
      const horario = (/** @type {string} */ chave) => {
        const input = /** @type {HTMLInputElement} */ (row.querySelector(`[data-campo="${chave}"]`));
        return input.dataset.editado === 'false' && input.dataset.original ? input.dataset.original : input.value;
      };
      return { dia: dia.value, inicio: horario('inicio'), fim: horario('fim') };
    });
    const resposta = await administracao.salvarExpediente(janelas); preencherJanelas(resposta.janelas);
    aviso('expediente', resposta.janelas.length ? 'Expediente atualizado.' : 'Expediente atualizado: funcionamento fechado.', 'success');
  });
  void executar('form-busca-admin', 'busca', async () => {
    // Falha em uma leitura não impede recuperar a outra seção.
    await atualizarLista();
    try { await carregarExpediente(); }
    catch (erro) { mostrarErro(erro, elemento('feedback-expediente'), elemento('referencia-expediente')); }
  });
});
