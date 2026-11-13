'use strict';

// Instância efêmera opt-in: configuração somente no processo, estado privado próprio.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawn, execFileSync } = require('node:child_process');
const { repo, dir, ferramentas, credenciais, estado, pronto } = require('./controle.cjs');
const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));
const normal = p => path.resolve(p).toLowerCase();

function processo(pid) {
  assert(Number.isSafeInteger(pid) && pid > 0);
  const texto = execFileSync('powershell.exe', ['-NoProfile', '-Command',
    `$p=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}'; if($p){$p|Select-Object ExecutablePath,CommandLine,CreationDate|ConvertTo-Json -Compress}`],
  { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  return texto.trim() ? JSON.parse(texto) : null;
}
async function livre(porta) {
  await new Promise((resolve, reject) => {
    const s = net.createServer(); s.once('error', reject);
    s.listen(porta, '127.0.0.1', () => s.close(resolve));
  });
}
async function iniciarTemporaria(pasta) {
  await pronto();
  const relativo = path.relative(path.join(dir, 'fechamento'), path.resolve(pasta));
  assert(relativo && !relativo.startsWith('..') && !path.isAbsolute(relativo), 'Estado fora da área privada desta rodada.');
  const porta = 18081, baseURL = `http://127.0.0.1:${porta}`;
  assert.notEqual(porta, estado.backendPort); assert.notEqual(porta, estado.mysqlPort); await livre(porta);
  const jar = path.join(repo, 'backend/target/organizacao-recursos-0.0.1-SNAPSHOT.jar');
  const exe = path.join(ferramentas.jdk, 'bin/java.exe');
  const nome = 'qs-e2e-fechamento-' + crypto.randomBytes(5).toString('hex');
  const arquivo = path.join(pasta, 'instancia-privada.json');
  const registro = { estado: 'INICIANDO', porta, baseURL, timeout: '1m', cookie: 'QS_FECHAMENTO_SESSION', nome };
  const salvar = () => fs.writeFileSync(arquivo, JSON.stringify(registro, null, 2) + '\n');
  const principalAntes = fs.readFileSync(path.join(dir, 'state.json'));
  const out = fs.openSync(path.join(pasta, 'temporaria-stdout.log'), 'a');
  const err = fs.openSync(path.join(pasta, 'temporaria-stderr.log'), 'a');
  let filho, erroSpawn;
  try {
    filho = spawn(exe, ['-jar', jar, `--server.port=${porta}`, '--server.address=127.0.0.1',
      '--server.servlet.session.timeout=1m', '--server.servlet.session.cookie.name=QS_FECHAMENTO_SESSION', `--spring.application.name=${nome}`],
    { cwd: repo, windowsHide: true, stdio: ['ignore', out, err], env: { ...process.env,
      DB_URL: `jdbc:mysql://127.0.0.1:${estado.mysqlPort}/${estado.database}?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true`,
      DB_USER: credenciais.db.user, DB_PASSWORD: credenciais.db.password,
      DEMO_ADMIN_EMAIL: credenciais.admin.email, DEMO_ADMIN_SENHA: credenciais.admin.password,
      SPRING_PROFILES_ACTIVE: 'local', SERVER_ADDRESS: '127.0.0.1', SERVER_PORT: String(porta),
      RECURSOS_API_ENABLED: 'true', RESERVAS_API_ENABLED: 'true', MOVIMENTACOES_API_ENABLED: 'true', NOTIFICACOES_WORKER_ENABLED: 'false' } });
    filho.on('error', e => { erroSpawn = e; });
  } finally { fs.closeSync(out); fs.closeSync(err); }
  assert(Number.isSafeInteger(filho.pid), 'Processo temporário não iniciou.'); registro.pid = filho.pid; salvar();
  function conferir(p) {
    assert(p && normal(p.ExecutablePath) === normal(exe), 'Executável temporário não confere.');
    assert(p.CommandLine.includes(jar) && p.CommandLine.includes(`--server.port=${porta}`) && p.CommandLine.includes(nome), 'Comando temporário não confere.');
    if (registro.criadoEm) assert.equal(p.CreationDate, registro.criadoEm, 'PID temporário reutilizado.');
  }
  async function parar() {
    const p = processo(registro.pid);
    if (p) { conferir(p); assert(registro.criadoEm, 'Falta identidade temporal do processo.'); process.kill(registro.pid); }
    for (let n = 0; n < 15 && processo(registro.pid); n++) await pausa(500);
    assert(!processo(registro.pid), 'Processo temporário continua ativo.'); await livre(porta);
    assert(fs.readFileSync(path.join(dir, 'state.json')).equals(principalAntes), 'Estado principal foi alterado.');
    await pronto(); registro.estado = 'ENCERRADA'; salvar();
    return { temporariaEncerrada: true, portaLivre: porta, principalPronto: true, estadoPrincipalPreservado: true };
  }
  try {
    const p = processo(registro.pid); conferir(p); registro.criadoEm = p.CreationDate; salvar();
    const limite = Date.now() + 75000;
    while (Date.now() < limite) {
      if (erroSpawn) throw erroSpawn;
      assert(filho.exitCode === null, 'Java temporário encerrou antes da prontidão.');
      try { const r = await fetch(baseURL + '/api/auth/csrf', { signal: AbortSignal.timeout(1500) });
        if (r.status === 200) { registro.estado = 'PRONTO'; salvar(); return { baseURL, parar, timeout: registro.timeout, cookie: registro.cookie }; }
      } catch { /* Só a prontidão HTTP é tentada novamente; nenhuma escrita. */ }
      await pausa(1000);
    }
    throw new Error('Tempo de inicialização temporária excedido.');
  } catch (e) {
    await parar(); throw e;
  }
}
module.exports = { iniciarTemporaria };
