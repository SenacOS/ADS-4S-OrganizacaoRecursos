import { auth } from './auth.js';
import { criarEnvioUnico } from './forms.js';
import { preencherNavegacao, rotulosPapel } from './navegacao.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

/** Estrutura de sessão comum às páginas; não oferece sessão simulada.
 * @param {string} atual @param {(usuario: import('./auth.js').Usuario) => void} aoAutenticar */
export function iniciarPaginaAutenticada(atual, aoAutenticar) {
  const painel = elemento('painel');
  const verificacao = elemento('estado-sessao');
  const feedbackInicial = elemento('feedback-inicial');
  const referenciaInicial = elemento('referencia-inicial');
  const tentar = /** @type {HTMLButtonElement} */ (elemento('tentar-sessao'));
  const formulario = elemento('form-logout');
  if (!(formulario instanceof HTMLFormElement) || !(tentar instanceof HTMLButtonElement)) {
    throw new Error('Estrutura da sessão inválida.');
  }
  const feedback = elemento('feedback-painel');
  const referencia = elemento('referencia-painel');
  const botaoSair = formulario.querySelector('button');
  if (!botaoSair) throw new Error('Botão de saída ausente.');
  const sair = criarEnvioUnico(formulario);

  async function carregarSessao() {
    painel.hidden = true;
    verificacao.hidden = false;
    tentar.hidden = true;
    tentar.disabled = true;
    mostrarMensagem(feedbackInicial, referenciaInicial, 'Verificando seu acesso…');
    try {
      const usuario = await auth.me();
      preencherNavegacao(usuario, atual);
      elemento('perfil-badge').textContent = rotulosPapel[usuario.papel];
      aoAutenticar(usuario);
      verificacao.hidden = true;
      painel.hidden = false;
    } catch (erro) {
      mostrarErro(erro, feedbackInicial, referenciaInicial);
      tentar.hidden = false;
    } finally { tentar.disabled = false; }
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    try {
      await sair(async () => {
        mostrarMensagem(feedback, referencia, 'Saindo da conta…');
        botaoSair.textContent = 'Saindo…';
        try {
          await auth.logout();
          painel.hidden = true;
          window.location.replace('/login.html?sessao=encerrada');
        } finally { botaoSair.textContent = 'Sair da conta'; }
      });
    } catch (erro) { mostrarErro(erro, feedback, referencia); }
  });
  tentar.addEventListener('click', () => { void carregarSessao(); });
  window.addEventListener('pagehide', () => { painel.hidden = true; });
  window.addEventListener('pageshow', (evento) => { if (evento.persisted) window.location.reload(); });
  void carregarSessao();
}
