import { test as base, expect } from '@playwright/test';

// Somente evidência de cliente: API controlada, sem Spring/MySQL.
const test = base.extend({
  page: async ({ page }, use) => {
    const erros = [];
    const leiturasInventadas = [];
    page.on('pageerror', (erro) => erros.push(erro.message));
    page.on('request', (req) => {
      if (req.method() === 'GET' && /\/api\/reservas(?:[/?]|$)/.test(req.url())) leiturasInventadas.push(req.url());
    });
    await use(page);
    expect(erros).toEqual([]);
    expect(leiturasInventadas).toEqual([]);
  },
});
test.use({ timezoneId: 'Asia/Tokyo' });

const sala = { id: 101, dados: { tipo: 'SALA', codigo: 'SALA-01', ativo: true, restrito: false, capacidade: 20, localizacao: 'Bloco A' }, disponivel: true };
const docente = { id: 102, dados: { tipo: 'PROFESSOR', codigo: 'DOC-01', ativo: true, restrito: false, nome: 'Ana', competencias: ['java'] }, disponivel: true };
const material = { id: 103, dados: { tipo: 'MATERIAL', codigo: 'PROJ-01', ativo: true, restrito: true, patrimonio: 'PAT-01', descricao: 'Projetor', condicao: 'BOM' }, disponivel: true };
const ocupado = { ...sala, id: 104, dados: { ...sala.dados, codigo: 'SALA-02' }, disponivel: false };

async function preparar(page, opcoes = {}) {
  const estado = {
    consultas: [], escritas: [], csrfCount: 0, inesperadas: [],
    itens: [sala, docente, material, ocupado], autenticado: true,
    falhaPesquisa: null, falhaCriacao: null, falhaExpediente: null, rede: false,
    restrita: false, alteracaoResposta: {}, esperarPesquisa: null, esperarCriacao: null,
    paginar: false, janelas: [{ dia: 'TUESDAY', inicio: '07:00:00', fim: '22:00:00' }],
    ...opcoes,
  };
  const falhar = (route, erro) => route.fulfill({ status: erro.status,
    json: { codigo: erro.codigo, mensagem: erro.mensagem, correlationId: 'reserva-suporte-123' } });
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === '/api/auth/me') {
      if (!estado.autenticado) return falhar(route, { status: 401, codigo: 'NAO_AUTENTICADO', mensagem: 'Entre novamente.' });
      return route.fulfill({ json: { usuarioId: 7, email: 'marcos@exemplo.test', papel: 'SOLICITANTE' } });
    }
    if (url.pathname === '/api/auth/csrf') {
      estado.csrfCount++;
      return route.fulfill({ json: { token: 'csrf-' + estado.csrfCount, header: 'X-CSRF-DINAMICO' } });
    }
    if (url.pathname === '/api/horarios-funcionamento') {
      if (estado.falhaExpediente) return falhar(route, estado.falhaExpediente);
      return route.fulfill({ json: { zona: 'America/Sao_Paulo', janelas: estado.janelas } });
    }
    if (url.pathname === '/api/recursos' && req.method() === 'GET') {
      const params = Object.fromEntries(url.searchParams);
      estado.consultas.push(params);
      const itens = estado.paginar ? [Number(params.pagina) === 0 ? sala : docente] : estado.itens;
      if (estado.esperarPesquisa) await estado.esperarPesquisa;
      if (estado.falhaPesquisa) return falhar(route, estado.falhaPesquisa);
      return route.fulfill({ json: { itens, pagina: Number(params.pagina), tamanho: Number(params.tamanho), total: estado.paginar ? 21 : itens.length } });
    }
    if (url.pathname === '/api/reservas' && req.method() === 'POST') {
      const body = req.postDataJSON();
      estado.escritas.push({ body, headers: req.headers() });
      if (estado.esperarCriacao) await estado.esperarCriacao;
      if (estado.rede) return route.abort('failed');
      if (estado.falhaCriacao) return falhar(route, estado.falhaCriacao);
      return route.fulfill({ status: 201, json: { id: 1001, solicitanteId: 7, ...body,
        status: estado.restrita ? 'SOLICITADA' : 'APROVADA', restrita: estado.restrita, motivoDecisao: null, ...estado.alteracaoResposta } });
    }
    estado.inesperadas.push(req.method() + ' ' + url.pathname);
    return route.fulfill({ status: 404, json: { codigo: 'NAO_ENCONTRADO', mensagem: 'Rota não contratada.' } });
  });
  return estado;
}

async function periodo(page) {
  await expect(page.locator('#painel')).toBeVisible();
  await page.getByLabel('Início', { exact: true }).fill('2026-11-10T13:00');
  await page.getByLabel('Fim', { exact: true }).fill('2026-11-10T14:00');
}
async function pesquisar(page) {
  await page.getByRole('button', { name: 'Pesquisar recursos' }).click();
  await expect(page.locator('#feedback-pesquisa')).toBeHidden();
}
async function abrirReserva(page, opcoes) {
  const estado = await preparar(page, opcoes);
  await page.goto('/pages/reservas.html');
  await periodo(page);
  await pesquisar(page);
  return estado;
}

test('pesquisa combina filtros, mostra expediente real e codifica datas no fuso operacional', async ({ page }) => {
  const estado = await preparar(page);
  await page.goto('/pages/recursos.html');
  await expect(page.locator('.resource-card')).toHaveCount(4);
  await periodo(page);
  await page.getByLabel('Tipo de recurso').selectOption('SALA');
  await page.getByLabel('Capacidade mínima (salas)').fill('20');
  await page.getByLabel('Localização', { exact: true }).fill('A & B');
  await page.getByLabel('Competência (docentes)').fill('C++');
  await page.getByLabel('Patrimônio (materiais)').fill('PAT/01');
  await page.getByLabel('Disponibilidade', { exact: true }).selectOption('true');
  await pesquisar(page);
  expect(estado.consultas.at(-1)).toMatchObject({ tipo: 'SALA', capacidadeMinima: '20', localizacao: 'A & B', competencia: 'C++', patrimonio: 'PAT/01', disponivel: 'true', inicio: '2026-11-10T13:00:00-03:00', fim: '2026-11-10T14:00:00-03:00', pagina: '0', tamanho: '20' });
  await page.getByText('Horários de funcionamento', { exact: true }).click();
  await expect(page.locator('#expediente')).toContainText('Terça: 07:00–22:00');
  expect(estado.inesperadas).toEqual([]);
});

test('reserva comum seleciona sala e docente, envia DTO completo/CSRF e confirma resposta', async ({ page }) => {
  const estado = await abrirReserva(page);
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Selecionar Ana · DOC-01', exact: true }).check();
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page.locator('#confirmacao')).toBeVisible();
  await expect(page.locator('#detalhes-confirmacao')).toContainText('APROVADA');
  expect(estado.escritas).toHaveLength(1);
  expect(estado.escritas[0].body).toEqual({ inicio: '2026-11-10T13:00:00-03:00', fim: '2026-11-10T14:00:00-03:00', recursosIds: [101, 102] });
  expect(estado.escritas[0].headers['x-csrf-dinamico']).toBe('csrf-1');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await page.getByRole('button', { name: 'Fazer outra solicitação' }).click();
  await expect(page.getByRole('button', { name: 'Solicitar reserva', exact: true })).toBeDisabled();
  expect(estado.escritas).toHaveLength(1);
});

test('reserva restrita exibe SOLICITADA e espera sem inventar aprovação ou notificação', async ({ page }) => {
  await abrirReserva(page, { restrita: true });
  await page.getByRole('checkbox', { name: 'Selecionar Projetor · PAT-01' }).check();
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page.locator('#detalhes-confirmacao')).toContainText('SOLICITADA');
  await expect(page.locator('#orientacao-status')).toContainText('aguarda avaliação');
  await expect(page.locator('#confirmacao')).toBeFocused();
});

test('seleção atravessa páginas e nova pesquisa reinicia a página sem perder o mesmo período', async ({ page }) => {
  const estado = await abrirReserva(page, { paginar: true });
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.locator('#pagina-atual')).toHaveText('Página 2 de 2');
  await page.getByRole('checkbox', { name: 'Selecionar Ana · DOC-01' }).check();
  await expect(page.locator('#quantidade-selecionada')).toContainText('2 recurso(s)');
  await page.getByLabel('Localização', { exact: true }).fill('Bloco A');
  await pesquisar(page);
  expect(estado.consultas.at(-1).pagina).toBe('0');
  await expect(page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true })).toBeChecked();
  await expect(page.locator('#quantidade-selecionada')).toContainText('2 recurso(s)');
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page.locator('#confirmacao')).toBeVisible();
  expect(estado.escritas[0].body.recursosIds).toEqual([101, 102]);
});

test('alterar o período limpa seleção e resultados antes de permitir outra solicitação', async ({ page }) => {
  await abrirReserva(page);
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.getByLabel('Fim', { exact: true }).fill('2026-11-10T15:00');
  await expect(page.locator('#quantidade-selecionada')).toHaveText('Nenhum recurso selecionado');
  await expect(page.locator('#feedback-pesquisa')).toContainText('O período mudou');
  await expect(page.locator('.resource-card')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Solicitar reserva', exact: true })).toBeDisabled();
});

test('não oferece seleção de recurso indisponível ou inativo', async ({ page }) => {
  const inativo = { ...sala, id: 105, dados: { ...sala.dados, codigo: 'SALA-INATIVA', ativo: false } };
  await abrirReserva(page, { itens: [sala, ocupado, inativo] });
  await expect(page.getByRole('checkbox', { name: 'Selecionar SALA-02', exact: true })).toBeDisabled();
  await expect(page.getByRole('checkbox', { name: 'Selecionar SALA-INATIVA', exact: true })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.getByRole('button', { name: 'Remover SALA-01', exact: true }).click();
  await expect(page.locator('#quantidade-selecionada')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Solicitar reserva', exact: true })).toBeDisabled();
});

test('vazio e erro de consulta permitem corrigir e pesquisar novamente', async ({ page }) => {
  const estado = await abrirReserva(page, { itens: [] });
  await expect(page.locator('#resultados-resumo')).toContainText('Nenhum recurso encontrado');
  estado.falhaPesquisa = { status: 503, codigo: 'ERRO_INTERNO', mensagem: 'Consulta temporariamente indisponível.' };
  await page.getByRole('button', { name: 'Pesquisar recursos' }).click();
  await expect(page.locator('#feedback-pesquisa')).toContainText('Consulta temporariamente');
  await expect(page.locator('#referencia-pesquisa')).toContainText('reserva-suporte-123');
  estado.falhaPesquisa = null;
  estado.itens = [sala];
  await pesquisar(page);
  await expect(page.locator('.resource-card')).toHaveCount(1);
});

for (const status of [400, 403, 404, 409]) {
  test(`falha ${status} na criação preserva período/seleção e não repete POST`, async ({ page }) => {
    const mensagem = '<img src=x onerror=alert(1)> Operação recusada.';
    const estado = await abrirReserva(page, { falhaCriacao: { status, codigo: status === 409 ? 'FORA_DO_EXPEDIENTE' : 'REQUISICAO_INVALIDA', mensagem } });
    await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
    await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
    await expect(page.locator('#feedback-reserva')).toHaveText(mensagem);
    await expect(page.locator('#feedback-reserva img')).toHaveCount(0);
    await expect(page.locator('#referencia-reserva')).toContainText('reserva-suporte-123');
    await expect(page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true })).toBeChecked();
    await expect(page.getByLabel('Início', { exact: true })).toHaveValue('2026-11-10T13:00');
    await expect(page.getByRole('button', { name: 'Solicitar reserva', exact: true })).toBeEnabled();
    await expect(page.locator('#confirmacao')).toBeHidden();
    expect(estado.escritas).toHaveLength(1);
  });
}

test('submissões simultâneas mantêm uma escrita e carregamento até a confirmação', async ({ page }) => {
  let liberar;
  const esperarCriacao = new Promise((resolve) => { liberar = resolve; });
  const estado = await abrirReserva(page, { esperarCriacao });
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.locator('#form-reserva').evaluate((form) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByRole('button', { name: 'Solicitando…' })).toBeDisabled();
  await expect(page.locator('#form-reserva')).toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => estado.escritas.length).toBe(1);
  liberar();
  await expect(page.locator('#confirmacao')).toBeVisible();
  expect(estado.escritas).toHaveLength(1);
});

test('falha de rede não afirma sucesso e orienta conferir antes de reenviar', async ({ page }) => {
  const estado = await abrirReserva(page, { rede: true });
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page.locator('#feedback-reserva')).toContainText('confira o resultado antes de reenviar');
  await expect(page.locator('#confirmacao')).toBeHidden();
  await expect(page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true })).toBeChecked();
  expect(estado.escritas).toHaveLength(1);
});

test('resposta incoerente após POST não mostra sucesso nem repete a escrita', async ({ page }) => {
  const estado = await abrirReserva(page, { alteracaoResposta: { solicitanteId: 8 } });
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page.locator('#feedback-reserva')).toContainText('Não foi possível confirmar os dados');
  await expect(page.locator('#confirmacao')).toBeHidden();
  expect(estado.escritas).toHaveLength(1);
});

test('resposta atrasada é descartada se o período mudar durante a consulta', async ({ page }) => {
  let liberar;
  const esperarPesquisa = new Promise((resolve) => { liberar = resolve; });
  const estado = await preparar(page, { esperarPesquisa });
  await page.goto('/pages/reservas.html');
  await periodo(page);
  await page.getByRole('button', { name: 'Pesquisar recursos' }).click();
  await expect.poll(() => estado.consultas.length).toBe(1);
  await expect(page.locator('#feedback-pesquisa')).toHaveText('Pesquisando…');
  await page.getByLabel('Fim', { exact: true }).fill('2026-11-10T15:00');
  const resposta = page.waitForResponse((res) => res.url().includes('/api/recursos?'));
  liberar();
  await resposta;
  await expect(page.getByRole('button', { name: 'Pesquisar recursos' })).toBeEnabled();
  await expect(page.locator('.resource-card')).toHaveCount(0);
  await expect(page.locator('#resultados-resumo')).toContainText('Filtros alterados');
  estado.esperarPesquisa = null;
  await pesquisar(page);
  await expect(page.locator('.resource-card')).toHaveCount(4);
});

test('sessão ausente não consulta recursos e retorna ao login', async ({ page }) => {
  const estado = await preparar(page, { autenticado: false });
  await page.goto('/pages/reservas.html');
  await expect(page).toHaveURL(/login.html\?sessao=expirada$/);
  await expect(page.locator('#feedback')).toContainText('sessão está ausente ou expirou');
  expect(estado.consultas).toHaveLength(0);
  expect(estado.escritas).toHaveLength(0);
});

test('sessão expirada durante escrita segue fluxo central e não repete POST', async ({ page }) => {
  const estado = await abrirReserva(page);
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  estado.autenticado = false;
  estado.falhaCriacao = { status: 401, codigo: 'NAO_AUTENTICADO', mensagem: 'Sessão expirada.' };
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page).toHaveURL(/login.html\?sessao=expirada$/);
  expect(estado.escritas).toHaveLength(1);
});

test('período inválido não dispara consultas', async ({ page }) => {
  const estado = await preparar(page);
  await page.goto('/pages/reservas.html');
  await periodo(page);
  await page.getByLabel('Fim', { exact: true }).fill('2026-11-10T12:00');
  await page.getByRole('button', { name: 'Pesquisar recursos' }).click();
  await expect(page.locator('#feedback-pesquisa')).toContainText('posterior');
  expect(estado.consultas).toHaveLength(0);
  await page.getByLabel('Fim', { exact: true }).fill('2026-11-11T14:00');
  await page.getByRole('button', { name: 'Pesquisar recursos' }).click();
  await expect(page.locator('#feedback-pesquisa')).toContainText('mesmo dia');
  expect(estado.consultas).toHaveLength(0);
});

test('disponibilidade sem período é recusada e limpar filtros restaura a consulta geral', async ({ page }) => {
  const estado = await preparar(page);
  await page.goto('/pages/recursos.html');
  await expect(page.locator('.resource-card')).toHaveCount(4);
  await page.getByLabel('Disponibilidade', { exact: true }).selectOption('false');
  await page.getByRole('button', { name: 'Pesquisar recursos' }).click();
  await expect(page.locator('#feedback-pesquisa')).toContainText('disponibilidade exige');
  expect(estado.consultas).toHaveLength(1);
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await pesquisar(page);
  expect(estado.consultas.at(-1)).toEqual({ pagina: '0', tamanho: '20' });
});

test('atualizar a pesquisa remove seleção que ficou indisponível', async ({ page }) => {
  const estado = await abrirReserva(page);
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  estado.itens = [{ ...sala, disponivel: false }];
  await page.getByRole('button', { name: 'Pesquisar recursos' }).click();
  await expect(page.locator('#feedback-pesquisa')).toContainText('ficou indisponível');
  await expect(page.locator('#quantidade-selecionada')).toHaveText('Nenhum recurso selecionado');
  await expect(page.getByRole('button', { name: 'Solicitar reserva', exact: true })).toBeDisabled();
});

test('expediente vazio não inventa horários e falha de leitura não impede consulta', async ({ page }) => {
  const estado = await preparar(page, { janelas: [] });
  await page.goto('/pages/recursos.html');
  await page.getByText('Horários de funcionamento', { exact: true }).click();
  await expect(page.locator('#expediente')).toContainText('Não há horários');
  estado.falhaExpediente = { status: 503, codigo: 'ERRO_INTERNO', mensagem: 'Funcionamento indisponível.' };
  await page.reload();
  await page.getByText('Horários de funcionamento', { exact: true }).click();
  await expect(page.locator('#expediente')).toHaveText('Funcionamento indisponível.');
  await expect(page.locator('.resource-card')).toHaveCount(4);
});

test('teclado, texto seguro e layout cabem em móvel/desktop com confirmação acessível', async ({ page }, testInfo) => {
  const malicioso = { ...sala, dados: { ...sala.dados, codigo: '<img src=x onerror=alert(1)>' } };
  await abrirReserva(page, { itens: [malicioso] });
  const checkbox = page.getByRole('checkbox', { name: 'Selecionar <img src=x onerror=alert(1)>', exact: true });
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  await expect(page.locator('.resource-card img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('pesquisa.png'), fullPage: true });
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page.locator('#confirmacao')).toBeFocused();
  await expect(page.locator('#confirmacao img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('confirmacao.png'), fullPage: true });
});

test('capturas de pesquisa e confirmação com recursos de teste identificados', async ({ page }, testInfo) => {
  await abrirReserva(page);
  await page.getByRole('checkbox', { name: 'Selecionar SALA-01', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Selecionar Ana · DOC-01', exact: true }).check();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('pesquisa-recursos.png'), fullPage: true });
  await page.getByRole('button', { name: 'Solicitar reserva', exact: true }).click();
  await expect(page.locator('#confirmacao')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('reserva-confirmada.png'), fullPage: true });
});
