
import { createCard } from "./create-card.js";
import { loadSearchBar } from "./load-search-bar.js";
import { cargarVideo } from "./load-song-game.js";
let canciones = [];

// Extraer ID del video de YouTube desde la URL
function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

  const contenedor = document.getElementById("nivel-content");
  contenedor.innerHTML = "";

  // Cargar canciones desde JSON
  if (canciones.length === 0) {
    const resCanciones = await fetch("./data/songs.json");
    canciones = await resCanciones.json();
  }

  const res = await fetch("./components/songs.html");
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

  populares.forEach((cancion) => {
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
