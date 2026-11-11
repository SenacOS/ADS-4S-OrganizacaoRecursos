import { apresentarErro } from './api.js';

/** @param {string} id @returns {HTMLElement} */
export function elemento(id) {
  const encontrado = document.getElementById(id);
  if (!encontrado) throw new Error('Elemento obrigatório ausente: ' + id);
  return encontrado;
}

/** @param {HTMLElement} destino @param {HTMLElement} referencia
 * @param {string} mensagem @param {'info'|'error'|'success'} [estado] */
export function mostrarMensagem(destino, referencia, mensagem, estado = 'info') {
  destino.textContent = mensagem;
  destino.dataset.state = estado;
  destino.hidden = !mensagem;
  referencia.textContent = '';
  referencia.hidden = true;
}

/** @param {unknown} erro @param {HTMLElement} destino @param {HTMLElement} referencia */
export function mostrarErro(erro, destino, referencia) {
  const aviso = apresentarErro(erro);
  mostrarMensagem(destino, referencia, aviso.mensagem, 'error');
  if (aviso.referencia) {
    referencia.textContent = 'Referência de suporte: ' + aviso.referencia;
    referencia.hidden = false;
  }
  destino.focus();
}
