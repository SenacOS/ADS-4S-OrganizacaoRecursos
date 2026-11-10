import { ErroApi } from './api.js';
import { auth } from './auth.js';
import { criarEnvioUnico } from './forms.js';
import { elemento, mostrarErro, mostrarMensagem } from './ui.js';

const formulario = elemento('form-login');
const campos = /** @type {HTMLFieldSetElement} */ (elemento('campos-login'));
if (!(formulario instanceof HTMLFormElement) || !(campos instanceof HTMLFieldSetElement)) {
  throw new Error('Estrutura do formulário de login inválida.');
}
const feedback = elemento('feedback');
const referencia = elemento('referencia');
const botao = formulario.querySelector('button');
if (!botao) throw new Error('Botão de login ausente.');
const enviar = criarEnvioUnico(formulario);

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!formulario.reportValidity()) return;
  const dados = new FormData(formulario);
  try {
    await enviar(async () => {
      mostrarMensagem(feedback, referencia, 'Entrando…');
      botao.textContent = 'Entrando…';
      try {
        await auth.login(String(dados.get('email') ?? '').trim(), String(dados.get('senha') ?? ''));
        mostrarMensagem(feedback, referencia, 'Acesso confirmado. Abrindo seu espaço…', 'success');
        window.location.replace('/index.html');
      } finally {
        botao.textContent = 'Entrar ↗';
      }
    });
  } catch (erro) {
    mostrarErro(erro, feedback, referencia);
  }
});

async function verificarSessao() {
  try {
    await auth.me();
    window.location.replace('/index.html');
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401 && erro.codigo === 'NAO_AUTENTICADO') {
      const contexto = new URLSearchParams(window.location.search).get('sessao');
      if (contexto === 'expirada') {
        mostrarMensagem(feedback, referencia, 'Sua sessão está ausente ou expirou. Entre novamente para continuar.');
      } else if (contexto === 'encerrada') {
        mostrarMensagem(feedback, referencia, 'Você saiu da sua conta.', 'success');
      } else {
        mostrarMensagem(feedback, referencia, '');
      }
    } else {
      mostrarErro(erro, feedback, referencia);
    }
  } finally {
    formulario.hidden = false;
    campos.disabled = false;
  }
}

void verificarSessao();
