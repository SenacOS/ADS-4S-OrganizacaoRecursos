/**
 * @typedef {{method?: string, body?: object|string|URLSearchParams,
 * correlationId?: string}} OpcoesRequisicao
 * @typedef {{token: string, header: string}} Csrf
 */

export class ErroApi extends Error {
  /** @param {number} status @param {string} codigo @param {string} mensagem
   * @param {string|null} [correlationId] */
  constructor(status, codigo, mensagem, correlationId = null) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.codigo = codigo;
    this.correlationId = correlationId;
  }
}

/** @param {unknown} erro */
export function apresentarErro(erro) {
  return erro instanceof ErroApi
    ? { mensagem: erro.message, referencia: erro.correlationId }
    : { mensagem: 'Não foi possível concluir a operação.', referencia: null };
}

/**
 * Injete fetch somente em testes isolados. Não acessa cookies nem localStorage.
 * @param {{fetchImpl?: typeof fetch, aoExpirarSessao?: () => void}} [config]
 */
export function criarApi({
  fetchImpl = globalThis.fetch.bind(globalThis),
  aoExpirarSessao = () => {
    if (globalThis.location.pathname !== '/login.html') {
      globalThis.location.replace('/login.html?sessao=expirada');
    }
  },
} = {}) {
  /** @type {Promise<Csrf>|undefined} */
  let csrfPendente;

  function limparCsrf() {
    csrfPendente = undefined;
  }

  /** @returns {Promise<Csrf>} */
  async function obterCsrf() {
    if (!csrfPendente) {
      csrfPendente = requisitar('/api/auth/csrf').then((dados) => {
        if (!dados || typeof dados.token !== 'string' || !dados.token
          || typeof dados.header !== 'string' || !dados.header) {
          throw new ErroApi(0, 'RESPOSTA_INVALIDA', 'Não foi possível preparar o envio. Atualize a página.');
        }
        // Headers também valida nomes e valores recebidos do servidor.
        new Headers({ [dados.header]: dados.token });
        return dados;
      }).catch((erro) => {
        limparCsrf();
        throw erro;
      });
    }
    return csrfPendente;
  }

  /**
   * @param {string} caminho
   * @param {OpcoesRequisicao} [opcoes]
   * @returns {Promise<any>} DTO JSON definido pelo contrato de cada serviço.
   */
  async function requisitar(caminho, { method = 'GET', body, correlationId } = {}) {
    const url = new URL(caminho, 'https://mesma-origem.invalid');
    if (!caminho.startsWith('/api/') || caminho.includes('\\')
      || url.origin !== 'https://mesma-origem.invalid' || !url.pathname.startsWith('/api/')) {
      throw new Error('Use um caminho /api/ da mesma origem.');
    }
    const metodo = method.toUpperCase();
    const headers = new Headers({ Accept: 'application/json' });
    if (correlationId !== undefined) {
      if (!/^[A-Za-z0-9._-]{1,64}$/.test(correlationId)) {
        throw new Error('Identificador de correlação inválido.');
      }
      headers.set('X-Correlation-Id', correlationId);
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(metodo)) {
      const csrf = await obterCsrf();
      headers.set(csrf.header, csrf.token);
    }
    /** @type {string|undefined} */
    let conteudo;
    if (body instanceof URLSearchParams) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      conteudo = body.toString();
    } else if (body !== undefined) {
      headers.set('Content-Type', 'application/json');
      conteudo = JSON.stringify(body);
    }
    /** @type {Response} */
    let resposta;
    /** @type {string} */
    let texto;
    try {
      resposta = await fetchImpl(url.pathname + url.search, {
        method: metodo, credentials: 'same-origin', headers, body: conteudo,
        cache: 'no-store', redirect: 'error',
      });
      texto = resposta.status === 204 ? '' : await resposta.text();
    } catch {
      // Uma falha de rede pode ocorrer depois do commit: nunca repetir a escrita.
      throw new ErroApi(0, 'FALHA_DE_REDE',
        'Não foi possível confirmar a operação. Verifique sua conexão e confira o resultado antes de reenviar.');
    }
    /** @type {any} */
    let dados = null;
    if (texto) {
      try { dados = JSON.parse(texto); } catch { /* Não mostrar HTML/stack trace. */ }
    }
    if (!resposta.ok) {
      const erro = new ErroApi(resposta.status,
        typeof dados?.codigo === 'string' ? dados.codigo : 'RESPOSTA_INESPERADA',
        typeof dados?.mensagem === 'string' ? dados.mensagem : 'Não foi possível concluir a operação.',
        typeof dados?.correlationId === 'string' ? dados.correlationId : null);
      if (resposta.status === 403) limparCsrf();
      if (resposta.status === 401 && erro.codigo === 'NAO_AUTENTICADO') {
        limparCsrf();
        aoExpirarSessao();
      }
      throw erro;
    }
    if (resposta.status !== 204 && (dados === null || !texto)) {
      throw new ErroApi(resposta.status, 'RESPOSTA_INVALIDA', 'O servidor retornou uma resposta inesperada.');
    }
    return dados;
  }
  return { requisitar, limparCsrf };
}

// Um cliente compartilhado entre todos os serviços da página.
export const api = criarApi();
