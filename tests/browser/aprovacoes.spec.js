import { test as base, expect } from '@playwright/test';

// Contrato de fila controlado no teste; não comprova GET/autorização do backend.
const test = base.extend({
  page: async ({ page }, use) => {
    const erros = [];
    const detalhesInventados = [];
    page.on('pageerror', (erro) => erros.push(erro.message));
    page.on('request', (r) => { if (r.method() === 'GET' && /\/api\/reservas\/\d+/.test(r.url())) detalhesInventados.push(r.url()); });
    await use(page);
    expect(erros).toEqual([]);
    expect(detalhesInventados).toEqual([]);
  },
});
test.use({ timezoneId: 'Asia/Tokyo' });

const pendente = { id: 1001, solicitanteId: 7, status: 'SOLICITADA', restrita: true,
  inicio: '2026-11-10T13:00:00-03:00', fim: '2026-11-10T14:00:00-03:00', recursosIds: [101, 103], motivoDecisao: null,
  solicitante: { usuarioId: 7, identificacao: 'Solicitante 7' },
  recursos: [{ id: 101, tipo: 'SALA', identificacao: 'Sala A' }, { id: 103, tipo: 'MATERIAL', identificacao: 'Projetor PROJ-01', patrimonio: 'PAT-01' }] };
const segunda = { ...pendente, id: 1002, solicitanteId: 8, solicitante: { usuarioId: 8, identificacao: 'Solicitante 8' } };

async function preparar(page, opcoes = {}) {
  const estado = { papel: 'RESPONSAVEL', autenticado: true, consultas: [], escritas: [], csrfCount: 0,
    itens: [pendente, segunda], confirmadas: 0, decididas: [], paginar: false,
    falhaFila: null, falhaDecisao: null, falhaAposDecisao: null, rede: false, alteracaoResposta: {},
    esperarFila: null, esperarDecisao: null, inesperadas: [], ...opcoes };
  const falhar = (route, erro) => route.fulfill({ status: erro.status,
    json: { codigo: erro.codigo, mensagem: erro.mensagem, correlationId: 'fila-suporte-123' } });
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname === '/api/auth/me') {
      if (!estado.autenticado) return falhar(route, { status: 401, codigo: 'NAO_AUTENTICADO', mensagem: 'Entre novamente.' });
      return route.fulfill({ json: { usuarioId: 9, email: 'responsavel@exemplo.test', papel: estado.papel } });
    }
    if (url.pathname === '/api/auth/csrf') {
      estado.csrfCount++;
      return route.fulfill({ json: { token: 'csrf-' + estado.csrfCount, header: 'X-CSRF-DINAMICO' } });
    }
    if (url.pathname === '/api/reservas' && req.method() === 'GET') {
      const params = Object.fromEntries(url.searchParams);
      estado.consultas.push(params);
      if (estado.esperarFila) await estado.esperarFila;
      if (estado.falhaFila) return falhar(route, estado.falhaFila);
      if (estado.confirmadas && estado.falhaAposDecisao) return falhar(route, estado.falhaAposDecisao);
      const pagina = Number(params.pagina);
      let itens = estado.itens.filter((r) => !estado.decididas.includes(r.id));
      let total = itens.length;
      if (estado.paginar) {
        itens = [pagina === 0 ? pendente : segunda].filter((r) => !estado.decididas.includes(r.id));
        total = estado.decididas.includes(1002) ? 20 : 21;
      }
      return route.fulfill({ json: { itens, pagina, tamanho: Number(params.tamanho), total } });
    }
    const decisao = url.pathname.match(/^\/api\/reservas\/(\d+)\/(aprovacao|rejeicao)$/);
    if (decisao && req.method() === 'POST') {
      const id = Number(decisao[1]);
      const body = req.postData() ? req.postDataJSON() : null;
      estado.escritas.push({ id, acao: decisao[2], body, headers: req.headers() });
      if (estado.esperarDecisao) await estado.esperarDecisao;
      if (estado.rede) return route.abort('failed');
      if (estado.falhaDecisao) return falhar(route, estado.falhaDecisao);
      const item = id === 1001 ? pendente : segunda;
      estado.confirmadas++;
      estado.decididas.push(id);
      return route.fulfill({ json: { id, solicitanteId: item.solicitanteId, restrita: true,
        inicio: item.inicio, fim: item.fim, recursosIds: item.recursosIds,
        status: decisao[2] === 'aprovacao' ? 'APROVADA' : 'REJEITADA', motivoDecisao: body?.motivo ?? null,
        ...estado.alteracaoResposta } });
    }
    estado.inesperadas.push(req.method() + ' ' + url.pathname);
    return route.fulfill({ status: 404, json: { codigo: 'NAO_ENCONTRADO', mensagem: 'Rota não especificada.' } });
  });
  return estado;
}

async function abrir(page, opcoes) {
  const estado = await preparar(page, opcoes);
  await page.goto('/pages/aprovacoes.html');
  await expect(page.locator('#painel')).toBeVisible();
  await expect(page.locator('#feedback-fila')).toBeHidden();
  return estado;
}
async function avaliar(page, id = 1001) {
  await page.getByRole('button', { name: 'Avaliar reserva ' + id, exact: true }).click();
  await expect(page.locator('#detalhes-pendente')).toBeVisible();
}

test('Responsável consulta somente pendentes e vê detalhes legíveis no fuso operacional', async ({ page }) => {
  const estado = await abrir(page);
  expect(estado.consultas).toEqual([{ status: 'SOLICITADA', pagina: '0', tamanho: '20' }]);
  await expect(page.locator('#navegacao a[aria-current="page"]')).toHaveText('Aprovações');
  await avaliar(page);
  await expect(page.locator('#dados-pendente')).toContainText('Solicitante 7');
  await expect(page.locator('#dados-pendente')).toContainText('13:00');
  await expect(page.locator('#recursos-pendente')).toContainText('PAT-01');
  await expect(page.locator('#detalhes-pendente')).toBeFocused();
  expect(estado.inesperadas).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

for (const papel of ['SOLICITANTE', 'ADMINISTRADOR']) {
  test(`${papel} na URL direta não consulta fila nem recebe ações`, async ({ page }) => {
    const estado = await preparar(page, { papel });
    await page.goto('/pages/aprovacoes.html');
    await expect(page.locator('#acesso-negado')).toBeVisible();
    await expect(page.locator('#area-aprovacoes')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Confirmar aprovação' })).toHaveCount(0);
    await expect(page.locator('#navegacao a[href="/pages/aprovacoes.html"]')).toHaveCount(0);
    expect(estado.consultas).toHaveLength(0);
    expect(estado.escritas).toHaveLength(0);
  });
}

test('aprovação confirma resposta, envia CSRF sem corpo e atualiza fila', async ({ page }) => {
  const estado = await abrir(page);
  await avaliar(page);
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toHaveText('Decisão confirmada: reserva #1001 APROVADA.');
  await expect(page.getByRole('button', { name: 'Avaliar reserva 1001', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Avaliar reserva 1002', exact: true })).toBeVisible();
  await expect(page.locator('#detalhes-pendente')).toBeHidden();
  expect(estado.escritas).toHaveLength(1);
  expect(estado.escritas[0]).toMatchObject({ acao: 'aprovacao', body: null, headers: { 'x-csrf-dinamico': 'csrf-1' } });
  expect(estado.consultas).toHaveLength(2);
});

test('rejeição exige motivo e envia apenas a justificativa aparada', async ({ page }) => {
  const estado = await abrir(page);
  await avaliar(page);
  await page.getByRole('radio', { name: 'Rejeitar', exact: true }).check();
  await expect(page.getByLabel('Motivo da rejeição', { exact: true })).toHaveAttribute('required', '');
  await page.getByLabel('Motivo da rejeição', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Confirmar rejeição' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('Informe o motivo');
  expect(estado.escritas).toHaveLength(0);
  await page.getByLabel('Motivo da rejeição', { exact: true }).fill('  Uso prioritário.  ');
  await page.getByRole('button', { name: 'Confirmar rejeição' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('REJEITADA');
  expect(estado.escritas[0].body).toEqual({ motivo: 'Uso prioritário.' });
});

test('submits simultâneos produzem um POST e bloqueiam troca/filtros até confirmar', async ({ page }) => {
  let liberar;
  const esperarDecisao = new Promise((resolve) => { liberar = resolve; });
  const estado = await abrir(page, { esperarDecisao });
  await avaliar(page);
  await page.locator('#form-decisao').evaluate((form) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByRole('button', { name: 'Registrando decisão…' })).toBeDisabled();
  await expect(page.locator('#form-decisao')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByLabel('Início do período')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Avaliar reserva 1002' })).toBeDisabled();
  await expect.poll(() => estado.escritas.length).toBe(1);
  liberar();
  await expect(page.locator('#feedback-decisao')).toContainText('Decisão confirmada');
  expect(estado.escritas).toHaveLength(1);
});

test('GET falhando após POST confirmado preserva sucesso e permite só atualizar a fila', async ({ page }) => {
  const estado = await abrir(page, { falhaAposDecisao: { status: 503, codigo: 'ERRO_INTERNO', mensagem: 'Consulta temporariamente indisponível.' } });
  await avaliar(page);
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('Decisão confirmada');
  await expect(page.locator('#feedback-fila')).toContainText('Consulta temporariamente');
  await expect(page.locator('#resumo-fila')).toContainText('A decisão foi confirmada');
  await expect(page.locator('#detalhes-pendente')).toBeHidden();
  await expect(page.locator('.pending-card')).toHaveCount(0);
  estado.falhaAposDecisao = null;
  await page.getByRole('button', { name: 'Atualizar fila', exact: true }).click();
  await expect(page.locator('.pending-card')).toHaveCount(1);
  expect(estado.escritas).toHaveLength(1);
});

test('decisão no último item de uma página retorna à página anterior com GETs', async ({ page }) => {
  const estado = await abrir(page, { paginar: true });
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.locator('#pagina-fila')).toHaveText('Página 2 de 2');
  await avaliar(page, 1002);
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#pagina-fila')).toHaveText('Página 1 de 1');
  await expect(page.getByRole('button', { name: 'Avaliar reserva 1001' })).toBeVisible();
  expect(estado.consultas.map((c) => c.pagina)).toEqual(['0', '1', '1', '0']);
  expect(estado.escritas).toHaveLength(1);
});

test('filtros aceitam vários dias, codificam recurso e reiniciam paginação', async ({ page }) => {
  const estado = await abrir(page, { paginar: true });
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.locator('#pagina-fila')).toContainText('Página 2');
  await avaliar(page, 1002);
  await page.getByLabel('Início do período').fill('2026-11-10T13:00');
  await expect(page.locator('#detalhes-pendente')).toBeHidden();
  await page.getByLabel('Fim do período').fill('2026-11-13T14:00');
  await page.getByLabel('ID do recurso (opcional)').fill('103');
  await page.getByLabel('Resultados por página').selectOption('50');
  await page.getByRole('button', { name: 'Consultar fila', exact: true }).click();
  await expect(page.locator('#feedback-fila')).toBeHidden();
  expect(estado.consultas.at(-1)).toEqual({ status: 'SOLICITADA', pagina: '0', tamanho: '50', inicio: '2026-11-10T13:00:00-03:00', fim: '2026-11-13T14:00:00-03:00', recursoId: '103' });
});

test('filtros inválidos não consultam e limpar filtros restaura a consulta padrão', async ({ page }) => {
  const estado = await abrir(page);
  await page.getByLabel('Início do período').fill('2026-11-10T13:00');
  await page.getByRole('button', { name: 'Consultar fila', exact: true }).click();
  await expect(page.locator('#feedback-fila')).toContainText('juntos');
  expect(estado.consultas).toHaveLength(1);
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await page.getByRole('button', { name: 'Consultar fila', exact: true }).click();
  await expect(page.locator('#feedback-fila')).toBeHidden();
  expect(estado.consultas.at(-1)).toEqual({ status: 'SOLICITADA', pagina: '0', tamanho: '20' });
});

test('resposta atrasada não revela a fila após alteração de filtros', async ({ page }) => {
  let liberar;
  const esperarFila = new Promise((resolve) => { liberar = resolve; });
  const estado = await preparar(page, { esperarFila });
  await page.goto('/pages/aprovacoes.html');
  await expect.poll(() => estado.consultas.length).toBe(1);
  await expect(page.locator('#feedback-fila')).toContainText('Consultando');
  await page.getByLabel('ID do recurso (opcional)').fill('103');
  const resposta = page.waitForResponse((res) => res.url().includes('/api/reservas?'));
  liberar();
  await resposta;
  await expect(page.getByRole('button', { name: 'Atualizar fila', exact: true })).toBeEnabled();
  await expect(page.locator('.pending-card')).toHaveCount(0);
  await expect(page.locator('#resumo-fila')).toContainText('Filtros alterados');
  estado.esperarFila = null;
  await page.getByRole('button', { name: 'Consultar fila', exact: true }).click();
  await expect(page.locator('.pending-card')).toHaveCount(2);
});

test('fila vazia e erro de API ausente têm estados diferentes e permitem nova consulta', async ({ page }) => {
  const estado = await abrir(page, { itens: [] });
  await expect(page.locator('#resumo-fila')).toContainText('Nenhuma solicitação pendente');
  estado.falhaFila = { status: 404, codigo: 'NAO_ENCONTRADO', mensagem: 'Consulta indisponível.' };
  await page.getByRole('button', { name: 'Atualizar fila', exact: true }).click();
  await expect(page.locator('#feedback-fila')).toHaveText('Consulta indisponível.');
  await expect(page.locator('#referencia-fila')).toContainText('fila-suporte-123');
  estado.falhaFila = null;
  estado.itens = [pendente];
  await page.getByRole('button', { name: 'Atualizar fila', exact: true }).click();
  await expect(page.locator('.pending-card')).toHaveCount(1);
});

test('projeção incoerente impede renderização parcial e decisão', async ({ page }) => {
  const estado = await preparar(page, { itens: [pendente, { ...segunda, restrita: false }] });
  await page.goto('/pages/aprovacoes.html');
  await expect(page.locator('#feedback-fila')).toContainText('Não foi possível interpretar');
  await expect(page.locator('.pending-card')).toHaveCount(0);
  await expect(page.locator('#detalhes-pendente')).toBeHidden();
  expect(estado.escritas).toHaveLength(0);
});

for (const status of [400, 403, 404, 409]) {
  test(`erro ${status} na decisão não repete POST e permite recuperação`, async ({ page }) => {
    const estado = await abrir(page, { falhaDecisao: { status, codigo: status === 409 ? 'TRANSICAO_INVALIDA' : 'OPERACAO_NAO_PERMITIDA', mensagem: 'A operação não foi concluída.' } });
    await avaliar(page);
    await page.getByRole('radio', { name: 'Rejeitar', exact: true }).check();
    await page.getByLabel('Motivo da rejeição', { exact: true }).fill('Uso prioritário.');
    await page.getByRole('button', { name: 'Confirmar rejeição' }).click();
    await expect(page.locator('#feedback-decisao')).toHaveText('A operação não foi concluída.');
    await expect(page.locator('#referencia-decisao')).toContainText('fila-suporte-123');
    expect(estado.escritas).toHaveLength(1);
    if (status === 409) {
      await expect(page.locator('#detalhes-pendente')).toBeHidden();
      await page.getByRole('button', { name: 'Atualizar fila', exact: true }).click();
      await expect(page.locator('.pending-card')).toHaveCount(2);
    } else {
      await expect(page.getByLabel('Motivo da rejeição', { exact: true })).toHaveValue('Uso prioritário.');
      await expect(page.getByRole('button', { name: 'Confirmar rejeição' })).toBeEnabled();
    }
  });
}

test('403 invalida CSRF e nova decisão explícita obtém token novo', async ({ page }) => {
  const estado = await abrir(page, { falhaDecisao: { status: 403, codigo: 'OPERACAO_NAO_PERMITIDA', mensagem: 'Envio recusado.' } });
  await avaliar(page);
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toHaveText('Envio recusado.');
  expect(estado.escritas).toHaveLength(1);
  estado.falhaDecisao = null;
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('Decisão confirmada');
  expect(estado.escritas[1].headers['x-csrf-dinamico']).toBe('csrf-2');
});

test('rede após decisão impede replay e pede conferir resultado pela fila', async ({ page }) => {
  const estado = await abrir(page, { rede: true });
  await avaliar(page);
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('confira o resultado antes de reenviar');
  await expect(page.locator('#detalhes-pendente')).toBeHidden();
  await expect(page.locator('.pending-card')).toHaveCount(0);
  expect(estado.escritas).toHaveLength(1);
});

test('resposta de decisão incoerente não afirma sucesso nem mantém ações antigas', async ({ page }) => {
  const estado = await abrir(page, { alteracaoResposta: { solicitanteId: 999 } });
  await avaliar(page);
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('Não foi possível confirmar a decisão');
  await expect(page.locator('#detalhes-pendente')).toBeHidden();
  expect(estado.escritas).toHaveLength(1);
});

test('sessão expirada na decisão volta ao login sem repetir a escrita', async ({ page }) => {
  const estado = await abrir(page);
  await avaliar(page);
  estado.autenticado = false;
  estado.falhaDecisao = { status: 401, codigo: 'NAO_AUTENTICADO', mensagem: 'Sessão expirada.' };
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page).toHaveURL(/login.html\?sessao=expirada$/);
  expect(estado.escritas).toHaveLength(1);
});

test('servidor negando consulta com 403 não expõe solicitações', async ({ page }) => {
  const estado = await preparar(page, { falhaFila: { status: 403, codigo: 'OPERACAO_NAO_PERMITIDA', mensagem: 'Consulta não permitida.' } });
  await page.goto('/pages/aprovacoes.html');
  await expect(page.locator('#feedback-fila')).toHaveText('Consulta não permitida.');
  await expect(page.locator('.pending-card')).toHaveCount(0);
  expect(estado.escritas).toHaveLength(0);
});

test('dados e erro com HTML permanecem texto, sem expor campos extras da projeção', async ({ page }) => {
  const malicioso = { ...pendente, solicitante: { usuarioId: 7, identificacao: '<img src=x onerror=alert(1)>', email: 'privado@exemplo.test' } };
  const estado = await abrir(page, { itens: [malicioso], falhaDecisao: { status: 400, codigo: 'REQUISICAO_INVALIDA', mensagem: '<script>alert(1)</script> Erro de teste.' } });
  await avaliar(page);
  await expect(page.locator('#dados-pendente')).toContainText('<img src=x');
  await expect(page.locator('#dados-pendente img')).toHaveCount(0);
  await expect(page.locator('#painel')).not.toContainText('privado@exemplo.test');
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('<script>');
  await expect(page.locator('#feedback-decisao script')).toHaveCount(0);
  expect(estado.escritas).toHaveLength(1);
});

test('detalhes e rejeição funcionam por teclado em móvel/desktop com capturas', async ({ page }, testInfo) => {
  await abrir(page);
  await page.getByRole('button', { name: 'Avaliar reserva 1001', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#detalhes-pendente')).toBeFocused();
  await page.getByRole('radio', { name: 'Rejeitar', exact: true }).check();
  await page.getByLabel('Motivo da rejeição', { exact: true }).fill('Equipamento necessário para outra atividade.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('fila-detalhes.png'), fullPage: true });
  await page.getByRole('button', { name: 'Fechar detalhes' }).click();
  await expect(page.getByRole('button', { name: 'Avaliar reserva 1001', exact: true })).toBeFocused();
  await avaliar(page);
  await page.getByRole('button', { name: 'Confirmar aprovação' }).click();
  await expect(page.locator('#feedback-decisao')).toContainText('Decisão confirmada');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('decisao-confirmada.png'), fullPage: true });
});
