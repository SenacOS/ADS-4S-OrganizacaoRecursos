import { auth } from './auth.js';
import { criarEnvioUnico } from './forms.js';
import { areasDoPerfil, rotulosPapel } from './navegacao.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

const painel = elemento('painel');
const verificacao = elemento('estado-sessao');
const feedbackInicial = elemento('feedback-inicial');
const referenciaInicial = elemento('referencia-inicial');
const tentar = /** @type {HTMLButtonElement} */ (elemento('tentar-sessao'));
const formulario = elemento('form-logout');
if (!(formulario instanceof HTMLFormElement) || !(tentar instanceof HTMLButtonElement)) {
  throw new Error('Estrutura da entrada autenticada inválida.');
}
const feedback = elemento('feedback-painel');
const referencia = elemento('referencia-painel');
const botaoSair = formulario.querySelector('button');
if (!botaoSair) throw new Error('Botão de saída ausente.');
const sair = criarEnvioUnico(formulario);

/** @param {import('./auth.js').Usuario} usuario */
function preencherPainel(usuario) {
  elemento('usuario-email').textContent = usuario.email;
  elemento('usuario-perfil').textContent = rotulosPapel[usuario.papel];
  elemento('perfil-badge').textContent = rotulosPapel[usuario.papel];
  const navegacao = elemento('navegacao');
  const areas = elemento('areas-perfil');
  navegacao.replaceChildren();
  areas.replaceChildren();
  const inicio = document.createElement('li');
  const link = document.createElement('a');
  link.href = '/index.html';
  link.className = 'nav-item';
  link.setAttribute('aria-current', 'page');
  link.textContent = 'Início';
  inicio.append(link);
  navegacao.append(inicio);

  areasDoPerfil(usuario).forEach((area, i) => {
    const numero = String(i + 1).padStart(2, '0');
    const item = document.createElement('li');
    const rotulo = document.createElement('span');
    rotulo.className = 'nav-item';
    rotulo.setAttribute('role', 'link');
    rotulo.setAttribute('aria-disabled', 'true');
    rotulo.setAttribute('aria-label', area.titulo + ' — em breve');
    const indice = document.createElement('span');
    indice.className = 'nav-index';
    indice.setAttribute('aria-hidden', 'true');
    indice.textContent = numero;
    rotulo.append(indice, area.titulo);
    item.append(rotulo);
    navegacao.append(item);

    const card = document.createElement('article');
    card.className = 'area-card';
    const marcador = document.createElement('span');
    marcador.className = 'area-number';
    marcador.setAttribute('aria-hidden', 'true');
    marcador.textContent = numero;
    const titulo = document.createElement('h3');
    titulo.textContent = area.titulo;
    const descricao = document.createElement('p');
    descricao.textContent = area.descricao;
    const estado = document.createElement('span');
    estado.className = 'soon-label';
    estado.textContent = 'Em breve';
    card.append(marcador, titulo, descricao, estado);
    areas.append(card);
  });
}

async function carregarSessao() {
  painel.hidden = true;
  verificacao.hidden = false;
  tentar.hidden = true;
  tentar.disabled = true;
  mostrarMensagem(feedbackInicial, referenciaInicial, 'Verificando seu acesso…');
  try {
    const usuario = await auth.me();
    preencherPainel(usuario);
    verificacao.hidden = true;
    painel.hidden = false;
  } catch (erro) {
    mostrarErro(erro, feedbackInicial, referenciaInicial);
    tentar.hidden = false;
  } finally {
    tentar.disabled = false;
  }
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
      } finally {
        botaoSair.textContent = 'Sair da conta';
      }
    });
  } catch (erro) {
    mostrarErro(erro, feedback, referencia);
  }
});
tentar.addEventListener('click', () => { void carregarSessao(); });
window.addEventListener('pageshow', (evento) => {
  if (evento.persisted) window.location.reload();
});
void carregarSessao();
