import { areasDoPerfil, rotulosPapel } from './navegacao.js';
import { iniciarPaginaAutenticada } from './sessao-page.js';
import { elemento } from './ui.js';

iniciarPaginaAutenticada('Início', (usuario) => {
  elemento('usuario-email').textContent = usuario.email;
  elemento('usuario-perfil').textContent = rotulosPapel[usuario.papel];
  const areas = elemento('areas-perfil');
  areas.replaceChildren();
  areasDoPerfil(usuario).forEach((area, i) => {
    const card = document.createElement('article');
    card.className = 'area-card';
    const marcador = document.createElement('span');
    marcador.className = 'area-number';
    marcador.setAttribute('aria-hidden', 'true');
    marcador.textContent = String(i + 1).padStart(2, '0');
    const titulo = document.createElement('h3');
    titulo.textContent = area.titulo;
    const descricao = document.createElement('p');
    descricao.textContent = area.descricao;
    const estado = document.createElement(area.href ? 'a' : 'span');
    estado.className = area.href ? 'button button-secondary' : 'soon-label';
    estado.textContent = area.href ? 'Acessar' : 'Em breve';
    if (estado instanceof HTMLAnchorElement && area.href) {
      estado.href = area.href;
      estado.setAttribute('aria-label', 'Acessar ' + area.titulo);
    }
    card.append(marcador, titulo, descricao, estado);
    areas.append(card);
  });
});
