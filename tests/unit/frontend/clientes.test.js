import test from 'node:test';
import assert from 'node:assert/strict';
import { criarApi, ErroApi, apresentarErro } from '../../../backend/src/main/resources/static/js/api.js';
import { criarAuth, podeAprovar } from '../../../backend/src/main/resources/static/js/auth.js';
import { criarReservas } from '../../../backend/src/main/resources/static/js/reservas.js';

const csrf = (token = 'token-1') => Response.json({ token, header: 'X-CSRF-DINAMICO' });
const ok = () => Response.json({ id: 10, status: 'APROVADA' });
const erro = (status, codigo) => Response.json({
  codigo, mensagem: 'Mensagem do contrato.', correlationId: 'suporte-123',
}, { status });

function ambiente(respostas) {
  const chamadas = [];
  let expirou = 0;
  const api = criarApi({
    fetchImpl: async (url, opcoes) => {
      chamadas.push({ url, ...opcoes });
      const resposta = respostas.shift();
      if (resposta instanceof Error) throw resposta;
      assert.ok(resposta, 'Requisição inesperada: ' + url);
      return resposta;
    },
    aoExpirarSessao: () => { expirou++; },
  });
  return { api, chamadas, expirou: () => expirou };
}

const dados = {
  inicio: '2026-11-10T13:00:00-03:00', fim: '2026-11-10T14:00:00-03:00', recursosIds: [101, 305],
};

test('GET usa sessão e não busca CSRF; me devolve perfil', async () => {
  const a = ambiente([Response.json({ usuarioId: 7, email: 'a@b.com', papel: 'RESPONSAVEL' })]);
  assert.equal((await criarAuth(a.api).me()).papel, 'RESPONSAVEL');
  assert.equal(a.chamadas.length, 1);
  assert.equal(a.chamadas[0].url, '/api/auth/me');
  assert.equal(a.chamadas[0].credentials, 'same-origin');
  assert.equal(a.chamadas[0].cache, 'no-store');
});

for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
  test(method + ' envia CSRF dinâmico e sessão', async () => {
    const a = ambiente([csrf(), new Response(null, { status: 204 })]);
    assert.equal(await a.api.requisitar('/api/teste', { method }), null);
    assert.equal(a.chamadas[0].url, '/api/auth/csrf');
    assert.equal(a.chamadas[1].headers.get('X-CSRF-DINAMICO'), 'token-1');
    assert.equal(a.chamadas[1].credentials, 'same-origin');
  });
}

test('login codifica email/senha como formulário e aceita 204; logout renova CSRF', async () => {
  const a = ambiente([csrf('antes'), new Response(null, { status: 204 }),
    csrf('depois-login'), new Response(null, { status: 204 }), csrf('depois-logout'), ok()]);
  const auth = criarAuth(a.api);
  await auth.login('m+a@exemplo.com', 's&n=ha ç');
  const chamada = a.chamadas[1];
  assert.match(chamada.headers.get('Content-Type'), /^application\/x-www-form-urlencoded/);
  const formulario = new URLSearchParams(chamada.body);
  assert.equal(formulario.get('email'), 'm+a@exemplo.com');
  assert.equal(formulario.get('senha'), 's&n=ha ç');
  await auth.logout();
  assert.equal(a.chamadas[3].headers.get('X-CSRF-DINAMICO'), 'depois-login');
  await criarReservas(a.api).criar(dados);
  assert.equal(a.chamadas[5].headers.get('X-CSRF-DINAMICO'), 'depois-logout');
});

test('credenciais inválidas ficam no login; sessão ausente aciona redirecionamento', async () => {
  const a = ambiente([csrf(), erro(401, 'CREDENCIAIS_INVALIDAS'), erro(401, 'NAO_AUTENTICADO')]);
  await assert.rejects(criarAuth(a.api).login('a', 'b'), { codigo: 'CREDENCIAIS_INVALIDAS' });
  assert.equal(a.expirou(), 0);
  await assert.rejects(criarAuth(a.api).me(), { codigo: 'NAO_AUTENTICADO' });
  assert.equal(a.expirou(), 1);
});

for (const status of [400, 403, 404, 409]) {
  test('erro ' + status + ' preserva contrato e não repete escrita', async () => {
    const a = ambiente([csrf(), erro(status, 'CODIGO_TESTE')]);
    await assert.rejects(criarReservas(a.api).criar(dados), (falha) => {
      assert.ok(falha instanceof ErroApi);
      assert.equal(falha.status, status);
      assert.deepEqual(apresentarErro(falha), { mensagem: 'Mensagem do contrato.', referencia: 'suporte-123' });
      return true;
    });
    assert.equal(a.chamadas.length, 2);
  });
}

test('403 invalida token para próxima ação explícita, sem replay da anterior', async () => {
  const a = ambiente([csrf('velho'), erro(403, 'OPERACAO_NAO_PERMITIDA'), csrf('novo'), ok()]);
  await assert.rejects(criarReservas(a.api).criar(dados));
  assert.equal(a.chamadas.length, 2);
  await criarReservas(a.api).criar(dados);
  assert.equal(a.chamadas[3].headers.get('X-CSRF-DINAMICO'), 'novo');
});

test('PATCH completo preserva offset e remove campos de identidade/status', async () => {
  const a = ambiente([csrf(), ok()]);
  await criarReservas(a.api).editar(10, { ...dados, solicitanteId: 999, papel: 'ADMINISTRADOR', status: 'APROVADA' });
  assert.equal(a.chamadas[1].method, 'PATCH');
  assert.deepEqual(JSON.parse(a.chamadas[1].body), dados);
  await assert.rejects(criarReservas(a.api).editar(10, { inicio: dados.inicio, fim: dados.fim }));
  assert.equal(a.chamadas.length, 2);
});

test('datas sem offset, fim não posterior e recursos inválidos falham antes do fetch', async () => {
  const a = ambiente([]);
  for (const invalido of [
    { ...dados, inicio: '2026-11-10T13:00' },
    { ...dados, fim: dados.inicio },
    { ...dados, inicio: '2026-02-30T13:00:00-03:00', fim: '2026-03-03T14:00:00-03:00' },
    { ...dados, recursosIds: [] },
    { ...dados, recursosIds: [-1] },
  ]) {
    await assert.rejects(criarReservas(a.api).criar(invalido), { codigo: 'REQUISICAO_INVALIDA' });
  }
  assert.equal(a.chamadas.length, 0);
});

test('cancelamento, aprovação e rejeição usam rotas e motivo contratados', async () => {
  const a = ambiente([csrf(), ok(), ok(), ok()]);
  const reservas = criarReservas(a.api);
  await reservas.cancelar(10);
  await reservas.aprovar(10);
  await reservas.rejeitar(10, '  Indisponível para este uso.  ');
  assert.deepEqual(a.chamadas.slice(1).map((c) => c.url), [
    '/api/reservas/10/cancelamento', '/api/reservas/10/aprovacao', '/api/reservas/10/rejeicao',
  ]);
  assert.deepEqual(JSON.parse(a.chamadas[3].body), { motivo: 'Indisponível para este uso.' });
  await assert.rejects(reservas.rejeitar(10, '  '));
  assert.equal(a.chamadas.length, 4);
});

test('somente RESPONSAVEL recebe conveniência visual de aprovação', () => {
  for (const papel of ['SOLICITANTE', 'ADMINISTRADOR']) assert.equal(podeAprovar({ papel }), false);
  assert.equal(podeAprovar({ papel: 'RESPONSAVEL' }), true);
  assert.equal(podeAprovar(null), false);
});

test('falha de rede e HTML inesperado não vazam detalhes nem repetem escrita', async () => {
  const a = ambiente([csrf(), new Error('Detalhe interno')]);
  await assert.rejects(criarReservas(a.api).criar(dados), (e) => {
    assert.equal(e.codigo, 'FALHA_DE_REDE');
    assert.doesNotMatch(e.message, /Detalhe interno/);
    return true;
  });
  assert.equal(a.chamadas.length, 2);
  const b = ambiente([new Response('<html>stack trace SQL</html>', { status: 500 })]);
  await assert.rejects(b.api.requisitar('/api/teste'), (e) => {
    assert.doesNotMatch(e.message, /SQL|stack trace/);
    return true;
  });
  const c = ambiente([new Response('<html>login</html>')]);
  await assert.rejects(c.api.requisitar('/api/teste'), { codigo: 'RESPOSTA_INVALIDA' });
});

test('CSRF ausente não permite escrita e falha inicial pode ser recuperada', async () => {
  const a = ambiente([Response.json({}), csrf(), ok()]);
  await assert.rejects(criarReservas(a.api).criar(dados), { codigo: 'RESPOSTA_INVALIDA' });
  assert.equal(a.chamadas.length, 1);
  await criarReservas(a.api).criar(dados);
  assert.equal(a.chamadas.length, 3);
});

test('origem externa e correlação inválida falham antes de buscar token', async () => {
  const a = ambiente([]);
  for (const caminho of ['https://externo.test/api/a', '//externo.test/api/a', '/api/../fora']) {
    await assert.rejects(a.api.requisitar(caminho));
  }
  await assert.rejects(a.api.requisitar('/api/teste', { correlationId: 'invalido /' }));
  assert.equal(a.chamadas.length, 0);
  const b = ambiente([ok()]);
  await b.api.requisitar('/api/teste', { correlationId: 'marcos.1_ok-2' });
  assert.equal(b.chamadas[0].headers.get('X-Correlation-Id'), 'marcos.1_ok-2');
});

test('escritas paralelas compartilham somente a busca de CSRF', async () => {
  const a = ambiente([csrf(), ok(), ok()]);
  await Promise.all([
    a.api.requisitar('/api/teste', { method: 'POST' }),
    a.api.requisitar('/api/teste', { method: 'POST' }),
  ]);
  assert.equal(a.chamadas.filter((c) => c.url === '/api/auth/csrf').length, 1);
  assert.equal(a.chamadas.filter((c) => c.method === 'POST').length, 2);
});
