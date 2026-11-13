import { test as base, expect } from '@playwright/test';

// Toda API desta suíte é interceptada. Não comprova endpoint/agregador/escopo RF12 reais.
const test = base.extend({
  page: async ({ page }, use) => {
    const erros = []; page.on('pageerror', e => erros.push(e.message));
    await use(page); expect(erros).toEqual([]);
  },
  ambiente: async ({ page }, use) => {
    const estado = await preparar(page); await use(estado); expect(estado.inesperadas).toEqual([]);
  },
});
test.use({ timezoneId: 'Asia/Tokyo' });
const rota = '/pages/relatorios-utilizacao.html';
const relatorio = (url) => ({
  inicio: url.searchParams.get('inicio'), fim: url.searchParams.get('fim'),
  recursoId: url.searchParams.has('recursoId') ? Number(url.searchParams.get('recursoId')) : null,
  estados: ['APROVADA', 'EM_USO', 'CONCLUIDA'], reservasConsideradas: 1, minutosReservados: 60,
  porRecurso: [1, 2, 3].map(recursoId => ({ recursoId, minutos: 60 })),
  porStatus: [{ status: 'APROVADA', minutos: 60 }], conflitosEvitados: [],
});
const conflito = (id = 1) => ({ id, recursoId: 2, origem: 'MANUTENCAO', momento: '2026-11-17T10:30:00-03:00',
  intervaloInicio: '2026-12-01T10:00:00-03:00', intervaloFim: '2026-12-01T11:00:00-03:00' });
async function preparar(page) {
  const estado = { autenticado: true, papel: 'ADMINISTRADOR', falha: 0, rede: false,
    gerar: relatorio, esperar: null, consultas: [], csrf: 0, logouts: 0, inesperadas: [] };
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url());
    const falhar = status => route.fulfill({ status, json: {
      codigo: status === 401 ? 'NAO_AUTENTICADO' : 'ERRO_CONTROLADO',
      mensagem: '<b>Confira o acesso ao relatório.</b>', correlationId: 'relatorio-suporte-1',
    } });
    if (url.pathname === '/api/auth/me') return estado.autenticado
      ? route.fulfill({ json: { usuarioId: 7, email: 'teste@example.test', papel: estado.papel } }) : falhar(401);
    if (url.pathname === '/api/auth/csrf') {
      estado.csrf++; return route.fulfill({ json: { header: 'X-CSRF-TESTE', token: 'token-teste' } });
    }
    if (url.pathname === '/api/auth/logout' && req.method() === 'POST') {
      estado.logouts++; expect(req.headers()['x-csrf-teste']).toBe('token-teste');
      return route.fulfill({ status: 204 });
    }
    if (url.pathname === '/api/relatorios/utilizacao' && req.method() === 'GET') {
      estado.consultas.push({ url, headers: req.headers() });
      // Cada resposta conserva o cenário da requisição antes de qualquer atraso.
      const falha = estado.falha, rede = estado.rede, resposta = estado.gerar(url), esperar = estado.esperar;
      if (esperar) await esperar;
      if (rede) return route.abort('failed');
      if (falha) return falhar(falha);
      return route.fulfill({ json: resposta });
    }
    estado.inesperadas.push(req.method() + ' ' + url.pathname); return falhar(404);
  });
  return estado;
}
async function abrir(page) {
  await page.goto(rota); await expect(page.locator('#form-relatorio button[type="submit"]')).toBeEnabled();
}
async function filtros(page, recurso = '') {
  await page.getByLabel('Início do período', { exact: true }).fill('2026-11-17T10:00');
  await page.getByLabel('Fim do período', { exact: true }).fill('2026-11-17T11:00');
  await page.getByLabel('ID do recurso (opcional)', { exact: true }).fill(recurso);
}
const consultar = page => page.getByRole('button', { name: 'Consultar relatório', exact: true }).click();

test('prévia identificada inicia sem dados, consulta automática ou link no menu', async ({ page, ambiente }) => {
  await abrir(page); await expect(page.getByText('Prévia — integração pendente.', { exact: true })).toBeVisible();
  await expect(page.locator('#resultado-relatorio')).toBeHidden();
  expect(ambiente.consultas).toHaveLength(0); expect(ambiente.csrf).toBe(0);
  await expect(page.locator('#navegacao a[href*="relatorios"]')).toHaveCount(0);
});
test('consulta com offset deSP mesmo em navegador deTóquio, sem identidade nem CSRF', async ({ page, ambiente }) => {
  await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#resultado-relatorio')).toBeVisible();
  expect(Object.fromEntries(ambiente.consultas[0].url.searchParams)).toEqual({
    inicio: '2026-11-17T10:00:00-03:00', fim: '2026-11-17T11:00:00-03:00',
  });
  expect(ambiente.csrf).toBe(0); expect(ambiente.consultas[0].headers['x-csrf-teste']).toBeUndefined();
  await expect(page.locator('#periodo-relatorio')).toContainText('2026-11-17T10:00:00-03:00');
});
test('DTO39 mantém total60min de uma reserva distinto das três alocações de60min', async ({ page, ambiente }) => {
  await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#duracao-reservas-relatorio')).toHaveText('60 min');
  await expect(page.locator('#total-reservas-relatorio')).toHaveText('1');
  await expect(page.locator('#linhas-utilizacao tr')).toHaveCount(3);
  await expect(page.locator('#linhas-utilizacao td')).toHaveText(['60 min', '60 min', '60 min']);
  await expect(page.locator('#conflitos-relatorio')).toHaveText('0');
  expect(ambiente.consultas).toHaveLength(1);
});
test('período multidia e recurso opcional enviam somente filtros candidatos', async ({ page, ambiente }) => {
  await abrir(page); await filtros(page, '2');
  await page.getByLabel('Fim do período', { exact: true }).fill('2026-11-19T11:00'); await consultar(page);
  await expect(page.locator('#linhas-utilizacao tr')).toHaveCount(3);
  await expect(page.locator('#linhas-utilizacao')).toContainText('Recurso 2');
  await expect(page.locator('#linhas-utilizacao')).toContainText('Recurso 1');
  await expect(page.locator('#filtro-recurso-relatorio')).toContainText('outros recursos vinculados');
  expect(Object.fromEntries(ambiente.consultas[0].url.searchParams)).toEqual({
    inicio: '2026-11-17T10:00:00-03:00', fim: '2026-11-19T11:00:00-03:00', recursoId: '2',
  });
});
test('fim igual/invertido é recusado antes doHTTP e filtros permanecem', async ({ page, ambiente }) => {
  await abrir(page); await filtros(page);
  for (const fim of ['2026-11-17T10:00', '2026-11-17T09:00']) {
    await page.getByLabel('Fim do período', { exact: true }).fill(fim); await consultar(page);
    await expect(page.locator('#feedback-relatorio')).toContainText('O fim deve ser posterior');
    await expect(page.locator('#feedback-relatorio')).toBeFocused();
  }
  expect(ambiente.consultas).toHaveLength(0);
  await expect(page.getByLabel('Início do período', { exact: true })).toHaveValue('2026-11-17T10:00');
});
test('campos obrigatórios e recurso fracionário inválido não enviam requisição', async ({ page, ambiente }) => {
  await abrir(page); await consultar(page); expect(ambiente.consultas).toHaveLength(0);
  await filtros(page, '1.5'); await consultar(page); expect(ambiente.consultas).toHaveLength(0);
  await expect(page.locator('#resultado-relatorio')).toBeHidden();
});
test('loading impede duplo submit até uma única resposta, depois restaura controles', async ({ page, ambiente }) => {
  let liberar; ambiente.esperar = new Promise(r => { liberar = r; });
  await abrir(page); await filtros(page); await consultar(page);
  await expect.poll(() => ambiente.consultas.length).toBe(1);
  await expect(page.locator('#feedback-relatorio')).toHaveText('Consultando relatório…');
  await expect(page.getByRole('button', { name: 'Consultar relatório', exact: true })).toBeDisabled();
  await page.locator('#form-relatorio').dispatchEvent('submit'); expect(ambiente.consultas).toHaveLength(1);
  liberar(); await expect(page.locator('#resultado-relatorio')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Consultar relatório', exact: true })).toBeEnabled();
  await expect(page.locator('#form-relatorio')).not.toHaveAttribute('aria-busy');
});
test('alterar filtro durante consulta descarta resposta anterior e exige nova consulta explícita', async ({ page, ambiente }) => {
  let liberar; ambiente.esperar = new Promise(r => { liberar = r; });
  await abrir(page); await filtros(page); await consultar(page);
  await expect.poll(() => ambiente.consultas.length).toBe(1);
  await page.getByLabel('ID do recurso (opcional)', { exact: true }).fill('2'); liberar();
  await expect(page.getByRole('button', { name: 'Consultar relatório', exact: true })).toBeEnabled();
  await expect(page.locator('#resultado-relatorio')).toBeHidden();
  await expect(page.locator('#feedback-relatorio')).toContainText('Filtros alterados');
  ambiente.esperar = null; await consultar(page); await expect(page.locator('#linhas-utilizacao tr')).toHaveCount(3);
  expect(ambiente.consultas).toHaveLength(2);
});
test('erro atrasado não toma foco ou substitui a mensagem de filtro alterado', async ({ page, ambiente }) => {
  let liberar; ambiente.esperar = new Promise(r => { liberar = r; }); ambiente.falha = 503;
  await abrir(page); await filtros(page); await consultar(page);
  await expect.poll(() => ambiente.consultas.length).toBe(1);
  await page.getByLabel('ID do recurso (opcional)', { exact: true }).fill('2'); liberar();
  await expect(page.getByRole('button', { name: 'Consultar relatório', exact: true })).toBeEnabled();
  await expect(page.locator('#feedback-relatorio')).toContainText('Filtros alterados');
  await expect(page.locator('#referencia-relatorio')).toBeHidden();
});
test('editar e limpar filtros removem os números antigos sem nova consulta automática', async ({ page, ambiente }) => {
  await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#resultado-relatorio')).toBeVisible();
  await page.getByLabel('ID do recurso (opcional)', { exact: true }).fill('2');
  await expect(page.locator('#resultado-relatorio')).toBeHidden();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page.getByLabel('Início do período', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Fim do período', { exact: true })).toHaveValue('');
  expect(ambiente.consultas).toHaveLength(1);
});
for (const conflitos of [0, 2]) test('reservas0 e conflitos' + conflitos + ' exibem zeros e ausência de alocações corretamente', async ({ page, ambiente }) => {
  ambiente.gerar = url => ({ ...relatorio(url), reservasConsideradas: 0, minutosReservados: 0,
    porRecurso: [], porStatus: [], conflitosEvitados: Array.from({ length: conflitos }, (_, i) => conflito(i + 1)) });
  await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#total-reservas-relatorio')).toHaveText('0');
  await expect(page.locator('#duracao-reservas-relatorio')).toHaveText('0 min');
  await expect(page.locator('#conflitos-relatorio')).toHaveText(String(conflitos));
  await expect(page.locator('#sem-alocacoes')).toContainText('Nenhuma reserva nos estados considerados');
  await expect(page.locator('#tabela-utilizacao')).toBeHidden();
});
test('duração acima de24h permanece em minutos sem virar horário de relógio', async ({ page, ambiente }) => {
  ambiente.gerar = url => ({ ...relatorio(url), minutosReservados: 1620,
    porRecurso: [{ recursoId: 1, minutos: 1620 }], porStatus: [{ status: 'APROVADA', minutos: 1620 }] });
  await abrir(page); await filtros(page); await page.getByLabel('Fim do período', { exact: true }).fill('2026-11-19T11:00');
  await consultar(page); await expect(page.locator('#duracao-reservas-relatorio')).toHaveText('1620 min');
  await expect(page.locator('#linhas-utilizacao td')).toHaveText('1620 min');
});
for (const tipo of ['periodo', 'recurso', 'duplicado', 'duracao', 'total']) test('resposta incoerente: ' + tipo + ' não vira relatório ou vazio', async ({ page, ambiente }) => {
  ambiente.gerar = url => {
    const r = relatorio(url);
    if (tipo === 'periodo') r.fim = r.inicio;
    if (tipo === 'recurso') r.recursoId = 999;
    if (tipo === 'duplicado') r.porRecurso.push(r.porRecurso[0]);
    if (tipo === 'duracao') r.minutosReservados = '<img src=x onerror=alert(1)>';
    if (tipo === 'total') r.minutosReservados = 120;
    return r;
  };
  await abrir(page); await filtros(page, tipo === 'recurso' ? '2' : ''); await consultar(page);
  await expect(page.locator('#feedback-relatorio')).toContainText('O relatório recebido não corresponde');
  await expect(page.locator('#resultado-relatorio')).toBeHidden();
  expect(ambiente.consultas).toHaveLength(1); await expect(page.locator('#feedback-relatorio img')).toHaveCount(0);
});
for (const status of [400, 403, 404, 409, 503]) test('erroHTTP ' + status + ' preserva filtros, mostra texto seguro e referência, permite retry explícito', async ({ page, ambiente }) => {
  ambiente.falha = status; await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#feedback-relatorio')).toHaveText('<b>Confira o acesso ao relatório.</b>');
  await expect(page.locator('#feedback-relatorio b')).toHaveCount(0);
  await expect(page.locator('#referencia-relatorio')).toHaveText('Referência de suporte: relatorio-suporte-1');
  await expect(page.locator('#feedback-relatorio')).toBeFocused();
  await expect(page.locator('#resultado-relatorio')).toBeHidden(); expect(ambiente.consultas).toHaveLength(1);
  await expect(page.getByLabel('Início do período', { exact: true })).toHaveValue('2026-11-17T10:00');
  ambiente.falha = 0; await consultar(page); await expect(page.locator('#resultado-relatorio')).toBeVisible();
  await expect(page.locator('#referencia-relatorio')).toBeHidden(); expect(ambiente.consultas).toHaveLength(2);
});
test('falha de rede não apresenta resultado vazio ou repete requisição', async ({ page, ambiente }) => {
  ambiente.rede = true; await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#feedback-relatorio')).toContainText('Verifique sua conexão');
  await expect(page.locator('#resultado-relatorio')).toBeHidden(); expect(ambiente.consultas).toHaveLength(1);
});
test('sem sessão vai ao login antes de qualquer relatório', async ({ page, ambiente }) => {
  ambiente.autenticado = false; await page.goto(rota);
  await expect(page).toHaveURL(/login.html\?sessao=expirada$/); expect(ambiente.consultas).toHaveLength(0);
});
test('sessão expirada na consulta redireciona sem dados ou retry', async ({ page, ambiente }) => {
  ambiente.falha = 401; await abrir(page); await filtros(page); await consultar(page);
  await expect(page).toHaveURL(/login.html\?sessao=expirada$/); expect(ambiente.consultas).toHaveLength(1);
});
test('sair reutiliza logout e CSRF compartilhados', async ({ page, ambiente }) => {
  await abrir(page); await page.getByRole('button', { name: 'Sair da conta', exact: true }).click();
  await expect(page).toHaveURL(/login.html\?sessao=encerrada$/); expect(ambiente.logouts).toBe(1); expect(ambiente.csrf).toBe(1);
});
test('consulta por teclado foca resultado e não ultrapassa o viewport', async ({ page, ambiente }) => {
  await abrir(page); await filtros(page);
  const botao = page.getByRole('button', { name: 'Consultar relatório', exact: true });
  await botao.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#resultado-relatorio')).toBeFocused();
  await expect(page.getByRole('table', { name: 'Alocação por recurso no período consultado' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(ambiente.consultas).toHaveLength(1);
});
for (const papel of ['SOLICITANTE', 'RESPONSAVEL']) test(papel + ' pela URL direta não consulta relatório', async ({ page, ambiente }) => {
  ambiente.papel = papel; await page.goto(rota);
  await expect(page.locator('#feedback-inicial')).toContainText('disponíveis para Administradores');
  await expect(page.locator('#painel')).toBeHidden();
  await expect(page.locator('#form-relatorio button[type="submit"]')).toBeDisabled();
  await page.locator('#form-relatorio').dispatchEvent('submit');
  expect(ambiente.consultas).toHaveLength(0); expect(ambiente.csrf).toBe(0);
});
test('reserva inferior a um minuto mostra0min sem virar ausência de reservas', async ({ page, ambiente }) => {
  ambiente.gerar = url => ({ ...relatorio(url), minutosReservados: 0,
    porRecurso: [{ recursoId: 1, minutos: 0 }], porStatus: [{ status: 'APROVADA', minutos: 0 }] });
  await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#total-reservas-relatorio')).toHaveText('1');
  await expect(page.locator('#duracao-reservas-relatorio')).toHaveText('0 min');
  await expect(page.locator('#linhas-utilizacao td')).toHaveText('0 min');
  await expect(page.locator('#sem-alocacoes')).toBeHidden();
  await expect(page.getByText(/Frações de minuto são descartadas/)).toBeVisible();
});
test('total truncado1min com grupos0min é exibido sem recalcular ou rejeitar o DTO', async ({ page, ambiente }) => {
  ambiente.gerar = url => ({ ...relatorio(url), reservasConsideradas: 2, minutosReservados: 1,
    porRecurso: [{ recursoId: 1, minutos: 0 }, { recursoId: 2, minutos: 0 }],
    porStatus: [{ status: 'APROVADA', minutos: 0 }, { status: 'CONCLUIDA', minutos: 0 }] });
  await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#duracao-reservas-relatorio')).toHaveText('1 min');
  await expect(page.locator('#linhas-utilizacao td')).toHaveText(['0 min', '0 min']);
});
for (const tipo of ['fim', 'duplicado']) test('lista de conflitos incoerente: ' + tipo + ' não infla a contagem', async ({ page, ambiente }) => {
  ambiente.gerar = url => ({ ...relatorio(url), conflitosEvitados: tipo === 'fim'
    ? [{ ...conflito(), momento: url.searchParams.get('fim') }] : [conflito(), conflito()] });
  await abrir(page); await filtros(page); await consultar(page);
  await expect(page.locator('#feedback-relatorio')).toContainText('O relatório recebido não corresponde');
  await expect(page.locator('#resultado-relatorio')).toBeHidden();
});
