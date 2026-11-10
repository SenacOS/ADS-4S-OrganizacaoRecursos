import test from 'node:test';
import assert from 'node:assert/strict';
import { criarEnvioUnico } from '../../../backend/src/main/resources/static/js/forms.js';

// Dublês mínimos somente para o estado do formulário, sem alegar teste de navegador.
test('guard ignora duplo envio, indica busy e restaura controles em sucesso e erro', async () => {
  const anteriores = {
    button: globalThis.HTMLButtonElement, input: globalThis.HTMLInputElement,
  };
  globalThis.HTMLButtonElement = class { disabled = false; };
  globalThis.HTMLInputElement = class { disabled = true; };
  try {
    const controles = [new globalThis.HTMLButtonElement(), new globalThis.HTMLInputElement()];
    const atributos = new Map();
    const form = {
      getAttribute: (nome) => atributos.get(nome) ?? null,
      setAttribute: (nome, valor) => atributos.set(nome, valor),
      removeAttribute: (nome) => atributos.delete(nome),
      querySelectorAll: () => controles,
    };
    const enviar = criarEnvioUnico(form);
    let liberar;
    const pendente = new Promise((resolve) => { liberar = resolve; });
    let execucoes = 0;
    const primeira = enviar(async () => { execucoes++; await pendente; return 7; });
    assert.equal(atributos.get('aria-busy'), 'true');
    assert.equal(controles[0].disabled, true);
    assert.equal(await enviar(async () => { execucoes++; }), undefined);
    assert.equal(execucoes, 1);
    liberar();
    assert.equal(await primeira, 7);
    assert.equal(controles[0].disabled, false);
    assert.equal(controles[1].disabled, true);
    assert.equal(atributos.has('aria-busy'), false);

    atributos.set('aria-busy', 'false');
    await assert.rejects(enviar(async () => { throw new Error('Falha'); }));
    assert.equal(atributos.get('aria-busy'), 'false');
    assert.equal(controles[0].disabled, false);
    await enviar(async () => { execucoes++; });
    assert.equal(execucoes, 2);
  } finally {
    if (anteriores.button === undefined) delete globalThis.HTMLButtonElement;
    else globalThis.HTMLButtonElement = anteriores.button;
    if (anteriores.input === undefined) delete globalThis.HTMLInputElement;
    else globalThis.HTMLInputElement = anteriores.input;
  }
});
