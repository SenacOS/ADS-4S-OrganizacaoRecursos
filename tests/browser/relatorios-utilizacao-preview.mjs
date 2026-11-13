// Facilitador manual de testes. API e sessão fictícias só neste servidor local;
// nunca usado pelo frontend Spring nem como fallback de produção.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parametrosUtilizacao } from '../../backend/src/main/resources/static/js/relatorios-utilizacao.js';
import { instanteComPrecisao as instante } from '../../backend/src/main/resources/static/js/datas.js';

const root = fileURLToPath(new URL('../../backend/src/main/resources/static/', import.meta.url));
const port = 4174;
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const ids = [1, 2, 3];
const inicioReserva = instante('2026-11-17T10:00:00-03:00');
const fimReserva = instante('2026-11-17T11:00:00-03:00');
const momentoConflito = instante('2026-11-17T10:30:00-03:00');

/** Fixture didática: uma reserva com três recursos e um conflito no recurso2.
 * Nenhum acesso a banco, sessão real ou credenciais. @param {URL} url */
function demonstracao(url) {
  const inicio = url.searchParams.get('inicio') ?? '', fim = url.searchParams.get('fim') ?? '';
  const recursoId = url.searchParams.has('recursoId') ? Number(url.searchParams.get('recursoId')) : undefined;
  parametrosUtilizacao({ inicio, fim, recursoId });
  const a = instante(inicio), b = instante(fim);
  const inicioRecortado = a > inicioReserva ? a : inicioReserva;
  const fimRecortado = b < fimReserva ? b : fimReserva;
  const elegivel = fimRecortado > inicioRecortado && (recursoId === undefined || ids.includes(recursoId));
  const nanos = elegivel ? fimRecortado - inicioRecortado : 0n;
  const fracao = (nanos % 1000000000n).toString().padStart(9, '0').replace(/0+$/, '');
  const duracao = 'PT' + (nanos / 1000000000n) + (fracao ? '.' + fracao : '') + 'S';
  return { periodo: { inicio, fim }, recursoId: recursoId ?? null,
    estadosConsiderados: ['APROVADA', 'EM_USO', 'CONCLUIDA'], reservasConsideradas: elegivel ? 1 : 0,
    duracaoReservada: duracao,
    porRecurso: elegivel ? (recursoId === undefined ? ids : [recursoId])
      .map(id => ({ recursoId: id, duracaoAlocada: duracao })) : [],
    conflitosEvitados: momentoConflito >= a && momentoConflito < b && (recursoId === undefined || recursoId === 2) ? 1 : 0 };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:' + port);
  const json = (status, dados) => {
    response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify(dados));
  };
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      return json(200, { usuarioId: 7, email: 'demonstracao@example.test', papel: 'ADMINISTRADOR' });
    }
    if (url.pathname === '/api/auth/csrf' && request.method === 'GET') {
      return json(200, { header: 'X-CSRF-DEMONSTRACAO', token: 'somente-previa-local' });
    }
    if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
      response.writeHead(204).end(); return;
    }
    if (url.pathname === '/api/relatorios/utilizacao' && request.method === 'GET') {
      try { return json(200, demonstracao(url)); }
      catch { return json(400, { codigo: 'REQUISICAO_INVALIDA', mensagem: 'Confira os filtros da demonstração.', correlationId: 'previa-simulada' }); }
    }
    return json(404, { codigo: 'NAO_ENCONTRADO', mensagem: 'Operação fora desta prévia com dados simulados.', correlationId: 'previa-simulada' });
  }
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
  try {
    const path = url.pathname === '/' ? '/pages/relatorios-utilizacao.html' : decodeURIComponent(url.pathname);
    const file = resolve(root, '.' + path);
    if (!file.startsWith(resolve(root) + sep)) { response.writeHead(403).end(); return; }
    let content = await readFile(file);
    if (path === '/pages/relatorios-utilizacao.html') content = content.toString('utf8').replace(
      /<p class="feedback preview-notice">[\s\S]*?<\/p>/,
      '<p class="feedback preview-notice"><strong>Dados simulados — prévia local.</strong> Sessão e relatório fictícios, sem acesso ao banco. Exemplo: 17/11/2026, 10h–11h; recursos 1, 2 e 3. Não é integração real.</p>');
    response.writeHead(200, { 'Content-Type': (tipos[extname(file)] ?? 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { response.writeHead(404).end('Arquivo não encontrado.'); }
});
server.listen(port, '127.0.0.1', () => console.log('DADOS SIMULADOS: http://127.0.0.1:' + port + '/pages/relatorios-utilizacao.html'));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
