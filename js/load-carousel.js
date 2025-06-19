import { createCard } from "./cards.js";

async function loadTemplates() {
  const [cardHTML, carouselHTML] = await Promise.all([
    fetch("./components/card.html").then((res) => res.text()),
    fetch("./components/carousel.html").then((res) => res.text()),
  ]);

  document.body.insertAdjacentHTML("beforeend", cardHTML);
  document.body.insertAdjacentHTML("beforeend", carouselHTML);
}

async function initCarousel() {
  await loadTemplates();

  const cardTemplate = document.getElementById("card-template");
  const wrapper = document.getElementById("carousel-wrapper");
  const carouselTemplate = document.getElementById("carousel-template");
  const carouselNode = carouselTemplate.content.cloneNode(true);
  wrapper.appendChild(carouselNode);

  const carousel = document.getElementById("carousel");

  const cardsData = [
    {
      image: "../assets/img/levels/A1.png",
      title: "Básico 1 (A1)",
      description: "Vocabulario y frases básicas.",
      onClick: () => alert("Entrando a Básico 1 (A1)..."),
    },
    {
      image: "../assets/img/levels/A2.jpg",
      title: "Básico 2 (A2)",
      description: "Expresiones simples comunes.",
      onClick: () => alert("Entrando a Básico 2 (A2)..."),
    },
    {
      image: "../assets/img/levels/B1.jpg",
      title: "Intermedio 1 (B1)",
      description: "Estructuras más complejas.",
      onClick: () => alert("Entrando a Intermedio 1 (B1)..."),
    },
    {
      image: "../assets/img/levels/B2.jpg",
      title: "Intermedio 2 (B2)",
      description: "Conversación fluida y técnica.",
      onClick: () => alert("Entrando a Intermedio 2 (B2)..."),
    },
    {
      image: "../assets/img/levels/C1.jpg",
      title: "Avanzado 1 (C1)",
      description: "Expresión con matices.",
      onClick: () => alert("Entrando a Avanzado 1 (C1)..."),
    },
    {
      image: "../assets/img/levels/C2.jpg",
      title: "Avanzado 2 (C2)",
      description: "Inglés como un nativo.",
      onClick: () => alert("Entrando a Avanzado 2 (C2)..."),
    },
  ];

  cardsData.forEach((data) => {
    const card = createCard(data, cardTemplate);
    carousel.appendChild(card);
  });
}

initCarousel();
