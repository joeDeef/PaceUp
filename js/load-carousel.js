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
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

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

  function setActiveCard(index) {
    const len = cardElements.length;
    currentIndex = mod(index, len);
    updateCarousel();
  }

  prevBtn.addEventListener("click", () => setActiveCard(currentIndex - 1));
  nextBtn.addEventListener("click", () => setActiveCard(currentIndex + 1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  updateCarousel();
}

initCarousel();
