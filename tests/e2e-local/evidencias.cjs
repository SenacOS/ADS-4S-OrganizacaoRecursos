'use strict';

const assert = require('node:assert/strict');

function conferir(arquivo, digest) {
  assert(typeof arquivo === 'string' && arquivo.length > 0, 'Arquivo de integridade obrigatório.');
  assert(typeof digest === 'string' && /^[a-f0-9]{64}$/.test(digest), 'Digest SHA-256 inválido.');
}

// Caminho é dado de um registro; não é nome de propriedade interpretável como credencial.
function projetarRelatorio(relatorio) {
  const { hashes, ...provas } = relatorio;
  assert(hashes && typeof hashes === 'object' && !Array.isArray(hashes), 'Mapa de integridade obrigatório.');
  assert(!Object.hasOwn(provas, 'artefatos') && !Object.hasOwn(provas, 'versaoFormato'), 'Formato já projetado.');
  const artefatos = Object.entries(hashes).map(([arquivo, digest]) => {
    conferir(arquivo, digest); return { arquivo, algoritmo: 'SHA-256', digest };
  });
  return { ...provas, versaoFormato: 2, artefatos };
}

function restaurarRelatorio(relatorio) {
  const { artefatos, versaoFormato, ...provas } = relatorio;
  assert.equal(versaoFormato, 2, 'Versão de evidência desconhecida.');
  assert(Array.isArray(artefatos), 'Inventário de integridade obrigatório.');
  const entradas = artefatos.map(a => {
    assert.equal(a.algoritmo, 'SHA-256', 'Algoritmo de integridade inesperado.');
    conferir(a.arquivo, a.digest); return [a.arquivo, a.digest];
  });
  assert.equal(new Set(entradas.map(([arquivo]) => arquivo)).size, entradas.length, 'Arquivo de integridade duplicado.');
  return { ...provas, hashes: Object.fromEntries(entradas) };
}

module.exports = { projetarRelatorio, restaurarRelatorio };
