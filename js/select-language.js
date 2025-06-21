// Elementos del botón y sus partes
const languageBtn = document.getElementById("languageBtn");
const languageName = document.getElementById("languageName");
const languageFlag = document.getElementById("languageFlag");

let currentLanguage = "es"; // Idioma inicial

// Cambia el idioma al hacer clic en el botón
languageBtn.addEventListener("click", () => {
  if (currentLanguage === "es") {
    currentLanguage = "en";
    languageName.textContent = "ENG";
    languageFlag.src = "../assets/img/languages/english.jpg";
    languageFlag.alt = "Bandera Ingles";
  } else {
    currentLanguage = "es";
    languageName.textContent = "ESP";
    languageFlag.src = "../assets/img/languages/spanish.png";
    languageFlag.alt = "Bandera Español";
  }
});
