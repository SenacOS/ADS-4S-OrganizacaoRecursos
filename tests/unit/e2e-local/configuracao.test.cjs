'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { criarExecutaveis, validarExecutavel, criarExecutor } = require('../../e2e-local/executaveis.cjs');
const { possuiInclude } = require('../../e2e-local/configuracao-local.cjs');

function fixture(t) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'qs-e2e-config-'));
  const arquivos = ['git.exe', 'powershell.exe', 'outro.exe'].map(nome => path.join(raiz, nome));
  arquivos.forEach(arquivo => fs.writeFileSync(arquivo, 'fixture de validação, não executar'));
  t.after(() => { arquivos.forEach(arquivo => { if (fs.existsSync(arquivo)) fs.unlinkSync(arquivo); }); fs.rmdirSync(raiz); });
  return { git: arquivos[0], powershell: arquivos[1], outro: arquivos[2], raiz };
}

test('configuração válida produz caminhos reais absolutos e não pode ser alterada', t => {
  const f = fixture(t), config = criarExecutaveis(f);
  assert.equal(config.git, fs.realpathSync(f.git)); assert.equal(config.powershell, fs.realpathSync(f.powershell));
  assert(path.isAbsolute(config.git)); assert(path.isAbsolute(config.powershell));
  assert.throws(() => { config.git = f.outro; }, TypeError);
});
test('caminho ausente/relativo é recusado mesmo com diretório no PATH', t => {
  const f = fixture(t), anterior = process.env.PATH;
  try {
    process.env.PATH = f.raiz;
    for (const git of [undefined, '', 'git.exe', path.join('relativo', 'git.exe')]) assert.throws(() => criarExecutaveis({ git, powershell: f.powershell }), /absoluto/);
  } finally { if (anterior === undefined) delete process.env.PATH; else process.env.PATH = anterior; }
});
test('nome inesperado e arquivo inexistente não são aceitos como instalação', t => {
  const f = fixture(t);
  assert.throws(() => validarExecutavel(f.outro, 'git.exe'), /Nome de executável/);
  assert.throws(() => validarExecutavel(path.join(f.raiz, 'ausente', 'git.exe'), 'git.exe'), /arquivo regular/);
  assert.throws(() => validarExecutavel(f.git, 'outro.exe'), /não permitido/);
});
test('diretório com nome do executável e configuração incompleta falham antes de executar', t => {
  const f = fixture(t), diretorio = path.join(f.raiz, 'sub'); fs.mkdirSync(diretorio); const falso = path.join(diretorio, 'git.exe'); fs.mkdirSync(falso);
  try { assert.throws(() => validarExecutavel(falso, 'git.exe'), /arquivo regular/); }
  finally { fs.rmdirSync(falso); fs.rmdirSync(diretorio); }
  assert.throws(() => criarExecutaveis(null), /obrigatória/);
  assert.throws(() => criarExecutaveis({ git: f.git }), /powershell.exe/);
});
test('include e includedir em qualquer linha/capitalização são recusados', () => {
  for (const ini of ['!include outro.ini', '  !INCLUDEDIR pasta', '# comentário\r\n\t!Include outro.ini', '\uFEFF\n  !include']) assert(possuiInclude(ini));
  for (const ini of ['', '[mysqld]\nport=13307', '# !include ignorado\nvalor=!include', '; !includedir']) assert(!possuiInclude(ini));
});
test('recusa includes após todos os terminadores de linha reconhecidos anteriormente', () => {
  for (const fim of ['\r','\n','\r\n','\u2028','\u2029']) assert(possuiInclude('[mysqld]' + fim + '\t!include outro.ini'));
});
test('executor recebe caminho absoluto, argumentos separados e shell desabilitado', t => {
  const f = fixture(t), chamadas = [];
  const executar = criarExecutor(f, (...args) => { chamadas.push(args); return 'saída real do invocador'; });
  assert.equal(executar.git(['rev-parse','HEAD'],{cwd:f.raiz,shell:true,windowsHide:false}), 'saída real do invocador');
  executar.powershell(['-NoProfile','-Command','comando de teste']);
  assert.deepEqual(chamadas[0],[fs.realpathSync(f.git),['rev-parse','HEAD'],{cwd:f.raiz,shell:false,windowsHide:true}]);
  assert.equal(chamadas[1][0],fs.realpathSync(f.powershell));
  assert.throws(() => executar.git('rev-parse HEAD'),/lista/); assert.equal(chamadas.length,2);
});
test('falha de execução propaga sem inventar resultado ou consultar PATH', t => {
  const f = fixture(t), erro = new Error('falha do executável'), executar = criarExecutor(f, () => { throw erro; });
  assert.throws(() => executar.git(['rev-parse','HEAD']), recebido => recebido === erro);
});
test('entrada longa com whitespace não oculta uma diretiva nem confunde valores', () => {
  const espacos = ' '.repeat(500000);
  assert(possuiInclude(espacos + '!include outro.ini'));
  assert(!possuiInclude(espacos + '# comentário\nvalor=' + espacos + '!include'));
});
