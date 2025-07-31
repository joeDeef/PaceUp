
import { createCard } from "./create-card.js";
import { loadSearchBar } from "./load-search-bar.js";
import { cargarVideo } from "./load-song-game.js";

// Extraer ID del video de YouTube desde la URL
function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

export async function cargarCanciones(nivelActual) {
  // Cargar canciones desde JSON
  let canciones = [];
  const resCanciones = await fetch("../data/songs.json");
  canciones = await resCanciones.json();

  const contenedor = document.getElementById("nivel-content");
  contenedor.innerHTML = "";

  const res = await fetch("../components/songs.html");
  const html = await res.text();
  contenedor.innerHTML = html;

  const searchContainer = document.getElementById("search-bar-container");
  await loadSearchBar(searchContainer);

  const template = document.getElementById("card-template");
  const carrusel = document.getElementById("carrusel-populares");
  const lista = document.getElementById("lista-canciones");

  // Ordenar por popularidad descendente y tomar las 5 más altas
  const populares = canciones
    .filter((c) => c.popularityRank >= 0)
    .sort((a, b) => b.popularityRank - a.popularityRank)
    .slice(0, 5);

  populares.forEach((cancion, idx) => {
    const { fragment, cardElement } = createCard(
      {
        ...cancion,
        image: `https://img.youtube.com/vi/${extractVideoId(cancion.link)}/mqdefault.jpg`,
        onClick: () => {
          cargarVideo(nivelActual, cancion.id);
        },
      },
      template
    );
    carrusel.appendChild(fragment);

    // Accesibilidad: activar con Enter en cualquier parte de la tarjeta
    const focusables = [
      cardElement.querySelector('.card-title'),
      cardElement.querySelector('.card-image'),
      cardElement.querySelector('.btn-play'),
      cardElement.querySelector('.card-description')
    ];
    focusables.forEach(el => {
      if (el) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            cargarVideo(nivelActual, cancion.id);
          }
        });
      }
    });

    // Click en botón play
    const btnPlay = cardElement.querySelector(".btn-play");
    btnPlay.addEventListener("click", (e) => {
      e.stopPropagation();
      cargarVideo(nivelActual, cancion.id);
    });
  });

  // Las restantes que no están en el carrusel
  const restantes = canciones.filter((c) => !populares.includes(c));

  restantes.forEach((cancion) => {
    const { fragment, cardElement } = createCard(
      {
        ...cancion,
        image: `https://img.youtube.com/vi/${extractVideoId(cancion.link)}/mqdefault.jpg`,
        onClick: () => {
          cargarVideo(nivelActual, cancion.id);
        },
      },
      template
    );
    lista.appendChild(fragment);

    // Accesibilidad: activar con Enter en cualquier parte de la tarjeta
    const focusables = [
      cardElement.querySelector('.card-title'),
      cardElement.querySelector('.card-image'),
      cardElement.querySelector('.btn-play'),
      cardElement.querySelector('.card-description')
    ];
    focusables.forEach(el => {
      if (el) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            cargarVideo(nivelActual, cancion.id);
          }
        });
      }
    });

    const btnPlay = cardElement.querySelector(".btn-play");
    btnPlay.addEventListener("click", (e) => {
      e.stopPropagation();
      cargarVideo(nivelActual, cancion.id);
    });
  });

  // Botones carrusel
  let scrollAmount = 0;
  const cardWidth = 210;
  const visibleCards = 3;

  const prevBtn = document.querySelector(".carrusel-btn.prev");
  const nextBtn = document.querySelector(".carrusel-btn.next");

  prevBtn.addEventListener("click", () => {
    scrollAmount = Math.max(scrollAmount - cardWidth, 0);
    carrusel.style.transform = `translateX(-${scrollAmount}px)`;
  });

  nextBtn.addEventListener("click", () => {
    const maxScroll = (populares.length - visibleCards) * cardWidth;
    scrollAmount = Math.min(scrollAmount + cardWidth, maxScroll);
    carrusel.style.transform = `translateX(-${scrollAmount}px)`;
  });

  // Accesibilidad: navegación con flechas en el carrusel
  const carruselCards = carrusel.querySelectorAll('.card');
  carruselCards.forEach((card, idx) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.keyCode === 39) {
        e.preventDefault();
        const next = carruselCards[idx + 1];
        if (next) next.focus();
      } else if (e.key === 'ArrowLeft' || e.keyCode === 37) {
        e.preventDefault();
        const prev = carruselCards[idx - 1];
        if (prev) prev.focus();
      }
    });
  });

  // Accesibilidad: navegación con flechas en la lista de canciones
  const listaCards = lista.querySelectorAll('.card');
  listaCards.forEach((card, idx) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.keyCode === 39) {
        e.preventDefault();
        const next = listaCards[idx + 1];
        if (next) next.focus();
      } else if (e.key === 'ArrowLeft' || e.keyCode === 37) {
        e.preventDefault();
        const prev = listaCards[idx - 1];
        if (prev) prev.focus();
      }
    });
  });
}
