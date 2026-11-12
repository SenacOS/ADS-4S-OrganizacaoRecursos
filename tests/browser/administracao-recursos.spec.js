import { test as base, expect } from '@playwright/test';

// API controlada somente nestes testes; não comprova segurança/autorização do Spring.
const test = base.extend({ page: async ({ page }, use) => {
  const erros = []; const reservas = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('request', (r) => { if (/\/api\/reservas(?:[/?]|$)/.test(r.url())) reservas.push(r.url()); });
  await use(page); expect(erros).toEqual([]); expect(reservas).toEqual([]);
} });
test.use({ timezoneId: 'Asia/Tokyo' });
const rota = '/pages/gestao-recursos.html';
const sala = { id: 7, dados: { tipo: 'SALA', codigo: 'SALA-01', ativo: true, restrito: false, capacidade: 20, localizacao: 'Bloco A', tipoSala: 'Laboratório' }, disponivel: null };
const docente = { id: 8, dados: { tipo: 'PROFESSOR', codigo: 'DOC-01', ativo: true, restrito: true, nome: 'Ana', competencias: ['java'] }, disponivel: null };
const material = { id: 9, dados: { tipo: 'MATERIAL', codigo: 'MAT-01', ativo: false, restrito: false, patrimonio: 'PAT-01', descricao: 'Projetor', condicao: 'BOM' }, disponivel: null };
const bloqueio = { id: 11, recurso_id: 7, inicio_utc: '2026-11-11T13:00:00-03:00', fim_utc: '2026-11-13T14:00:00-03:00', motivo: 'Manutenção', status: 'ATIVO' };
const janelas = [{ dia: 'MONDAY', inicio: '07:00:00.123456789', fim: '12:00:00' }, { dia: 'FRIDAY', inicio: '08:00:00', fim: '18:00:00' }];
const copiar = (valor) => JSON.parse(JSON.stringify(valor));

async function preparar(page, opcoes = {}) {
  const estado = { papel: 'ADMINISTRADOR', autenticado: true, itens: copiar([sala, docente, material]), janelas: copiar(janelas),
    bloqueios: [copiar(bloqueio)], consultas: [], escritas: [], csrf: 0, inesperadas: [],
    erroEscrita: null, erroDetalhe: false, erroExpediente: false, erroPesquisa: false, erroBloqueios: false, rede: false, respostaInvalida: false,
    esperar: null, esperarDetalhe: null, paginar: false, ...opcoes };
  const falhar = (route, status, codigo, mensagem) => route.fulfill({ status, json: { codigo, mensagem, correlationId: 'admin-suporte-123' } });
  await page.route('**/api/**', async (route) => {
    const req = route.request(); const url = new URL(req.url()); const metodo = req.method(); const path = url.pathname;
    if (path === '/api/auth/me') return estado.autenticado
      ? route.fulfill({ json: { usuarioId: 1, email: 'admin@exemplo.test', papel: estado.papel } })
      : falhar(route, 401, 'NAO_AUTENTICADO', 'Entre novamente.');
    if (path === '/api/auth/csrf') { estado.csrf++; return route.fulfill({ json: { header: 'X-CSRF-ADMIN', token: 'csrf-' + estado.csrf } }); }
    if (metodo === 'GET') {
      estado.consultas.push(path + url.search);
      if (path === '/api/recursos') {
        if (estado.erroPesquisa) return falhar(route, 503, 'INDISPONIVEL', 'Consulta indisponível.');
        const params = Object.fromEntries(url.searchParams);
        const itens = estado.paginar ? [Number(params.pagina) === 0 ? estado.itens[0] : estado.itens[1]]
          : estado.itens.filter((r) => !params.tipo || r.dados.tipo === params.tipo);
        return route.fulfill({ json: { itens, pagina: Number(params.pagina), tamanho: Number(params.tamanho), total: estado.paginar ? 21 : itens.length } });
      }
      if (path === '/api/horarios-funcionamento') {
        if (estado.erroExpediente) return falhar(route, 503, 'INDISPONIVEL', 'Funcionamento indisponível.');
        return route.fulfill({ json: { zona: 'America/Sao_Paulo', janelas: estado.janelas } });
      }
      const detalhe = /^\/api\/recursos\/(\d+)$/.exec(path);
      if (detalhe) {
        if (estado.esperarDetalhe) await estado.esperarDetalhe;
        if (estado.erroDetalhe) return falhar(route, 404, 'NAO_ENCONTRADO', 'Cadastro não encontrado.');
        return route.fulfill({ json: estado.itens.find((r) => r.id === Number(detalhe[1])) });
      }
      const lista = /^\/api\/recursos\/(\d+)\/bloqueios$/.exec(path);
      if (lista) {
        if (estado.erroBloqueios) return falhar(route, 503, 'INDISPONIVEL', 'Bloqueios indisponíveis.');
        return route.fulfill({ json: estado.bloqueios.filter((b) => b.recurso_id === Number(lista[1])) });
      }
    } else {
      const body = req.postData() ? req.postDataJSON() : undefined;
      estado.escritas.push({ path, metodo, body, headers: req.headers() });
      if (estado.esperar) await estado.esperar;
      if (estado.rede) return route.abort('failed');
      if (estado.erroEscrita) return falhar(route, estado.erroEscrita, 'OPERACAO_RECUSADA', 'Não foi possível alterar <b>este recurso</b>.');
      if (estado.respostaInvalida) return route.fulfill({ json: { id: 999 } });
      if (path === '/api/recursos' && metodo === 'POST') {
        const novo = { id: 100 + estado.itens.length, dados: body, disponivel: null }; estado.itens.push(novo);
        return route.fulfill({ status: 201, json: novo });
      }
      const recurso = /^\/api\/recursos\/(\d+)$/.exec(path);
      if (recurso) {
        const item = estado.itens.find((r) => r.id === Number(recurso[1]));
        if (metodo === 'DELETE') { item.dados.ativo = false; return route.fulfill({ status: 204 }); }
        item.dados = body; return route.fulfill({ json: item });
      }
      const novoBloqueio = /^\/api\/recursos\/(\d+)\/bloqueios$/.exec(path);
      if (novoBloqueio) {
        const item = { id: 20 + estado.bloqueios.length, recurso_id: Number(novoBloqueio[1]), inicio_utc: body.inicio, fim_utc: body.fim, motivo: body.motivo, status: 'ATIVO' };
        estado.bloqueios.push(item); return route.fulfill({ status: 201, json: item });
      }
      const cancelamento = /^\/api\/bloqueios\/(\d+)\/cancelamento$/.exec(path);
      if (cancelamento) { const item = estado.bloqueios.find((b) => b.id === Number(cancelamento[1])); item.status = 'CANCELADO'; return route.fulfill({ json: item }); }
      if (path === '/api/horarios-funcionamento') { estado.janelas = body.janelas; return route.fulfill({ json: { zona: 'America/Sao_Paulo', janelas: estado.janelas } }); }
    }
    estado.inesperadas.push(metodo + ' ' + path); return falhar(route, 404, 'NAO_ENCONTRADO', 'Rota inesperada.');
  });
  return estado;
}
async function abrir(page, opcoes) {
  const estado = await preparar(page, opcoes); await page.goto(rota);
  await expect(page.locator('#controles-admin')).not.toHaveAttribute('disabled'); await expect(page.locator('#form-expediente')).toBeVisible();
  return estado;
}
async function editarSala(page) {
  await page.getByRole('button', { name: 'Gerenciar SALA-01', exact: true }).click();
  await expect(page.locator('#editor-recurso')).toBeVisible(); await expect(page.locator('#controles-admin')).not.toHaveAttribute('disabled');
}
async function novaSala(page) {
  await page.getByRole('button', { name: 'Novo recurso', exact: true }).click();
  await page.getByLabel('Código *', { exact: true }).fill('SALA-NOVA');
  await page.getByLabel('Capacidade *', { exact: true }).fill('30');
  await page.getByLabel('Localização da sala *', { exact: true }).fill('Bloco B');
  await page.getByLabel('Tipo de sala *', { exact: true }).fill('Aula');
}
async function enviarCadastro(page) { await page.getByRole('button', { name: 'Salvar recurso', exact: true }).click(); }

for (const papel of ['SOLICITANTE', 'RESPONSAVEL']) {
  test(papel + ' não acessa nem consulta dados administrativos pela URL direta', async ({ page }) => {
    const estado = await preparar(page, { papel }); await page.goto(rota);
    await expect(page.locator('#feedback-inicial')).toContainText('somente para Administradores');
    await expect(page.locator('#painel')).toBeHidden(); expect(estado.consultas).toEqual([]); expect(estado.escritas).toEqual([]);
  });
}
test('sem sessão redireciona ao login sem consultas administrativas', async ({ page }) => {
  const estado = await preparar(page, { autenticado: false }); await page.goto(rota);
  await expect(page).toHaveURL(/\/login.html\?sessao=expirada$/); expect(estado.consultas).toEqual([]);
});
test('consulta paginada inclui inativos, combina filtros e reinicia página', async ({ page }) => {
  const estado = await abrir(page, { paginar: true });
  await page.getByRole('button', { name: 'Próxima', exact: true }).click();
  await expect(page.locator('#pagina-admin')).toContainText('Página 2');
  await page.getByLabel('Tipo de recurso', { exact: true }).selectOption('MATERIAL');
  await page.getByLabel('Patrimônio', { exact: true }).fill('A & B');
  await page.getByRole('button', { name: 'Consultar cadastros' }).click();
  await expect(page.locator('#pagina-admin')).toContainText('Página 1');
  expect(estado.consultas.at(-1)).toContain('patrimonio=A+%26+B'); expect(estado.consultas.at(-1)).toContain('pagina=0');
  expect(estado.consultas.some((u) => u.includes('ativo='))).toBe(false);
});
test('cadastro de sala por teclado envia somente DTO e CSRF', async ({ page }) => {
  const estado = await abrir(page); await expect(page.locator('#lista-admin')).toContainText('Desativado');
  await novaSala(page); await page.locator('#cad-tipoSala').press('Enter');
  await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo');
  expect(estado.escritas).toHaveLength(1); expect(estado.escritas[0].body).toEqual({ ...sala.dados, codigo: 'SALA-NOVA', capacidade: 30, localizacao: 'Bloco B', tipoSala: 'Aula' });
  expect(estado.escritas[0].headers['x-csrf-admin']).toBe('csrf-1');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});
test('cadastro docente aceita competências vazias e não envia dados da sala', async ({ page }) => {
  const estado = await abrir(page); await novaSala(page);
  await page.getByLabel('Tipo *', { exact: true }).selectOption('PROFESSOR');
  await page.getByLabel('Nome *', { exact: true }).fill('Maria'); await enviarCadastro(page);
  await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo');
  expect(estado.escritas[0].body).toEqual({ tipo: 'PROFESSOR', codigo: 'SALA-NOVA', ativo: true, restrito: false, nome: 'Maria', competencias: [] });
});
test('cadastro material aceita condição livre e restrição', async ({ page }) => {
  const estado = await abrir(page); await novaSala(page); await page.getByLabel('Tipo *', { exact: true }).selectOption('MATERIAL');
  await page.getByLabel('Patrimônio do material *').fill('PAT-NOVO'); await page.getByLabel('Descrição *', { exact: true }).fill('Câmera');
  await page.getByLabel('Condição *', { exact: true }).fill('Em avaliação'); await page.getByLabel('Exige aprovação', { exact: true }).check();
  await enviarCadastro(page); await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo');
  expect(estado.escritas[0].body).toEqual({ tipo: 'MATERIAL', codigo: 'SALA-NOVA', ativo: true, restrito: true, patrimonio: 'PAT-NOVO', descricao: 'Câmera', condicao: 'Em avaliação' });
});
test('edição consulta detalhe, fixa tipo e preserva campos no PUT completo', async ({ page }) => {
  const estado = await abrir(page); await editarSala(page); expect(estado.consultas).toContain('/api/recursos/7');
  await expect(page.locator('#cad-tipo')).toBeDisabled(); await page.getByLabel('Código *', { exact: true }).fill('SALA-EDITADA');
  await enviarCadastro(page); await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo');
  expect(estado.escritas[0]).toMatchObject({ metodo: 'PUT', path: '/api/recursos/7', body: { ...sala.dados, codigo: 'SALA-EDITADA' } });
});
test('detalhe ausente impede edição e não aproveita resumo incompleto', async ({ page }) => {
  const estado = await abrir(page, { erroDetalhe: true }); await page.getByRole('button', { name: 'Gerenciar SALA-01', exact: true }).click();
  await expect(page.locator('#feedback-busca')).toContainText('Cadastro não encontrado'); await expect(page.locator('#editor-recurso')).toBeHidden();
  expect(estado.escritas).toEqual([]);
});
test('detalhe pendente bloqueia troca de alvo e respostas não se misturam', async ({ page }) => {
  const estado = await abrir(page); let liberar; estado.esperarDetalhe = new Promise((r) => { liberar = r; });
  await page.getByRole('button', { name: 'Gerenciar SALA-01', exact: true }).click();
  await expect(page.locator('#controles-admin')).toHaveAttribute('disabled');
  await expect(page.getByRole('button', { name: 'Gerenciar Ana · DOC-01', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Gerenciar Ana · DOC-01', exact: true }).evaluate((b) => b.click());
  liberar(); await expect(page.locator('#cad-codigo')).toHaveValue('SALA-01');
  expect(estado.consultas.filter((u) => /^\/api\/recursos\/\d+$/.test(u))).toEqual(['/api/recursos/7']);
});
test('desativação exige confirmação e só muda estado após 204', async ({ page }) => {
  const estado = await abrir(page); await editarSala(page);
  await page.getByRole('button', { name: 'Confirmar desativação' }).click(); expect(estado.escritas).toHaveLength(0);
  await page.getByLabel('Confirmo a desativação', { exact: false }).check();
  await page.getByRole('button', { name: 'Confirmar desativação' }).click();
  await expect(page.locator('#feedback-cadastro')).toContainText('Recurso desativado');
  expect(estado.escritas[0].metodo).toBe('DELETE'); await expect(page.locator('#cad-ativo')).not.toBeChecked();
});
test('409 na desativação mantém recurso ativo, dados e referência de suporte', async ({ page }) => {
  const estado = await abrir(page, { erroEscrita: 409 }); await editarSala(page);
  await page.getByLabel('Confirmo a desativação', { exact: false }).check(); await page.getByRole('button', { name: 'Confirmar desativação' }).click();
  await expect(page.locator('#referencia-cadastro')).toContainText('admin-suporte-123'); await expect(page.locator('#cad-ativo')).toBeChecked();
  await expect(page.locator('#feedback-cadastro')).toContainText('<b>este recurso</b>'); expect(estado.escritas).toHaveLength(1);
  await expect(page.locator('#feedback-cadastro b')).toHaveCount(0);
});
test('bloqueio multidia converte fuso, preserva 409 e permite correção explícita', async ({ page }) => {
  const estado = await abrir(page, { erroEscrita: 409 }); await editarSala(page);
  await page.getByLabel('Início do bloqueio *').fill('2026-11-11T13:00'); await page.getByLabel('Fim do bloqueio *').fill('2026-11-13T14:00');
  await page.getByLabel('Motivo *', { exact: true }).fill('Manutenção'); await page.getByRole('button', { name: 'Criar bloqueio' }).click();
  await expect(page.locator('#feedback-bloqueios')).toContainText('Não foi possível alterar');
  await expect(page.locator('#bloqueio-motivo')).toHaveValue('Manutenção'); expect(estado.escritas).toHaveLength(1);
  estado.erroEscrita = null; await page.getByRole('button', { name: 'Criar bloqueio' }).click();
  await expect(page.locator('#feedback-bloqueios')).toContainText('criado');
  expect(estado.escritas[1].body).toEqual({ inicio: bloqueio.inicio_utc, fim: bloqueio.fim_utc, motivo: 'Manutenção' });
  expect(estado.csrf).toBe(1);
});
test('cancelamento de bloqueio exige confirmação e remove ação do cancelado', async ({ page }) => {
  const estado = await abrir(page); await editarSala(page);
  await page.getByRole('button', { name: 'Cancelar bloqueio #11', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar cancelamento' }).click(); expect(estado.escritas).toHaveLength(0);
  await page.getByLabel('Confirmo o cancelamento deste bloqueio.').check(); await page.getByRole('button', { name: 'Confirmar cancelamento' }).click();
  await expect(page.locator('#lista-bloqueios')).toContainText('Cancelado'); await expect(page.getByRole('button', { name: 'Cancelar bloqueio #11', exact: true })).toHaveCount(0);
  expect(estado.escritas[0].path).toBe('/api/bloqueios/11/cancelamento');
});
test('expediente preserva todas as janelas e nanossegundos sem arredondamento', async ({ page }) => {
  const estado = await abrir(page);
  await expect(page.locator('#janelas .schedule-row')).toHaveCount(2);
  await page.getByLabel('Confirmo a substituição', { exact: false }).check(); await page.getByRole('button', { name: 'Salvar expediente' }).click();
  await expect(page.locator('#feedback-expediente')).toContainText('Expediente atualizado');
  expect(estado.escritas[0].body).toEqual({ janelas });
});
test('expediente vazio exige confirmação e deixa fechamento explícito', async ({ page }) => {
  const estado = await abrir(page); await page.getByRole('button', { name: 'Remover janela' }).first().click(); await page.getByRole('button', { name: 'Remover janela' }).click();
  await expect(page.locator('#resumo-janelas')).toContainText('ficará fechado');
  await page.getByRole('button', { name: 'Salvar expediente' }).click(); expect(estado.escritas).toHaveLength(0);
  await page.getByLabel('Confirmo a substituição', { exact: false }).check(); await page.getByRole('button', { name: 'Salvar expediente' }).click();
  await expect(page.locator('#feedback-expediente')).toContainText('funcionamento fechado'); expect(estado.escritas[0].body).toEqual({ janelas: [] });
});
test('expediente com sobreposição não envia; 409 conserva a edição', async ({ page }) => {
  const estado = await abrir(page, { erroEscrita: 409 });
  await page.getByRole('button', { name: 'Adicionar janela' }).click(); const row = page.locator('.schedule-row').last();
  await row.getByLabel('Abre às').fill('09:00'); await row.getByLabel('Fecha às').fill('11:00');
  await page.getByLabel('Confirmo a substituição', { exact: false }).check(); await page.getByRole('button', { name: 'Salvar expediente' }).click();
  await expect(page.locator('#feedback-expediente')).toContainText('sobrepor'); expect(estado.escritas).toHaveLength(0);
  await row.getByLabel('Dia da semana').selectOption('TUESDAY'); await page.getByLabel('Confirmo a substituição', { exact: false }).check(); await page.getByRole('button', { name: 'Salvar expediente' }).click();
  await expect(page.locator('#feedback-expediente')).toContainText('Não foi possível alterar'); await expect(row.getByLabel('Abre às')).toHaveValue('09:00'); expect(estado.escritas).toHaveLength(1);
});
test('falha de leitura do expediente impede salvar e permite recuperação por GET', async ({ page }) => {
  const estado = await preparar(page, { erroExpediente: true }); await page.goto(rota);
  await expect(page.locator('#feedback-expediente')).toContainText('indisponível'); await expect(page.locator('#form-expediente')).toBeHidden();
  estado.erroExpediente = false; await page.getByRole('button', { name: 'Recarregar expediente' }).click();
  await expect(page.locator('#form-expediente')).toBeVisible(); expect(estado.escritas).toEqual([]);
});
test('duplo envio mantém uma escrita e controles bloqueados até resposta', async ({ page }) => {
  const estado = await abrir(page); await novaSala(page); let liberar; estado.esperar = new Promise((r) => { liberar = r; });
  await enviarCadastro(page); await expect(page.locator('#form-cadastro')).toHaveAttribute('aria-busy', 'true');
  await page.locator('#form-cadastro').dispatchEvent('submit'); expect(estado.escritas).toHaveLength(1);
  await expect(page.locator('#controles-admin')).toHaveAttribute('disabled');
  await expect(page.getByRole('button', { name: 'Novo recurso', exact: true })).toBeDisabled(); liberar();
  await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo'); await expect(page.locator('#controles-admin')).not.toHaveAttribute('disabled'); expect(estado.escritas).toHaveLength(1);
});
for (const problema of ['rede', 'respostaInvalida']) {
  test(problema + ' mantém cadastro sem sucesso falso nem retry', async ({ page }) => {
    const estado = await abrir(page, { [problema]: true }); await novaSala(page); await enviarCadastro(page);
    await expect(page.locator('#feedback-cadastro')).toContainText('confirmar'); await expect(page.locator('#cad-codigo')).toHaveValue('SALA-NOVA');
    await expect(page.locator('#controles-admin')).not.toHaveAttribute('disabled'); expect(estado.escritas).toHaveLength(1);
  });
}
test('403 não repete escrita e nova ação explícita renova token', async ({ page }) => {
  const estado = await abrir(page, { erroEscrita: 403 }); await novaSala(page); await enviarCadastro(page);
  await expect(page.locator('#referencia-cadastro')).toBeVisible(); expect(estado.escritas).toHaveLength(1);
  estado.erroEscrita = null; await enviarCadastro(page); await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo');
  expect(estado.escritas).toHaveLength(2); expect(estado.csrf).toBe(2);
});
test('textos da API são literais e página cabe em desktop/móvel', async ({ page }, info) => {
  const itens = copiar([sala, docente, material]); itens[0].dados.codigo = '<img src=x onerror=alert(1)>';
  const estado = await abrir(page, { itens }); await expect(page.locator('#lista-admin img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Gerenciar <img src=x onerror=alert(1)>', exact: true }).click();
  await expect(page.locator('#editor-title')).toContainText('<img'); await expect(page.locator('#controles-admin')).not.toHaveAttribute('disabled');
  await expect(page.locator('#painel img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator('#editor-recurso').scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('cadastro.png'), fullPage: true });
  expect(estado.inesperadas).toEqual([]);
});

test('desativação via edição também exige confirmação identificada', async ({ page }) => {
  const estado = await abrir(page); await editarSala(page); await page.getByLabel('Recurso ativo', { exact: true }).uncheck(); await enviarCadastro(page);
  await expect(page.locator('#feedback-cadastro')).toContainText('Confirme a desativação'); expect(estado.escritas).toHaveLength(0);
  await page.getByLabel('Confirmo a desativação', { exact: false }).check(); await enviarCadastro(page);
  await expect(page.locator('#feedback-cadastro')).toContainText('Recurso salvo'); expect(estado.escritas[0].body.ativo).toBe(false);
});

test('capturas administrativas usam somente dados fictícios', async ({ page }, info) => {
  const estado = await abrir(page); await page.screenshot({ path: info.outputPath('gestao.png'), fullPage: true });
  await editarSala(page); await page.screenshot({ path: info.outputPath('edicao.png'), fullPage: true });
  await page.locator('#form-expediente').scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('expediente.png'), fullPage: false });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(estado.inesperadas).toEqual([]);
});

test('falha de pesquisa encerra carregamento e permite recuperação explícita', async ({ page }) => {
  const estado = await abrir(page, { erroPesquisa: true });
  await expect(page.locator('#feedback-busca')).toContainText('Consulta indisponível');
  await expect(page.locator('#resumo-admin')).toContainText('Consulta não concluída');
  await expect(page.locator('#lista-admin .admin-row')).toHaveCount(0);
  estado.erroPesquisa = false; await page.getByRole('button', { name: 'Consultar cadastros' }).click();
  await expect(page.locator('#lista-admin .admin-row')).toHaveCount(3); expect(estado.escritas).toEqual([]);
});

test('bloqueio confirmado com falha de atualização mantém aviso de consulta sem repetir POST', async ({ page }) => {
  const estado = await abrir(page); await editarSala(page); estado.erroBloqueios = true;
  await page.getByLabel('Início do bloqueio *').fill('2026-11-11T13:00'); await page.getByLabel('Fim do bloqueio *').fill('2026-11-13T14:00');
  await page.getByLabel('Motivo *', { exact: true }).fill('Manutenção'); await page.getByRole('button', { name: 'Criar bloqueio' }).click();
  await expect(page.locator('#resumo-bloqueios')).toContainText('criado. Atualize');
  await expect(page.locator('#feedback-bloqueios')).toContainText('Bloqueios indisponíveis');
  expect(estado.escritas).toHaveLength(1); estado.erroBloqueios = false;
  await page.getByRole('button', { name: 'Atualizar bloqueios' }).click();
  await expect(page.locator('#lista-bloqueios .admin-row')).toHaveCount(2); expect(estado.escritas).toHaveLength(1);
});
