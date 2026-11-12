import { test as base, expect } from '@playwright/test';

// Browser real + API controlada: estes testes não provam a integração com Spring/MySQL.
const test = base.extend({
  page: async ({ page }, use) => {
    const erros = [];
    page.on('pageerror', (erro) => erros.push(erro.message));
    await use(page);
    expect(erros, 'Nenhum erro JavaScript não tratado').toEqual([]);
  },
});

async function simularApi(page, opcoes = {}) {
  const estado = {
    autenticado: false, papel: 'SOLICITANTE', email: 'marcos@exemplo.test',
    csrfCount: 0, logins: [], logouts: [], meCount: 0,
    falhaLogin: null, falhaLogout: null, falhaMe: null, usuarioInvalido: false,
    esperarLogin: null, esperarLogout: null, inesperadas: [], ...opcoes,
  };
  const falhar = (route, erro) => route.fulfill({
    status: erro.status,
    json: { codigo: erro.codigo, mensagem: erro.mensagem, correlationId: 'suporte-teste-123' },
  });
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/auth/csrf' && request.method() === 'GET') {
      estado.csrfCount++;
      await route.fulfill({ json: { token: 'csrf-' + estado.csrfCount, header: 'X-CSRF-DINAMICO' } });
    } else if (path === '/api/auth/me' && request.method() === 'GET') {
      estado.meCount++;
      if (estado.falhaMe) return falhar(route, estado.falhaMe);
      if (!estado.autenticado) return falhar(route, { status: 401, codigo: 'NAO_AUTENTICADO', mensagem: 'Autenticação necessária.' });
      await route.fulfill({ json: { usuarioId: 7, email: estado.email, papel: estado.usuarioInvalido ? 'DESCONHECIDO' : estado.papel } });
    } else if (path === '/api/auth/login' && request.method() === 'POST') {
      estado.logins.push({ body: request.postData(), headers: request.headers() });
      if (estado.esperarLogin) await estado.esperarLogin;
      if (estado.falhaLogin) return falhar(route, estado.falhaLogin);
      estado.autenticado = true;
      await route.fulfill({ status: 204 });
    } else if (path === '/api/auth/logout' && request.method() === 'POST') {
      estado.logouts.push({ headers: request.headers() });
      if (estado.esperarLogout) await estado.esperarLogout;
      if (estado.falhaLogout) return falhar(route, estado.falhaLogout);
      estado.autenticado = false;
      await route.fulfill({ status: 204 });
    } else {
      estado.inesperadas.push(request.method() + ' ' + path);
      await route.fulfill({ status: 404, json: { codigo: 'NAO_ENCONTRADO', mensagem: 'Rota não contratada.' } });
    }
  });
  return estado;
}

async function preencherLogin(page) {
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  await page.getByLabel('E-mail', { exact: true }).fill('m+a@exemplo.test');
  await page.getByLabel('Senha', { exact: true }).fill('s&n=ha ç');
}

test('login por teclado envia formulário e CSRF, depois consulta o perfil', async ({ page }) => {
  const estado = await simularApi(page);
  await page.goto('/login.html');
  await preencherLogin(page);
  await page.getByLabel('Senha', { exact: true }).press('Tab');
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/index.html$/);
  await expect(page.locator('#usuario-email')).toHaveText(estado.email);
  expect(estado.logins).toHaveLength(1);
  const pedido = estado.logins[0];
  expect(pedido.headers['content-type']).toMatch(/^application\/x-www-form-urlencoded/);
  expect(pedido.headers['x-csrf-dinamico']).toBe('csrf-1');
  const body = new URLSearchParams(pedido.body);
  expect(body.get('email')).toBe('m+a@exemplo.test');
  expect(body.get('senha')).toBe('s&n=ha ç');
  expect(estado.inesperadas).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('credenciais inválidas preservam formulário e mostram HTML como texto', async ({ page }) => {
  const mensagem = '<img src=x onerror=alert(1)> Credenciais inválidas.';
  const estado = await simularApi(page, { falhaLogin: { status: 401, codigo: 'CREDENCIAIS_INVALIDAS', mensagem } });
  await page.goto('/login.html');
  await preencherLogin(page);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('#feedback')).toHaveText(mensagem);
  await expect(page.locator('#referencia')).toHaveText('Referência de suporte: suporte-teste-123');
  await expect(page.locator('#feedback img')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('m+a@exemplo.test');
  await expect(page).toHaveURL(/\/login.html$/);
  expect(estado.logins).toHaveLength(1);
});

test('envios simultâneos de login executam uma escrita e indicam busy', async ({ page }) => {
  let liberar;
  const esperarLogin = new Promise((resolve) => { liberar = resolve; });
  const estado = await simularApi(page, { esperarLogin });
  await page.goto('/login.html');
  await preencherLogin(page);
  await page.locator('#form-login').evaluate((form) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.locator('#form-login')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
  await expect.poll(() => estado.logins.length).toBe(1);
  liberar();
  await expect(page).toHaveURL(/\/index.html$/);
  expect(estado.logins).toHaveLength(1);
});

test('sessão expirada volta ao login sem loop nem dados privados', async ({ page }) => {
  const estado = await simularApi(page);
  await page.goto('/index.html');
  await expect(page).toHaveURL(/\/login.html\?sessao=expirada$/);
  await expect(page.locator('#feedback')).toContainText('Sua sessão está ausente ou expirou');
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  expect(estado.meCount).toBe(2);
  expect(estado.logins).toHaveLength(0);
  await expect(page.locator('#usuario-email')).toHaveCount(0);
});

test('sessão já válida evita novo login e ignora destinos externos', async ({ page }) => {
  const estado = await simularApi(page, { autenticado: true });
  await page.goto('/login.html?returnTo=https://externo.invalid');
  await expect(page).toHaveURL('http://127.0.0.1:4173/index.html');
  await expect(page.locator('#usuario-perfil')).toHaveText('Solicitante');
  expect(estado.logins).toHaveLength(0);
});

for (const [papel, rotulo] of [['SOLICITANTE', 'Solicitante'], ['RESPONSAVEL', 'Responsável'], ['ADMINISTRADOR', 'Administrador']]) {
  test('navegação do perfil ' + papel + ' sem ações ou links indevidos', async ({ page }) => {
    const estado = await simularApi(page, { autenticado: true, papel });
    await page.goto('/index.html');
    await expect(page.locator('#usuario-perfil')).toHaveText(rotulo);
    await expect(page.getByRole('heading', { name: 'Aprovações', exact: true })).toHaveCount(papel === 'RESPONSAVEL' ? 1 : 0);
    await expect(page.getByRole('heading', { name: 'Gerenciar recursos', exact: true })).toHaveCount(papel === 'ADMINISTRADOR' ? 1 : 0);
    await expect(page.locator('#navegacao a[href^="/pages/"]')).toHaveCount(papel === 'SOLICITANTE' ? 2 : 4);
    await expect(page.locator('#navegacao [aria-disabled="true"]')).toHaveCount(0);
    for (const [titulo, rota, permitido] of [
      ['Aprovações', '/pages/aprovacoes.html', papel === 'RESPONSAVEL'],
      ['Gerenciar recursos', '/pages/gestao-recursos.html', papel === 'ADMINISTRADOR'],
      ['Movimentações', '/pages/movimentacoes.html', papel !== 'SOLICITANTE'],
    ]) {
      const link = page.locator('#navegacao').getByRole('link', { name: titulo, exact: true });
      await expect(link).toHaveCount(permitido ? 1 : 0);
      if (permitido) {
        await expect(link).toHaveAttribute('href', rota);
        expect((await page.request.get(rota)).status()).toBe(200);
      }
    }
    for (const rota of ['/pages/recursos.html', '/pages/reservas.html']) {
      expect((await page.request.get(rota)).status()).toBe(200);
    }
    expect(estado.inesperadas).toEqual([]);
  });
}

test('logout usa CSRF e confirma saída somente após 204', async ({ page }) => {
  const estado = await simularApi(page, { autenticado: true });
  await page.goto('/index.html');
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/login.html\?sessao=encerrada$/);
  await expect(page.locator('#feedback')).toHaveText('Você saiu da sua conta.');
  expect(estado.logouts).toHaveLength(1);
  expect(estado.logouts[0].headers['x-csrf-dinamico']).toBe('csrf-1');
  await page.goto('/index.html');
  await expect(page).toHaveURL(/\/login.html\?sessao=expirada$/);
});

test('falha no logout restaura botão e não afirma sessão encerrada', async ({ page }) => {
  const estado = await simularApi(page, {
    autenticado: true, falhaLogout: { status: 500, codigo: 'ERRO_INTERNO', mensagem: 'Não foi possível sair agora.' },
  });
  await page.goto('/index.html');
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page.locator('#feedback-painel')).toHaveText('Não foi possível sair agora.');
  await expect(page.locator('#referencia-painel')).toContainText('suporte-teste-123');
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeEnabled();
  await expect(page).toHaveURL(/\/index.html$/);
  expect(estado.logouts).toHaveLength(1);
});

test('envios simultâneos de logout executam uma escrita', async ({ page }) => {
  let liberar;
  const esperarLogout = new Promise((resolve) => { liberar = resolve; });
  const estado = await simularApi(page, { autenticado: true, esperarLogout });
  await page.goto('/index.html');
  await expect(page.locator('#painel')).toBeVisible();
  await page.locator('#form-logout').evaluate((form) => { form.requestSubmit(); form.requestSubmit(); });
  await expect.poll(() => estado.logouts.length).toBe(1);
  await expect(page.getByRole('button', { name: 'Saindo…' })).toBeDisabled();
  liberar();
  await expect(page).toHaveURL(/\/login.html\?sessao=encerrada$/);
  expect(estado.logouts).toHaveLength(1);
});

test('falha na leitura da sessão mantém painel oculto e permite nova leitura', async ({ page }) => {
  const estado = await simularApi(page, {
    autenticado: true, falhaMe: { status: 503, codigo: 'ERRO_INTERNO', mensagem: 'Acesso temporariamente indisponível.' },
  });
  await page.goto('/index.html');
  await expect(page.locator('#feedback-inicial')).toHaveText('Acesso temporariamente indisponível.');
  await expect(page.locator('#painel')).toBeHidden();
  estado.falhaMe = null;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.locator('#painel')).toBeVisible();
  expect(estado.meCount).toBe(2);
});

test('perfil não reconhecido não revela painel nem ações', async ({ page }) => {
  await simularApi(page, { autenticado: true, usuarioInvalido: true });
  await page.goto('/index.html');
  await expect(page.locator('#feedback-inicial')).toContainText('Não foi possível identificar sua conta');
  await expect(page.locator('#painel')).toBeHidden();
});

test('403 no login não repete envio; nova ação busca outro token', async ({ page }) => {
  const estado = await simularApi(page, {
    falhaLogin: { status: 403, codigo: 'OPERACAO_NAO_PERMITIDA', mensagem: 'Envio não permitido. Atualize sua tentativa.' },
  });
  await page.goto('/login.html');
  await preencherLogin(page);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('#feedback')).toContainText('Envio não permitido');
  expect(estado.logins).toHaveLength(1);
  estado.falhaLogin = null;
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/index.html$/);
  expect(estado.logins).toHaveLength(2);
  expect(estado.logins[1].headers['x-csrf-dinamico']).toBe('csrf-2');
});

test('login e entrada cabem na viewport sem rolagem horizontal', async ({ page }, testInfo) => {
  const estado = await simularApi(page, { papel: 'RESPONSAVEL' });
  await page.goto('/login.html');
  await preencherLogin(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('login.png'), fullPage: true });
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('#usuario-email')).toHaveText(estado.email);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('inicio.png'), fullPage: true });
});
