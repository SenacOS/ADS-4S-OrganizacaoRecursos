/** @typedef {import('./auth.js').Usuario} Usuario */

export const rotulosPapel = {
  SOLICITANTE: 'Solicitante', RESPONSAVEL: 'Responsável', ADMINISTRADOR: 'Administrador',
};

/** Áreas previstas no plano; ainda sem rotas implementadas.
 * @param {Usuario} usuario */
export function areasDoPerfil(usuario) {
  const areas = [
    { titulo: 'Disponibilidade', descricao: 'Encontre salas, docentes e materiais para o período que precisa.' },
    { titulo: 'Minhas reservas', descricao: 'Organize seus pedidos e acompanhe cada etapa da reserva.' },
  ];
  if (usuario.papel === 'RESPONSAVEL') {
    areas.push({ titulo: 'Aprovações', descricao: 'Avalie solicitações de recursos restritos.' });
  }
  if (usuario.papel === 'ADMINISTRADOR') {
    areas.push({ titulo: 'Gerenciar recursos', descricao: 'Cuide dos cadastros e dos períodos de manutenção.' });
  }
  if (usuario.papel === 'RESPONSAVEL' || usuario.papel === 'ADMINISTRADOR') {
    areas.push({ titulo: 'Movimentações', descricao: 'Acompanhe materiais retirados e devoluções pendentes.' });
  }
  return areas;
}
