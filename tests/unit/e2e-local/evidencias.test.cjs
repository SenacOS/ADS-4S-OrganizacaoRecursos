'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { projetarRelatorio, restaurarRelatorio } = require('../../e2e-local/evidencias.cjs');
const { viewportDaPagina } = require('../../e2e-local/viewport.cjs');
const digest = crypto.createHash('sha256').update('fonte de teste').digest('hex');
const original = { inicio:'data original', cenarios:[{estado:'FAIL',erro:'coleta original'}], resumo:{PASS:9,FAIL:1},
  hashes:{'backend/src/main/resources/static/js/auth.js':digest,'tests/e2e-local/auxiliar.cjs':digest} };

test('viewport padrão e móvel preservam dimensões sem compartilhar objeto mutável', () => {
  const primeiro = viewportDaPagina(); assert.deepEqual(primeiro,{width:1366,height:900}); primeiro.width=1;
  assert.deepEqual(viewportDaPagina(),{width:1366,height:900});
  const movel = {width:390,height:844}, copiado = viewportDaPagina(movel); assert.deepEqual(copiado,movel); copiado.height=1; assert.equal(movel.height,844);
});

test('projeção torna o algoritmo explícito e preserva integralmente a evidência sem mutá-la', () => {
  const antes = JSON.stringify(original), projetado = projetarRelatorio(original);
  assert.equal(projetado.versaoFormato, 2); assert(!Object.hasOwn(projetado, 'hashes'));
  assert.deepEqual(projetado.artefatos[0], {arquivo:Object.keys(original.hashes)[0],algoritmo:'SHA-256',digest});
  assert.deepEqual(restaurarRelatorio(JSON.parse(JSON.stringify(projetado))),original);
  assert.equal(JSON.stringify(original),antes);
});
test('tentativa incompleta continua incompleta e preserva hashes vazios', () => {
  const parcial = {cenarios:[{estado:'PASS'}],hashes:{}};
  assert.deepEqual(restaurarRelatorio(projetarRelatorio(parcial)),parcial);
  assert(!Object.hasOwn(projetarRelatorio(parcial),'fim'));
});
test('digest inválido ou formato duplicado não vira evidência válida', () => {
  assert.throws(() => projetarRelatorio({hashes:{arquivo:'não é digest'}}),/inválido/);
  assert.throws(() => projetarRelatorio({hashes:[]}),/Mapa/);
  assert.throws(() => projetarRelatorio({...original,artefatos:[]}),/já projetado/);
});
test('leitor recusa algoritmo desconhecido, arquivo duplicado e versão inválida', () => {
  const p = projetarRelatorio(original);
  assert.throws(() => restaurarRelatorio({...p,versaoFormato:3}),/Versão/);
  assert.throws(() => restaurarRelatorio({...p,artefatos:[{...p.artefatos[0],algoritmo:'outro'}]}),/Algoritmo/);
  assert.throws(() => restaurarRelatorio({...p,artefatos:[p.artefatos[0],p.artefatos[0]]}),/duplicado/);
});
