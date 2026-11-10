import { api } from './api.js';

/** @typedef {{usuarioId: number, email: string,
 * papel: 'SOLICITANTE'|'RESPONSAVEL'|'ADMINISTRADOR'}} Usuario */

/** @param {typeof api} [cliente] */
export function criarAuth(cliente = api) {
  return {
    /** @param {string} email @param {string} senha */
    async login(email, senha) {
      await cliente.requisitar('/api/auth/login', {
        method: 'POST', body: new URLSearchParams({ email, senha }),
      });
      cliente.limparCsrf();
    },
    async logout() {
      await cliente.requisitar('/api/auth/logout', { method: 'POST' });
      cliente.limparCsrf();
    },
    /** @returns {Promise<Usuario>} */
    me() {
      return cliente.requisitar('/api/auth/me');
    },
  };
}

/** Conveniência visual; a autorização real é feita pelo backend.
 * @param {Usuario|null} usuario */
export function podeAprovar(usuario) {
  return usuario?.papel === 'RESPONSAVEL';
}

export const auth = criarAuth();
