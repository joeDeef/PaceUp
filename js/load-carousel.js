import { createCard } from "./createCards.js";

// Carga las plantillas HTML para tarjetas y carrusel
async function loadTemplates() {
  const [cardHTML, carouselHTML] = await Promise.all([
    fetch("./components/card.html").then((res) => res.text()),
    fetch("./components/carousel.html").then((res) => res.text()),
  ]);

  document.body.insertAdjacentHTML("beforeend", cardHTML);
  document.body.insertAdjacentHTML("beforeend", carouselHTML);
}

// Inicializa el carrusel y sus eventos
async function initCarousel() {
  await loadTemplates();

  const cardTemplate = document.getElementById("card-template");
  const wrapper = document.getElementById("carousel-wrapper");
  const carouselTemplate = document.getElementById("carousel-template");
  const carouselNode = carouselTemplate.content.cloneNode(true);
  wrapper.appendChild(carouselNode);

  const carousel = document.getElementById("carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  const cardsData = [
    // Datos con imagen, título, descripción y color de fondo para cada tarjeta
    { image: "../assets/img/levels/A1.png", title: "Básico 1 (A1)", description: "Vocabulario y frases básicas.", imageBgColor: "#E6FFEB" },
    { image: "../assets/img/levels/A2.png", title: "Básico 2 (A2)", description: "Expresiones simples comunes.", imageBgColor: "#CFFFE0" },
    { image: "../assets/img/levels/B1.png", title: "Intermedio 1 (B1)", description: "Estructuras más complejas.", imageBgColor: "#CCE5FF" },
    { image: "../assets/img/levels/B2.png", title: "Intermedio 2 (B2)", description: "Conversación fluida y técnica.", imageBgColor: "#A0C4FF" },
    { image: "../assets/img/levels/C1.png", title: "Avanzado 1 (C1)", description: "Expresión con matices.", imageBgColor: "#E6CCFF" },
    { image: "../assets/img/levels/C2.png", title: "Avanzado 2 (C2)", description: "Inglés como un nativo.", imageBgColor: "#D1A3FF" },
  ];

  const cardElements = [];

  // Crea las tarjetas y las añade al carrusel, asignando evento click para cambiar la activa
  cardsData.forEach((data, index) => {
    const card = createCard(
      {
        ...data,
        onClick: () => setActiveCard(index),
      },
      cardTemplate
    );
    const el = card.querySelector(".card");
    cardElements.push(el);
    carousel.appendChild(card);
  });

  let currentIndex = 0;

  // Módulo para índice circular (permite loop continuo)
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  // Actualiza las clases CSS para posicionar las tarjetas según la activa
  function updateCarousel() {
    const len = cardElements.length;

    cardElements.forEach((card, index) => {
      card.className = "card"; // resetear clases

      const diff = mod(index - currentIndex, len);

      // Asigna posición relativa a la tarjeta según distancia a la activa
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

  // Cambia la tarjeta activa y actualiza la vista
  function setActiveCard(index) {
    const len = cardElements.length;
    currentIndex = mod(index, len);
    updateCarousel();
  }

  // Eventos para botones y teclado
  prevBtn.addEventListener("click", () => setActiveCard(currentIndex - 1));
  nextBtn.addEventListener("click", () => setActiveCard(currentIndex + 1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevBtn.click();
    if (e.key === "ArrowRight") nextBtn.click();
  });

  updateCarousel();
}

initCarousel();
