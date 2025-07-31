import { createCard } from "./create-card.js";

// Carga las plantillas HTML para tarjetas y carrusel
async function loadTemplates() {
  const [cardHTML, carouselHTML] = await Promise.all([
    fetch("./components/card.html").then((res) => res.text()),
    fetch("./components/carousel.html").then((res) => res.text()),
  ]);
  document.body.insertAdjacentHTML("beforeend", cardHTML);
  document.body.insertAdjacentHTML("beforeend", carouselHTML);
}

// Carga los datos de niveles desde un archivo JSON
async function loadLevelsData() {
  const response = await fetch("../data/levels.json");
  return await response.json();
}

// Inicializa el carrusel y sus eventos
async function initCarousel() {
  await loadTemplates();

  const cardsData = await loadLevelsData();

  const cardTemplate = document.getElementById("card-template");
  const wrapper = document.getElementById("carousel-wrapper");

  const carouselTemplate = document.getElementById("carousel-template");
  const carouselNode = carouselTemplate.content.cloneNode(true);
  wrapper.appendChild(carouselNode);

  const carousel = document.getElementById("carousel");


  const cardElements = [];

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
    carousel.appendChild(fragment);

    // Sincronizar el enfoque con la carta activa
    cardElement.addEventListener('focusin', () => setActiveCard(index));
  });

  let currentIndex = 0;

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function updateCarousel() {
    const len = cardElements.length;
    cardElements.forEach((card, index) => {
      card.className = "card";
      const diff = mod(index - currentIndex, len);
      if (diff === 0) card.classList.add("active");
      else if (diff === 1) card.classList.add("right");
      else if (diff === 2) card.classList.add("right-2");
      else if (diff === len - 1) card.classList.add("left");
      else if (diff === len - 2) card.classList.add("left-2");
    });
  }

  function setActiveCard(index, moveFocus = false) {
    const len = cardElements.length;
    currentIndex = mod(index, len);
    updateCarousel();
    if (moveFocus) {
      cardElements[currentIndex]?.focus();
    }
  }

  // Permitir que Enter siempre active la carta visualmente activa (encima)
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const activeCard = cardElements[currentIndex];
      if (activeCard) {
        activeCard.click();
        e.preventDefault();
      }
    }
    // Navegación con flechas izquierda/derecha
    if (e.key === "ArrowLeft") {
      setActiveCard(currentIndex - 1, true);
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      setActiveCard(currentIndex + 1, true);
      e.preventDefault();
    }
  });

  updateCarousel();
}

initCarousel();
