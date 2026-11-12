'use strict';

// Ambiente Windows descartável. Não instala ferramentas nem inicializa/apaga banco.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn, execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');

const repo = path.resolve(__dirname, '../..');
const local = path.join(repo, '.aiox-core/local');
const dir = path.join(local, 'e2e');
const ler = (arquivo) => JSON.parse(fs.readFileSync(arquivo, 'utf8').replace(/^\uFEFF/, ''));
const ferramentas = ler(path.join(local, 'tools/paths.json'));
const credenciais = ler(path.join(dir, 'credentials.json'));
const arquivoEstado = path.join(dir, 'state.json');
const estado = ler(arquivoEstado);
const jar = path.join(repo, 'backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar');
const mysqlIni = path.join(dir, 'mysql.ini');
const clienteIni = path.join(dir, 'root-client.ini');
const norm = (p) => path.resolve(p).toLowerCase();
const salvar = () => fs.writeFileSync(arquivoEstado, JSON.stringify(estado, null, 2) + '\n');
const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function dentro(p, base) {
  const relativo = path.relative(base, p);
  assert(relativo && !relativo.startsWith('..') && !path.isAbsolute(relativo), 'Caminho fora da área isolada.');
}

function configurar() {
  assert.equal(process.platform, 'win32', 'Auxiliar preparado para Windows.');
  for (const p of [ferramentas.jdk, ferramentas.maven, ferramentas.mysql]) dentro(p, path.join(local, 'tools'));
  assert.equal(credenciais.db.host, '127.0.0.1');
  assert.equal(credenciais.db.name, 'qs_marcos_e2e');
  for (const porta of [estado.mysqlPort, estado.backendPort]) assert(Number.isInteger(porta) && porta > 1024 && porta < 65536);
  assert.equal(credenciais.db.port, estado.mysqlPort);
  assert.equal(estado.baseURL, `http://127.0.0.1:${estado.backendPort}`);
  assert.equal(estado.database, credenciais.db.name);
  const ini = fs.readFileSync(mysqlIni, 'utf8');
  assert(!/^\s*!include/im.test(ini), 'Includes não permitidos.');
  assert(/^bind-address=127\.0\.0\.1\s*$/m.test(ini), 'MySQL deve escutar apenas em loopback.');
  assert(ini.includes(`port=${estado.mysqlPort}`));
  assert(ini.includes(path.join(dir, 'mysql-data').replaceAll('\\', '/')), 'Datadir isolado obrigatório.');
  const cliente = fs.readFileSync(clienteIni, 'utf8');
  assert(/^host=127\.0\.0\.1\s*$/m.test(cliente) && cliente.includes(`port=${estado.mysqlPort}`));
}

function sql(consulta) {
  assert(/^SELECT\b/i.test(consulta.trim()) && !consulta.includes(';'), 'Somente SELECT único para inspeção.');
  return execFileSync(path.join(ferramentas.mysql, 'bin/mysql.exe'), [
    `--defaults-file=${clienteIni}`, '--batch', '--raw', '--skip-column-names',
    `--database=${estado.database}`, `--execute=${consulta}`,
  ], { windowsHide: true, encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function identificarBanco() {
  const [uuid, dados, porta] = sql('SELECT @@server_uuid,@@datadir,@@port').split('\t');
  assert(estado.mysqlUuid, 'Falta identidade previamente conferida da instância.');
  assert.equal(uuid, estado.mysqlUuid, 'Instância MySQL diferente.');
  assert.equal(norm(dados), norm(path.join(dir, 'mysql-data')));
  assert.equal(Number(porta), estado.mysqlPort);
  return uuid;
}

function processo(pid) {
  assert(Number.isInteger(pid) && pid > 0, 'PID inválido.');
  const saida = execFileSync('powershell.exe', ['-NoProfile', '-Command',
    `$p=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}'; if ($p) { $p | Select-Object ExecutablePath,CommandLine,CreationDate | ConvertTo-Json -Compress }`,
  ], { windowsHide: true, encoding: 'utf8', timeout: 10000 });
  return saida.trim() ? JSON.parse(saida) : null;
}

function identificarBackend() {
  const p = processo(estado.backendPid);
  assert(p, 'Backend registrado não está em execução.');
  assert.equal(norm(p.ExecutablePath), norm(path.join(ferramentas.jdk, 'bin/java.exe')));
  assert(p.CommandLine.includes(jar) && /\s-jar\s/.test(p.CommandLine), 'Processo Java não pertence a este ambiente.');
  assert(estado.backendCriadoEm && p.CreationDate === estado.backendCriadoEm, 'PID Java reutilizado ou sem identidade registrada.');
}

async function portaLivre(porta) {
  await new Promise((resolve, reject) => {
    const s = net.createServer(); s.once('error', reject); s.listen(porta, '127.0.0.1', () => s.close(resolve));
  });
}

function iniciarProcesso(exe, args, prefixo, env = process.env) {
  const out = fs.openSync(path.join(dir, `${prefixo}-stdout.log`), 'a');
  const err = fs.openSync(path.join(dir, `${prefixo}-stderr.log`), 'a');
  try {
    const filho = spawn(exe, args, { cwd: repo, env, detached: true, windowsHide: true, stdio: ['ignore', out, err] });
    filho.on('error', () => { console.error('Falha ao iniciar processo local; consulte os logs privados.'); process.exitCode = 1; });
    filho.unref();
    assert(Number.isInteger(filho.pid), 'Processo local não iniciou.');
    return filho.pid;
  } finally { fs.closeSync(out); fs.closeSync(err); }
}

async function esperar(verificar, descricao) {
  for (let n = 0; n < 50; n++) {
    try { await verificar(); return; } catch { await pausa(1000); }
  }
  throw new Error(`Tempo esgotado: ${descricao}. Consulte os logs privados.`);
}

async function pronto() {
  identificarBanco(); identificarBackend();
  const r = await fetch(`${estado.baseURL}/api/auth/csrf`, { signal: AbortSignal.timeout(3000) });
  assert.equal(r.status, 200);
  const csrf = await r.json(); assert(csrf.token && csrf.header);
}

async function iniciar() {
  try { await pronto(); console.log('Ambiente isolado já está pronto.'); return; } catch { /* Conferir portas antes de iniciar. */ }
  // Se houver um banco na porta, sua identidade precisa conferir. Nunca substituir.
  let bancoPronto = false;
  try { identificarBanco(); bancoPronto = true; } catch {
    await portaLivre(estado.mysqlPort);
  }
  if (!bancoPronto) {
    estado.mysqlPid = iniciarProcesso(path.join(ferramentas.mysql, 'bin/mysqld.exe'), [`--defaults-file=${mysqlIni}`, '--console'], 'mysql'); salvar();
    await esperar(identificarBanco, 'inicialização do MySQL');
  }
  await portaLivre(estado.backendPort);
  const env = { ...process.env,
    DB_URL: `jdbc:mysql://127.0.0.1:${estado.mysqlPort}/${estado.database}?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true`,
    DB_USER: credenciais.db.user, DB_PASSWORD: credenciais.db.password,
    DEMO_ADMIN_EMAIL: credenciais.admin.email, DEMO_ADMIN_SENHA: credenciais.admin.password,
    SPRING_PROFILES_ACTIVE: 'local', SERVER_ADDRESS: '127.0.0.1', SERVER_PORT: String(estado.backendPort),
    RECURSOS_API_ENABLED: 'true', RESERVAS_API_ENABLED: 'true', MOVIMENTACOES_API_ENABLED: 'true',
    NOTIFICACOES_WORKER_ENABLED: 'false',
  };
  estado.backendPid = iniciarProcesso(path.join(ferramentas.jdk, 'bin/java.exe'), ['-jar', jar], 'backend', env);
  await esperar(() => {
    const p = processo(estado.backendPid); assert(p); estado.backendCriadoEm = p.CreationDate;
  }, 'identificação do Java');
  estado.estado = 'BACKEND_INICIANDO'; salvar();
  await esperar(pronto, 'HTTP do Spring');
  estado.estado = 'PRONTO'; salvar(); console.log(`Ambiente pronto: ${estado.baseURL}`);
}

async function parar() {
  // Validar tudo antes de encerrar qualquer processo; PID/porta sozinhos não bastam.
  identificarBanco();
  const p = processo(estado.backendPid);
  if (p) identificarBackend();
  if (p) {
    process.kill(estado.backendPid);
    await esperar(() => assert(!processo(estado.backendPid)), 'encerramento do Java');
  }
  execFileSync(path.join(ferramentas.mysql, 'bin/mysqladmin.exe'), [`--defaults-file=${clienteIni}`, 'shutdown'],
    { windowsHide: true, timeout: 20000, stdio: ['ignore', 'pipe', 'pipe'] });
  estado.estado = 'PARADO'; salvar(); console.log('Processos próprios encerrados; dados preservados.');
}

configurar();
module.exports = { repo, dir, ferramentas, credenciais, estado, sql, pronto };
if (require.main === module) {
  const comando = process.argv[2];
  (async () => {
    if (comando === 'iniciar') await iniciar();
    else if (comando === 'parar') await parar();
    else if (comando === 'status') { await pronto(); console.log(`PRONTO ${estado.baseURL}; banco isolado identificado.`); }
    else throw new Error('Uso: node tests/e2e-local/controle.cjs iniciar|parar|status');
  })().catch(() => { console.error('Controle não concluído. Confira estado/configuração e logs privados; nenhum dado foi apagado.'); process.exitCode = 1; });
}
