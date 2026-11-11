/**
 * Um guard por formulário/ação. Instanciar uma vez, fora do listener.
 * @param {HTMLFormElement} formulario
 */
export function criarEnvioUnico(formulario) {
  let enviando = false;

  /** @template T @param {() => Promise<T>} executar */
  return async function enviar(executar) {
    if (enviando) return;
    enviando = true;
    const busyAnterior = formulario.getAttribute('aria-busy');
    const controles = Array.from(formulario.querySelectorAll(
      'button, input[type="submit"], input[type="image"]',
    )).filter((elemento) => elemento instanceof HTMLButtonElement || elemento instanceof HTMLInputElement);
    const anteriores = controles.map((controle) => controle.disabled);
    formulario.setAttribute('aria-busy', 'true');
    controles.forEach((controle) => { controle.disabled = true; });
    try {
      return await executar();
    } finally {
      controles.forEach((controle, i) => { controle.disabled = anteriores[i]; });
      if (busyAnterior === null) formulario.removeAttribute('aria-busy');
      else formulario.setAttribute('aria-busy', busyAnterior);
      enviando = false;
    }
  };
}
