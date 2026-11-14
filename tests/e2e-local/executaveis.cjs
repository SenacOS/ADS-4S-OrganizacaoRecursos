'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

// A configuração privada informa instalações conhecidas; nenhum fallback consulta PATH.
function validarExecutavel(arquivo, nome) {
  assert(['git.exe', 'powershell.exe'].includes(nome), 'Executável não permitido.');
  assert(typeof arquivo === 'string' && path.isAbsolute(arquivo), `Configure caminho absoluto para ${nome}.`);
  assert.equal(path.basename(arquivo).toLowerCase(), nome, `Nome de executável diferente de ${nome}.`);
  assert(fs.existsSync(arquivo) && fs.statSync(arquivo).isFile(), `Instalação de ${nome} não encontrada como arquivo regular.`);
  const real = fs.realpathSync(arquivo);
  assert.equal(path.basename(real).toLowerCase(), nome, `Destino real diferente de ${nome}.`);
  return real;
}

function criarExecutaveis(configuracao) {
  assert(configuracao && typeof configuracao === 'object', 'Configuração de executáveis obrigatória.');
  return Object.freeze({
    git: validarExecutavel(configuracao.git, 'git.exe'),
    powershell: validarExecutavel(configuracao.powershell, 'powershell.exe'),
  });
}

function criarExecutor(configuracao, invocar = execFileSync) {
  const caminhos = criarExecutaveis(configuracao);
  assert.equal(typeof invocar, 'function', 'Executor de processos inválido.');
  function executar(nome, args, opcoes) {
    assert(Array.isArray(args) && args.every(a => typeof a === 'string' && !a.includes('\0')), 'Argumentos devem ser uma lista de textos válidos.');
    return invocar(caminhos[nome], args, { ...opcoes, windowsHide: true, shell: false });
  }
  return Object.freeze({ caminhos, git: (args, opcoes) => executar('git', args, opcoes), powershell: (args, opcoes) => executar('powershell', args, opcoes) });
}

module.exports = { criarExecutaveis, validarExecutavel, criarExecutor };
