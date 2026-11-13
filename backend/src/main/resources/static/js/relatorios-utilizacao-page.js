import { criarRelatoriosUtilizacao, apresentarDuracao } from './relatorios-utilizacao.js';
import { intervaloDoFormulario } from './datas.js';
import { criarEnvioUnico } from './forms.js';
import { iniciarPaginaAutenticada } from './sessao-page.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

const formulario = /** @type {HTMLFormElement} */ (elemento('form-relatorio'));
const inicio = /** @type {HTMLInputElement} */ (elemento('relatorio-inicio'));
const fim = /** @type {HTMLInputElement} */ (elemento('relatorio-fim'));
const recurso = /** @type {HTMLInputElement} */ (elemento('relatorio-recurso'));
const controles = /** @type {HTMLFieldSetElement} */ (elemento('controles-relatorio'));
const resultado = elemento('resultado-relatorio');
const feedback = elemento('feedback-relatorio'), referencia = elemento('referencia-relatorio');
const linhas = elemento('linhas-utilizacao');
const enviar = criarEnvioUnico(formulario), cliente = criarRelatoriosUtilizacao();
let autenticado = false, versao = 0;

function limparResultado() {
  resultado.hidden = true;
  linhas.replaceChildren();
}

function invalidar() {
  versao++;
  limparResultado();
  mostrarMensagem(feedback, referencia, 'Filtros alterados. Consulte para obter o relatório desse período.');
}
formulario.addEventListener('input', invalidar);
formulario.addEventListener('reset', () => {
  invalidar();
  mostrarMensagem(feedback, referencia, 'Informe um período para consultar o relatório.');
});

/** @param {import('./relatorios-utilizacao.js').RelatorioUtilizacao} relatorio */
function apresentar(relatorio) {
  elemento('total-reservas-relatorio').textContent = String(relatorio.reservasConsideradas);
  elemento('duracao-reservas-relatorio').textContent = apresentarDuracao(relatorio.duracaoReservada);
  elemento('conflitos-relatorio').textContent = String(relatorio.conflitosEvitados);
  // O eco ISO conserva offset e frações, sem truncá-los ao minuto na apresentação.
  elemento('periodo-relatorio').textContent = relatorio.periodo.inicio + ' até ' + relatorio.periodo.fim;
  elemento('filtro-recurso-relatorio').textContent = relatorio.recursoId === null
    ? 'Sem filtro de recurso.' : 'Recurso selecionado: ID ' + relatorio.recursoId + '.';
  elemento('estados-relatorio').textContent = 'Estados considerados: ' + relatorio.estadosConsiderados.join(', ') + '.';
  for (const alocacao of relatorio.porRecurso) {
    const linha = document.createElement('tr');
    const id = document.createElement('th'), duracao = document.createElement('td');
    id.scope = 'row'; id.textContent = 'Recurso ' + alocacao.recursoId;
    duracao.textContent = apresentarDuracao(alocacao.duracaoAlocada);
    linha.append(id, duracao); linhas.append(linha);
  }
  elemento('tabela-utilizacao').hidden = !relatorio.porRecurso.length;
  elemento('sem-alocacoes').hidden = !!relatorio.porRecurso.length;
  elemento('sem-alocacoes').textContent = 'Nenhuma reserva nos estados considerados para esse período. Não há duração alocada por recurso.';
  resultado.hidden = false;
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!autenticado || !formulario.reportValidity()) return;
  await enviar(async () => {
    const atual = ++versao;
    limparResultado();
    resultado.setAttribute('aria-busy', 'true');
    mostrarMensagem(feedback, referencia, 'Consultando relatório…');
    try {
      const intervalo = /** @type {{inicio:string,fim:string}} */ (
        intervaloDoFormulario(inicio.value, fim.value, true, false));
      // obrigatorio=true garante os dois campos; o cliente revalida os instantes.
      const filtros = { inicio: intervalo.inicio, fim: intervalo.fim,
        ...(recurso.value ? { recursoId: Number(recurso.value) } : {}) };
      const relatorio = await cliente.consultar(filtros);
      if (atual !== versao) return;
      apresentar(relatorio);
      mostrarMensagem(feedback, referencia, 'Consulta concluída. ' + relatorio.reservasConsideradas
        + ' reserva(s) considerada(s); ' + relatorio.conflitosEvitados + ' conflito(s) evitado(s) registrado(s).', 'success');
      resultado.focus();
    } catch (erro) {
      if (atual === versao) mostrarErro(erro, feedback, referencia);
    } finally { resultado.setAttribute('aria-busy', 'false'); }
  });
});

iniciarPaginaAutenticada('Relatórios', () => {
  autenticado = true;
  controles.disabled = false;
});
