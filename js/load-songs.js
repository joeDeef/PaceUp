import { canciones } from '../data/songs.js';
import { createCard } from './create-card.js';
import { loadSearchBar } from './load-search-bar.js';

export async function cargarCanciones() {
  const contenedor = document.getElementById('nivel-content');
  contenedor.innerHTML = '';

  // Carga el HTML del componente canciones
  const res = await fetch('./components/songs.html');
  const html = await res.text();
  contenedor.innerHTML = html;

  // Carga barra de búsqueda
  const searchContainer = document.getElementById('search-bar-container');
  await loadSearchBar(searchContainer);

  // Obtiene template y contenedores
  const template = document.getElementById('card-template');
  const carrusel = document.getElementById('carrusel-populares');
  const lista = document.getElementById('lista-canciones');

  // Inserta primeras 5 canciones en carrusel
  canciones.slice(0, 5).forEach(cancion => {
    const { fragment, cardElement } = createCard(
      {
        ...cancion,
        onClick: () => window.open(cancion.link, '_blank')
      },
      template
    );
    carrusel.appendChild(fragment);

    // Agrega evento para botón play dentro de la card
    const btnPlay = cardElement.querySelector('.btn-play');
    btnPlay.addEventListener('click', e => {
      e.stopPropagation(); // Evita que el click propague y abra dos veces
      window.open(cancion.link, '_blank');
    });
  });

  // Inserta resto de canciones en lista
  canciones.slice(5).forEach(cancion => {
    const { fragment, cardElement } = createCard(
      {
        ...cancion,
        onClick: () => window.open(cancion.link, '_blank')
      },
      template
    );
    lista.appendChild(fragment);

    // Botón play en lista
    const btnPlay = cardElement.querySelector('.btn-play');
    btnPlay.addEventListener('click', e => {
      e.stopPropagation();
      window.open(cancion.link, '_blank');
    });
  });

  // Control botones del carrusel
  let scrollAmount = 0;
  const cardWidth = 210; // aprox ancho card + gap
  const visibleCards = 3; // número de cards visibles a la vez

  const prevBtn = document.querySelector('.carrusel-btn.prev');
  const nextBtn = document.querySelector('.carrusel-btn.next');

  prevBtn.addEventListener('click', () => {
    scrollAmount = Math.max(scrollAmount - cardWidth, 0);
    carrusel.style.transform = `translateX(-${scrollAmount}px)`;
  });

  nextBtn.addEventListener('click', () => {
    const maxScroll = (canciones.slice(0, 5).length - visibleCards) * cardWidth;
    scrollAmount = Math.min(scrollAmount + cardWidth, maxScroll);
    carrusel.style.transform = `translateX(-${scrollAmount}px)`;
  });
}
