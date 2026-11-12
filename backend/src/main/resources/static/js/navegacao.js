/** @typedef {import('./auth.js').Usuario} Usuario */

export const rotulosPapel = {
  SOLICITANTE: 'Solicitante', RESPONSAVEL: 'Responsável', ADMINISTRADOR: 'Administrador',
};

/** Áreas previstas no plano; apenas fluxos já implementados recebem links.
 * @param {Usuario} usuario */
export function areasDoPerfil(usuario) {
  /** @type {{titulo: string, descricao: string, href?: string}[]} */
  const areas = [
    { titulo: 'Disponibilidade', descricao: 'Encontre salas, docentes e materiais para o período que precisa.', href: '/pages/recursos.html' },
    { titulo: 'Nova reserva', descricao: 'Escolha um período e solicite os recursos disponíveis.', href: '/pages/reservas.html' },
  ];
  if (usuario.papel === 'RESPONSAVEL') {
    areas.push({ titulo: 'Aprovações', descricao: 'Avalie solicitações de recursos restritos.', href: '/pages/aprovacoes.html' });
  }
  if (usuario.papel === 'ADMINISTRADOR') {
    areas.push({ titulo: 'Gerenciar recursos', descricao: 'Cuide dos cadastros e dos períodos de manutenção.', href: '/pages/gestao-recursos.html' });
  }
  if (usuario.papel === 'RESPONSAVEL' || usuario.papel === 'ADMINISTRADOR') {
    areas.push({ titulo: 'Movimentações', descricao: 'Acompanhe materiais retirados e devoluções pendentes.', href: '/pages/movimentacoes.html' });
  }
  return areas;
}

/** @param {Usuario} usuario @param {string} atual */
export function preencherNavegacao(usuario, atual) {
  const lista = document.getElementById('navegacao');
  if (!lista) throw new Error('Navegação ausente.');
  lista.replaceChildren();
  const areas = [{ titulo: 'Início', href: '/index.html' }, ...areasDoPerfil(usuario)];
  for (const area of areas) {
    const item = document.createElement('li');
    const rotulo = document.createElement(area.href ? 'a' : 'span');
    rotulo.className = 'nav-item';
    rotulo.textContent = area.titulo;
    if (rotulo instanceof HTMLAnchorElement && area.href) rotulo.href = area.href;
    if (!area.href) {
      rotulo.setAttribute('role', 'link');
      rotulo.setAttribute('aria-disabled', 'true');
      rotulo.setAttribute('aria-label', area.titulo + ' — em breve');
    } else if (area.titulo === atual) rotulo.setAttribute('aria-current', 'page');
    item.append(rotulo);
    lista.append(item);
  }
}
