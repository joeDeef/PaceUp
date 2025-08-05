import { createCard } from "./create-card.js";
import { loadSearchBar } from "./load-search-bar.js";
import { cargarVideo } from "./load-song-game.js";
import { actualizarVista } from "./level-main.js";

function extractVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

export async function cargarCanciones(nivelActual, idSeleccionado = null) {
  let canciones = [];
  const resCanciones = await fetch("data/songs.json");
  canciones = await resCanciones.json();

  const contenedor = document.getElementById("nivel-content");
  contenedor.innerHTML = "";

  // ⚠️ Mostrar directamente la canción si hay un idSeleccionado
  if (idSeleccionado) {
    cargarVideo(nivelActual, idSeleccionado);
    return; // Salimos para no mostrar la lista
  }

  const res = await fetch("components/songs.html");
  const html = await res.text();
  contenedor.innerHTML = html;

  const searchContainer = document.getElementById("search-bar-container");
  await loadSearchBar(searchContainer, "cards");

  const template = document.getElementById("card-template");
  const carrusel = document.getElementById("carrusel-populares");
  const lista = document.getElementById("lista-canciones");

  const populares = canciones
    .filter((c) => c.popularityRank >= 0)
    .sort((a, b) => b.popularityRank - a.popularityRank)
    .slice(0, 5);

  const renderCancion = (cancion, destino) => {
    const { fragment, cardElement } = createCard(
      {
        ...cancion,
        image: `https://img.youtube.com/vi/${extractVideoId(cancion.link)}/mqdefault.jpg`,
        onClick: () => actualizarVista(nivelActual, "canciones", cancion.id),
      },
      template
    );

    destino.appendChild(fragment);

    const focusables = [
      cardElement.querySelector(".card-title"),
      cardElement.querySelector(".card-image"),
      cardElement.querySelector(".btn-play"),
      cardElement.querySelector(".card-description"),
    ];
    focusables.forEach((el) => {
      if (el) {
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            actualizarVista(nivelActual, "canciones", cancion.id);
          }
        });
      }
    });

    const btnPlay = cardElement.querySelector(".btn-play");
    btnPlay.addEventListener("click", (e) => {
      e.stopPropagation();
      actualizarVista(nivelActual, "canciones", cancion.id);
    });
  };

  // Renderizar canciones populares
  populares.forEach((cancion) => renderCancion(cancion, carrusel));

  // Renderizar las restantes
  const restantes = canciones.filter((c) => !populares.includes(c));
  restantes.forEach((cancion) => renderCancion(cancion, lista));

  // Carrusel navegación
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

  // Accesibilidad: navegación con flechas
  const addArrowNavigation = (cards) => {
    cards.forEach((card, idx) => {
      card.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.keyCode === 39) {
          e.preventDefault();
          const next = cards[idx + 1];
          if (next) next.focus();
        } else if (e.key === "ArrowLeft" || e.keyCode === 37) {
          e.preventDefault();
          const prev = cards[idx - 1];
          if (prev) prev.focus();
        }
      });
    });
  };

  addArrowNavigation(carrusel.querySelectorAll(".card"));
  addArrowNavigation(lista.querySelectorAll(".card"));
}
