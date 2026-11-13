import { test as base, expect } from '@playwright/test';

// Isolamento do frontend; não é evidência de sessão/SQL/concorrência reais.
const test = base.extend({ page: async ({ page }, use) => {
  const erros = [], reservas = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('request', (r) => { if (/\/api\/reservas(?:[/?]|$)/.test(r.url())) reservas.push(r.url()); });
  await use(page); expect(erros).toEqual([]); expect(reservas).toEqual([]);
} });
test.use({ timezoneId: 'Asia/Tokyo' });
const rota = '/pages/movimentacoes.html';
const material = { id: 7, dados: { tipo: 'MATERIAL', codigo: 'PROJ-01', ativo: true, restrito: false, patrimonio: 'PAT-01', descricao: 'Projetor', condicao: 'BOM' }, disponivel: null };
const camera = { id: 8, dados: { ...material.dados, codigo: 'CAM-01', patrimonio: 'PAT-02', descricao: 'Câmera' }, disponivel: null };
const inativo = { id: 9, dados: { ...material.dados, codigo: 'MIC-01', patrimonio: 'PAT-03', descricao: 'Microfone', ativo: false }, disponivel: null };
const aberta = { id: 11, reservaId: 1001, recursoId: 7, responsavelId: 3,
  retiradoEm: '2026-11-10T16:00:00.123456Z', fimPrevisto: '2026-11-10T17:00:00Z', devolvidoEm: null, devolvidoPor: null, atrasoSegundos: 0 };
const copiar = (v) => JSON.parse(JSON.stringify(v));

async function preparar(page, opcoes = {}) {
  const estado = { papel: 'RESPONSAVEL', autenticado: true, itens: copiar([material, camera, inativo]), abertas: [copiar(aberta)],
    consultas: [], escritas: [], inesperadas: [], csrf: 0, erroLista: false, erroPesquisa: false, erroDetalhe: false,
    erroEscrita: 0, rede: false, incoerente: false, outroOperador: false, erroListaAposEscrita: false,
    esperarPesquisa: null, esperarDetalhe: null, esperarEscrita: null, paginar: false, datasEmMinutos: false, ...opcoes };
  const falhar = (route, status, codigo, mensagem) => route.fulfill({ status, json: { codigo, mensagem, correlationId: 'mov-suporte-123' } });
  await page.route('**/api/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname;
    if (path === '/api/auth/me') return estado.autenticado
      ? route.fulfill({ json: { usuarioId: 3, email: 'operador@exemplo.test', papel: estado.papel } })
      : falhar(route, 401, 'NAO_AUTENTICADO', 'Entre novamente.');
    if (path === '/api/auth/csrf') { estado.csrf++; return route.fulfill({ json: { header: 'X-CSRF-MOV', token: 'csrf-' + estado.csrf } }); }
    if (req.method() === 'GET') {
      estado.consultas.push(path + url.search);
      if (path === '/api/movimentacoes') {
        if (estado.erroLista || (estado.erroListaAposEscrita && estado.escritas.length)) return falhar(route, 503, 'INDISPONIVEL', 'Pendências indisponíveis.');
        return route.fulfill({ json: estado.abertas });
      }
      if (path === '/api/recursos') {
        if (estado.esperarPesquisa) await estado.esperarPesquisa;
        if (estado.erroPesquisa) return falhar(route, 503, 'INDISPONIVEL', 'Materiais indisponíveis.');
        const pagina = Number(url.searchParams.get('pagina')), tamanho = Number(url.searchParams.get('tamanho'));
        const filtro = url.searchParams.get('patrimonio')?.toLowerCase();
        const itens = estado.paginar ? [pagina === 0 ? camera : material] : estado.itens.filter((r) => !filtro || r.dados.patrimonio.toLowerCase().includes(filtro));
        return route.fulfill({ json: { itens, pagina, tamanho, total: estado.paginar ? 21 : itens.length } });
      }
      const detalhe = /^\/api\/recursos\/(\d+)$/.exec(path);
      if (detalhe) {
        const recurso = copiar(estado.itens.find((r) => r.id === Number(detalhe[1])) ?? {});
        if (estado.esperarDetalhe) await estado.esperarDetalhe;
        if (estado.erroDetalhe) return falhar(route, 404, 'NAO_ENCONTRADO', 'Cadastro indisponível.');
        return route.fulfill({ json: recurso });
      }
    } else {
      const body = req.postData() ? req.postDataJSON() : undefined;
      estado.escritas.push({ path, metodo: req.method(), body, headers: req.headers() });
      if (estado.esperarEscrita) await estado.esperarEscrita;
      if (estado.rede) return route.abort('failed');
      if (estado.erroEscrita) {
        if (estado.erroEscrita === 401) { estado.autenticado = false; return falhar(route, 401, 'NAO_AUTENTICADO', 'Entre novamente.'); }
        return falhar(route, estado.erroEscrita, 'OPERACAO_RECUSADA', 'Confira <b>o material e a reserva</b>.');
      }
      if (estado.incoerente) return route.fulfill({ json: { ...aberta, id: 999, recursoId: 999 } });
      if (path === '/api/movimentacoes/retiradas') {
        const novo = { ...aberta, id: 80 + estado.escritas.length, ...body,
          ...(estado.datasEmMinutos ? { retiradoEm: '2026-11-10T13:00:00.123456-03:00', fimPrevisto: '2026-11-10T14:00-03:00' } : {}) };
        estado.abertas.push(novo); return route.fulfill({ status: 201, json: novo });
      }
      const devolver = /^\/api\/movimentacoes\/(\d+)\/devolucao$/.exec(path);
      if (devolver) {
        const anterior = estado.abertas.find((m) => m.id === Number(devolver[1]));
        estado.abertas = estado.abertas.filter((m) => m.id !== anterior.id);
        return route.fulfill({ json: { ...anterior, devolvidoEm: estado.datasEmMinutos ? '2026-11-10T15:01-03:00' : '2026-11-10T18:01:01Z', devolvidoPor: estado.outroOperador ? 9 : 3, atrasoSegundos: estado.datasEmMinutos ? 3660 : 3661 } });
      }
    }
    estado.inesperadas.push(req.method() + ' ' + path); return falhar(route, 404, 'NAO_ENCONTRADO', 'Rota não contratada.');
  });
  return estado;
}
async function abrir(page, opcoes) {
  const estado = await preparar(page, opcoes); await page.goto(rota);
  await expect(page.locator('#painel')).toBeVisible(); await expect(page.locator('#controles-mov')).not.toHaveAttribute('disabled');
  return estado;
}
async function pesquisar(page) {
  await page.getByRole('button', { name: 'Pesquisar materiais', exact: true }).click();
  await expect(page.locator('#feedback-materiais')).toBeHidden();
}
async function selecionarRetirada(page) {
  await page.getByLabel('Número da reserva', { exact: true }).fill('1001');
  await pesquisar(page); await page.getByRole('button', { name: 'Escolher Câmera · PAT-02', exact: true }).click();
}
async function confirmarDevolucao(page) {
  await page.getByRole('button', { name: 'Devolver movimentação #11', exact: true }).click();
  await page.getByLabel('Recebi o material identificado', { exact: false }).check();
}

test('Solicitante pela URL direta não consulta movimentações ou cadastros', async ({ page }) => {
  const estado = await preparar(page, { papel: 'SOLICITANTE' }); await page.goto(rota);
  await expect(page.locator('#feedback-inicial')).toContainText('Responsáveis e Administradores');
  await expect(page.locator('#painel')).toBeHidden(); expect(estado.consultas).toEqual([]); expect(estado.escritas).toEqual([]);
});
test('Administrador consulta abertas sem retirada, devolução ou busca de materiais', async ({ page }) => {
  const estado = await abrir(page, { papel: 'ADMINISTRADOR' });
  await expect(page.locator('#pendencias .movement-card')).toHaveCount(1); await expect(page.locator('#retirada')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Devolver movimentação #11' })).toHaveCount(0);
  await page.locator('#form-retirada').dispatchEvent('submit'); await page.locator('#form-devolucao').dispatchEvent('submit');
  expect(estado.escritas).toEqual([]); expect(estado.consultas.some((u) => u.startsWith('/api/recursos?'))).toBe(false);
});
test('sem sessão redireciona antes de consultar pendências', async ({ page }) => {
  const estado = await preparar(page, { autenticado: false }); await page.goto(rota);
  await expect(page).toHaveURL(/login.html\?sessao=expirada$/); expect(estado.consultas).toEqual([]);
});
test('pendência fora do prazo continua aberta com estimativa e hora em São Paulo', async ({ page }) => {
  const estado = await abrir(page);
  await expect(page.locator('[data-nome-material="7"]')).toHaveText('Projetor · PAT-01');
  await expect(page.locator('[data-prazo="11"]')).toContainText('estimativa do navegador');
  await expect(page.locator('#pendencias')).toContainText('10/11/2026, 13:00');
  await expect(page.locator('#pendencias .movement-card')).toHaveCount(1);
  expect(estado.abertas[0].atrasoSegundos).toBe(0); expect(estado.consultas[0]).toBe('/api/movimentacoes?abertas=true');
});
test('cadastro inacessível preserva pendência e permite confirmar devolução', async ({ page }) => {
  const estado = await abrir(page, { erroDetalhe: true });
  await expect(page.locator('[data-identificacao="7"]')).toContainText('Cadastro indisponível');
  await expect(page.locator('[data-nome-material="7"]')).toHaveText('Material #7');
  await confirmarDevolucao(page); await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
  await expect(page.locator('#confirmacao-devolucao')).toBeVisible(); expect(estado.escritas).toHaveLength(1);
});
test('seleção de patrimônio é explícita, pagina no servidor e trocar página invalida confirmação', async ({ page }) => {
  const estado = await abrir(page, { paginar: true }); await selecionarRetirada(page);
  await page.getByLabel('Conferi a reserva e o patrimônio', { exact: false }).check();
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.locator('#form-retirada')).toBeHidden(); await expect(page.locator('#pagina-material')).toContainText('Página 2');
  expect(estado.consultas.at(-1)).toContain('pagina=1'); expect(estado.consultas.at(-1)).toContain('tipo=MATERIAL');
});
test('alterar reserva ou patrimônio invalida confirmação e seleção obsoleta', async ({ page }) => {
  const estado = await abrir(page); await selecionarRetirada(page);
  await page.getByLabel('Conferi a reserva e o patrimônio', { exact: false }).check();
  await page.getByLabel('Número da reserva', { exact: true }).fill('1002'); await expect(page.locator('#confirmar-retirada')).not.toBeChecked();
  await page.getByLabel('Buscar por patrimônio').fill('PAT-03'); await expect(page.locator('#form-retirada')).toBeHidden();
  expect(estado.escritas).toEqual([]);
});
test('resposta atrasada de pesquisa não restaura materiais após mudar filtro', async ({ page }) => {
  const estado = await abrir(page); let liberar; estado.esperarPesquisa = new Promise((r) => { liberar = r; });
  await page.getByRole('button', { name: 'Pesquisar materiais', exact: true }).click();
  await expect(page.locator('#controles-mov')).toHaveAttribute('disabled');
  await page.locator('#patrimonio-material').evaluate((el) => { el.value = 'OUTRO'; });
  await page.locator('#patrimonio-material').dispatchEvent('input');
  liberar(); await expect(page.locator('#controles-mov')).not.toHaveAttribute('disabled');
  await expect(page.locator('#materiais')).toBeEmpty(); await expect(page.locator('#resumo-materiais')).toContainText('Pesquise');
});
test('retirada exige confirmação, envia somente IDs e impede repetição após sucesso', async ({ page }) => {
  const estado = await abrir(page); await selecionarRetirada(page);
  await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).click(); expect(estado.escritas).toHaveLength(0);
  await page.getByLabel('Conferi a reserva e o patrimônio', { exact: false }).check(); await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).click();
  await expect(page.locator('#confirmacao-retirada')).toBeVisible(); await expect(page.locator('#confirmacao-retirada')).toBeFocused();
  expect(estado.escritas[0]).toMatchObject({ path: '/api/movimentacoes/retiradas', metodo: 'POST', body: { reservaId: 1001, recursoId: 8 } });
  expect(estado.escritas[0].headers['x-csrf-mov']).toBe('csrf-1');
  await page.locator('#form-retirada').dispatchEvent('submit'); expect(estado.escritas).toHaveLength(1);
  await page.getByRole('button', { name: 'Registrar outra retirada' }).click(); await expect(page.locator('#materiais')).toBeEmpty();
});

test('prazo com minutos e offset confirma retirada, pendência e devolução sem reenvio', async ({ page }) => {
  const estado = await abrir(page, { abertas: [], datasEmMinutos: true }); await selecionarRetirada(page);
  await page.locator('#confirmar-retirada').check(); await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).click();
  await expect(page.locator('#confirmacao-retirada')).toBeVisible();
  await expect(page.locator('#pendencias .movement-card')).toHaveCount(1);
  await expect(page.locator('#pendencias')).toContainText('10/11/2026, 14:00');
  await page.getByRole('button', { name: 'Devolver movimentação #81', exact: true }).click();
  await page.locator('#confirmar-devolucao').check(); await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
  await expect(page.locator('#confirmacao-devolucao')).toBeVisible(); await expect(page.locator('#pendencias .movement-card')).toHaveCount(0);
  expect(estado.escritas.map((e) => e.path)).toEqual(['/api/movimentacoes/retiradas', '/api/movimentacoes/81/devolucao']);
  expect(estado.inesperadas).toEqual([]);
});
test('material inativo não oferece escolha válida e busca vazia não inventa resultados', async ({ page }) => {
  const estado = await abrir(page); await pesquisar(page);
  await expect(page.getByRole('button', { name: 'Escolher Microfone · PAT-03', exact: true })).toBeDisabled();
  await page.getByLabel('Buscar por patrimônio').fill('A & B'); await pesquisar(page); await expect(page.locator('#resumo-materiais')).toContainText('Nenhum material');
  expect(estado.consultas.at(-1)).toContain('patrimonio=A+%26+B');
});
test('devolução aceita registro anterior de outro operador e mostra atraso final do servidor', async ({ page }) => {
  const estado = await abrir(page, { outroOperador: true }); await confirmarDevolucao(page);
  await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
  await expect(page.locator('#detalhes-devolucao')).toContainText('Operador #9'); await expect(page.locator('#detalhes-devolucao')).toContainText('3661 segundos');
  await expect(page.locator('#pendencias .movement-card')).toHaveCount(0); await expect(page.locator('#confirmacao-devolucao')).toBeFocused();
  expect(estado.escritas[0]).toMatchObject({ path: '/api/movimentacoes/11/devolucao', metodo: 'POST' }); expect(estado.escritas[0].body).toBeUndefined();
});
test('devolução exige confirmação e desistir não escreve', async ({ page }) => {
  const estado = await abrir(page); await page.getByRole('button', { name: 'Devolver movimentação #11', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click(); expect(estado.escritas).toHaveLength(0);
  await page.getByRole('button', { name: 'Voltar sem devolver' }).click(); await expect(page.locator('#form-devolucao')).toBeHidden();
  await expect(page.locator('#pendencias .movement-card')).toHaveCount(1);
});
for (const status of [400, 403, 404, 409]) {
  test('falha ' + status + ' preserva retirada, mostra texto literal e não repete POST', async ({ page }) => {
    const estado = await abrir(page, { erroEscrita: status }); await selecionarRetirada(page);
    await page.getByLabel('Conferi a reserva e o patrimônio', { exact: false }).check(); await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).click();
    await expect(page.locator('#feedback-retirada')).toContainText('<b>o material e a reserva</b>');
    await expect(page.locator('#feedback-retirada b')).toHaveCount(0); await expect(page.locator('#referencia-retirada')).toContainText('mov-suporte-123');
    await expect(page.locator('#numero-reserva')).toHaveValue('1001'); await expect(page.locator('#form-retirada')).toBeVisible();
    expect(estado.escritas).toHaveLength(1);
  });
}
test('409 na devolução mantém a pendência e permite reconsulta sem POST automático', async ({ page }) => {
  const estado = await abrir(page, { erroEscrita: 409 }); await confirmarDevolucao(page);
  await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click(); await expect(page.locator('#referencia-devolucao')).toBeVisible();
  await expect(page.locator('#pendencias .movement-card')).toHaveCount(1); await expect(page.locator('#confirmacao-devolucao')).toBeHidden();
  await page.getByRole('button', { name: 'Atualizar pendências' }).click(); await expect(page.locator('#form-devolucao')).toBeHidden(); expect(estado.escritas).toHaveLength(1);
});
for (const problema of ['rede', 'incoerente']) {
  test(problema + ' na devolução mantém pendência sem sucesso falso', async ({ page }) => {
    const estado = await abrir(page, { [problema]: true }); await confirmarDevolucao(page); await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
    await expect(page.locator('#feedback-devolucao')).toContainText('confirmar'); await expect(page.locator('#pendencias .movement-card')).toHaveCount(1);
    await expect(page.locator('#confirmacao-devolucao')).toBeHidden(); expect(estado.escritas).toHaveLength(1);
    await page.getByRole('button', { name: 'Devolver movimentação #11', exact: true }).click();
    await expect(page.locator('#feedback-devolucao')).toContainText('Atualize as pendências');
    await page.locator('#confirmar-devolucao').evaluate((el) => { el.checked = true; });
    await page.locator('#form-devolucao').dispatchEvent('submit'); expect(estado.escritas).toHaveLength(1);
    estado[problema] = false; await page.getByRole('button', { name: 'Atualizar pendências' }).click();
    await confirmarDevolucao(page); await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
    await expect(page.locator('#confirmacao-devolucao')).toBeVisible(); expect(estado.escritas).toHaveLength(2);
  });
}
test('envios simultâneos de devolução mantêm apenas uma escrita e bloqueiam ações', async ({ page }) => {
  const estado = await abrir(page); await confirmarDevolucao(page); let liberar; estado.esperarEscrita = new Promise((r) => { liberar = r; });
  await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
  await expect.poll(() => estado.escritas.length).toBe(1); await page.locator('#form-devolucao').dispatchEvent('submit');
  await expect(page.getByRole('button', { name: 'Pesquisar materiais', exact: true })).toBeDisabled();
  liberar(); await expect(page.locator('#confirmacao-devolucao')).toBeVisible(); expect(estado.escritas).toHaveLength(1);
});
test('falha de consulta mantém última lista confirmada e recupera com GET', async ({ page }) => {
  const estado = await abrir(page); estado.erroLista = true; await page.getByRole('button', { name: 'Atualizar pendências' }).click();
  await expect(page.locator('#resumo-pendencias')).toContainText('última consulta confirmada'); await expect(page.locator('#pendencias .movement-card')).toHaveCount(1);
  estado.erroLista = false; estado.abertas = []; await page.getByRole('button', { name: 'Atualizar pendências' }).click();
  await expect(page.locator('#resumo-pendencias')).toContainText('Nenhuma retirada aberta'); expect(estado.escritas).toHaveLength(0);
});
test('escrita confirmada seguida de GET falho não reabre pendência nem repete devolução', async ({ page }) => {
  const estado = await abrir(page, { erroListaAposEscrita: true }); await confirmarDevolucao(page); await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
  await expect(page.locator('#confirmacao-devolucao')).toBeVisible(); await expect(page.locator('#feedback-pendencias')).toContainText('Pendências indisponíveis');
  await expect(page.locator('#pendencias .movement-card')).toHaveCount(0); expect(estado.escritas).toHaveLength(1);
});
test('sessão expirada na escrita segue login sem segunda escrita', async ({ page }) => {
  const estado = await abrir(page, { erroEscrita: 401 }); await confirmarDevolucao(page); await page.getByRole('button', { name: 'Confirmar devolução', exact: true }).click();
  await expect(page).toHaveURL(/login.html\?sessao=expirada$/); expect(estado.escritas).toHaveLength(1);
});
test('textos do cadastro são literais e não executam HTML', async ({ page }) => {
  const itens = copiar([material, camera]); itens[0].dados.descricao = '<img src=x onerror=alert(1)>';
  const estado = await abrir(page, { itens }); await expect(page.locator('[data-nome-material="7"]')).toContainText('<img');
  await expect(page.locator('#pendencias img')).toHaveCount(0); expect(estado.inesperadas).toEqual([]);
});
test('capturas de pendências e retirada, teclado e largura em duas viewports', async ({ page }, info) => {
  const estado = await abrir(page); await expect(page.locator('[data-nome-material="7"]')).toHaveText('Projetor · PAT-01');
  await page.screenshot({ path: info.outputPath('pendencias.png'), fullPage: true });
  await page.getByLabel('Número da reserva', { exact: true }).fill('1001'); await page.getByLabel('Buscar por patrimônio').fill('PAT-02');
  await page.locator('#patrimonio-material').press('Enter'); await expect(page.locator('#materiais .movement-material')).toHaveCount(1);
  await page.getByRole('button', { name: 'Escolher Câmera · PAT-02', exact: true }).click();
  await page.locator('#confirmar-retirada').press('Space'); await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).press('Enter');
  await expect(page.locator('#confirmacao-retirada')).toBeFocused(); await expect(page.locator('#controles-mov')).not.toHaveAttribute('disabled');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('retirada.png'), fullPage: true }); expect(estado.inesperadas).toEqual([]);
});

for (const problema of ['rede', 'incoerente']) {
  test(problema + ' na retirada exige GET confirmado e nova confirmação antes de outro POST', async ({ page }) => {
    const estado = await abrir(page, { [problema]: true }); await selecionarRetirada(page);
    await page.getByLabel('Conferi a reserva e o patrimônio', { exact: false }).check(); await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).click();
    await expect(page.locator('#feedback-retirada')).toContainText('confirmar'); await expect(page.locator('#form-retirada')).toBeHidden();
    await expect(page.locator('#numero-reserva')).toHaveValue('1001');
    await page.locator('#confirmar-retirada').evaluate((el) => { el.checked = true; });
    await page.locator('#form-retirada').dispatchEvent('submit'); expect(estado.escritas).toHaveLength(1);
    estado.erroLista = true; await page.getByRole('button', { name: 'Atualizar pendências' }).click();
    await expect(page.locator('#feedback-pendencias')).toBeVisible(); await page.locator('#form-retirada').dispatchEvent('submit'); expect(estado.escritas).toHaveLength(1);
    estado.erroLista = false; estado[problema] = false;
    await page.getByRole('button', { name: 'Atualizar pendências' }).click(); await expect(page.locator('#form-retirada')).toBeVisible();
    await expect(page.locator('#confirmar-retirada')).not.toBeChecked(); await page.getByLabel('Conferi a reserva e o patrimônio', { exact: false }).check();
    await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).click(); await expect(page.locator('#confirmacao-retirada')).toBeVisible(); expect(estado.escritas).toHaveLength(2);
  });
}

test('identificação antiga não sobrescreve cadastro obtido na atualização seguinte', async ({ page }) => {
  let liberar; const esperarDetalhe = new Promise((r) => { liberar = r; });
  const estado = await abrir(page, { esperarDetalhe });
  await expect.poll(() => estado.consultas.includes('/api/recursos/7')).toBe(true);
  estado.esperarDetalhe = null; estado.itens[0].dados.descricao = 'Projetor atualizado';
  await page.getByRole('button', { name: 'Atualizar pendências' }).click();
  await expect(page.locator('[data-nome-material="7"]')).toHaveText('Projetor atualizado · PAT-01');
  const respostaAntiga = page.waitForResponse((r) => r.url().endsWith('/api/recursos/7'));
  liberar(); await respostaAntiga;
  await expect(page.locator('[data-nome-material="7"]')).toHaveText('Projetor atualizado · PAT-01');
});

test('envios simultâneos de retirada mantêm um POST e uma confirmação válida', async ({ page }) => {
  const estado = await abrir(page); await selecionarRetirada(page); let liberar; estado.esperarEscrita = new Promise((r) => { liberar = r; });
  await page.getByLabel('Conferi a reserva e o patrimônio', { exact: false }).check(); await page.getByRole('button', { name: 'Confirmar retirada', exact: true }).click();
  await expect.poll(() => estado.escritas.length).toBe(1); await page.locator('#form-retirada').dispatchEvent('submit');
  liberar(); await expect(page.locator('#confirmacao-retirada')).toBeVisible(); expect(estado.escritas).toHaveLength(1);
});

test('falha inicial de pendências não inventa vazio e permite recuperação', async ({ page }) => {
  const estado = await abrir(page, { erroLista: true }); await expect(page.locator('#resumo-pendencias')).toContainText('Consulta indisponível');
  await expect(page.locator('#pendencias')).toBeEmpty(); estado.erroLista = false;
  await page.getByRole('button', { name: 'Atualizar pendências' }).click(); await expect(page.locator('#pendencias .movement-card')).toHaveCount(1);
  expect(estado.escritas).toHaveLength(0);
});
