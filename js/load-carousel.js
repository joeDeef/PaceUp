import { createCard } from "./create-card.js";
import { cardsData } from "../data/levels.js";

// Carga las plantillas HTML para tarjetas y carrusel
async function loadTemplates() {
  // Carga en paralelo las plantillas card.html y carousel.html
  const [cardHTML, carouselHTML] = await Promise.all([
    fetch("./components/card.html").then((res) => res.text()),
    fetch("./components/carousel.html").then((res) => res.text()),
  ]);

  // Inserta las plantillas en el body para poder usarlas luego
  document.body.insertAdjacentHTML("beforeend", cardHTML);
  document.body.insertAdjacentHTML("beforeend", carouselHTML);
}

// Inicializa el carrusel y sus eventos
async function initCarousel() {
  // Espera a que las plantillas se carguen e inserten en el DOM
  await loadTemplates();

  // Obtiene la plantilla de tarjeta y el contenedor del carrusel
  const cardTemplate = document.getElementById("card-template");
  const wrapper = document.getElementById("carousel-wrapper");

  // Clona la plantilla del carrusel y la añade al wrapper
  const carouselTemplate = document.getElementById("carousel-template");
  const carouselNode = carouselTemplate.content.cloneNode(true);
  wrapper.appendChild(carouselNode);

  // Obtiene elementos clave del carrusel y los botones de navegación
  const carousel = document.getElementById("carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  const cardElements = [];

  // Por cada dato en cardsData crea una tarjeta, le asigna evento click y la añade al carrusel
  cardsData.forEach((data, index) => {
    const { fragment, cardElement } = createCard(
      {
        ...data,
        onClick: () => {
          if (cardElement.classList.contains("active")) {
            window.location.href = `level.html?nivel=${data.nivelId}`;
          } else {
            setActiveCard(index);
          }
        },
      },
      cardTemplate
    );

    cardElements.push(cardElement);
    carousel.appendChild(fragment); // Inserta el fragmento completo
  });

  let currentIndex = 0;

  // Función para módulo que soporta números negativos (índice circular)
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  // Actualiza las clases CSS para las tarjetas según la activa y su posición relativa
  function updateCarousel() {
    const len = cardElements.length;

    cardElements.forEach((card, index) => {
      card.className = "card"; // Resetea las clases para limpiar estados previos

      const diff = mod(index - currentIndex, len);

      // Asigna clases de posición según la distancia a la tarjeta activa
      if (diff === 0) {
        card.classList.add("active");
      } else if (diff === 1) {
        card.classList.add("right");
      } else if (diff === 2) {
        card.classList.add("right-2");
      } else if (diff === len - 1) {
        card.classList.add("left");
      } else if (diff === len - 2) {
        card.classList.add("left-2");
      }
    });
  }

  // Cambia la tarjeta activa al índice dado y actualiza la vista
  function setActiveCard(index) {
    const len = cardElements.length;
    currentIndex = mod(index, len);
    updateCarousel();
  }

  // Eventos para navegar entre tarjetas con botones
  prevBtn.addEventListener("click", () => setActiveCard(currentIndex - 1));
  nextBtn.addEventListener("click", () => setActiveCard(currentIndex + 1));

  // Eventos para navegar entre tarjetas con teclas izquierda/derecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  // Inicializa la vista del carrusel actualizando clases
  updateCarousel();
}

// Llama a la función para inicializar todo
initCarousel();
