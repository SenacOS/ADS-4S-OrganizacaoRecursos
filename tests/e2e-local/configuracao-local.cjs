'use strict';

// Uma passagem pelas linhas, sem quantificador de whitespace com backtracking.
function possuiInclude(texto) {
  return texto.split(/\r\n|[\n\r\u2028\u2029]/).some(linha => linha.trimStart().toLowerCase().startsWith('!include'));
}

module.exports = { possuiInclude };
