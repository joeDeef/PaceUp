const languageBtn = document.getElementById("languageBtn");
const languageName = document.getElementById("languageName");
const languageFlag = document.getElementById("languageFlag");

let currentLanguage = "es";

languageBtn.addEventListener("click", () => {
  if (currentLanguage === "es") {
    currentLanguage = "en";
    languageName.textContent = "ENG";
    languageFlag.src = "../assets/img/english.jpg";
    languageFlag.alt = "Bandera Reino Unido";
  } else {
    currentLanguage = "es";
    languageName.textContent = "ESP";
    languageFlag.src = "../assets/img/spanish.png";
    languageFlag.alt = "Bandera Ecuador";
  }
});
