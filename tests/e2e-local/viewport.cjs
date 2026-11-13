'use strict';

function viewportDaPagina(viewport) {
  return { ...(viewport ?? { width: 1366, height: 900 }) };
}

module.exports = { viewportDaPagina };
