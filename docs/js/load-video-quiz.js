import { videoQuizData } from "../data/video-quiz.js"; // Asumimos que tienes los datos de las preguntas en este archivo

export function loadVideoQuiz(containerId, videoId) {
  const container = document.getElementById(containerId);
  const data = videoQuizData.find((v) => v.id === videoId);
  if (!data) return;

  fetch("components/video-quiz.html")
    .then((res) => res.text())
    .then((html) => {
      container.innerHTML = html;

      document.getElementById("video-title").textContent = data.title;
      document.getElementById(
        "youtube-player"
      ).src = `https://www.youtube.com/embed/${data.youtubeId}`;

      document.getElementById("video-title").setAttribute("tabindex", "0");

      const transcriptionHtml = data.transcription
        .map((line) => `<p tabindex="0">${line}</p>`)
        .join("");
      document.getElementById("transcription-section").innerHTML =
        transcriptionHtml;

      // Cargar las preguntas del quiz en formato de cartas
      const quizHtml = data.questions
        .map((q, i) => {
          const options = q.options
            .map(
              (opt, j) => `
                <label>
                  <input type="radio" tabindex=-1 name="q${i}" value="${opt}" class="quiz-option" id="q${i}-opt${j}">
                  <span tabindex="0" role="button" aria-pressed="false" data-input="q${i}-opt${j}">${opt}</span>
                </label><br>
              `
            )
            .join("");
          return `
            <div class="quiz-card">
              <div class="quiz-card-header">
                <p tabindex="0">${q.question}</p>
              </div>
              <div class="quiz-card-body">
                ${options}
              </div>
            </div>
          `;
        })
        .join("");
      document.getElementById("quiz-section").innerHTML = quizHtml;

      // Accesibilidad: permitir marcar/desmarcar opción con Enter en el span
      document.querySelectorAll('[data-input]').forEach(span => {
        span.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            const input = document.getElementById(span.dataset.input);
            if (input) {
              input.checked = true;
              input.dispatchEvent(new Event('change'));
            }
          }
        });
        span.addEventListener('click', function() {
          const input = document.getElementById(span.dataset.input);
          if (input) {
            input.checked = true;
            input.dispatchEvent(new Event('change'));
          }
        });
      });

      // Añadir el botón de "Comprobar respuestas" con el estilo de los otros botones
      const checkAnswersButton = document.createElement("button");
      checkAnswersButton.id = "btn-check-answers";
      checkAnswersButton.textContent = "Comprobar respuestas";
      checkAnswersButton.classList.add("btn-check-answers"); // Añadir clase para el estilo
      document.getElementById("quiz-section").appendChild(checkAnswersButton);

      // Crear el contenedor de resultados
      const resultContainer = document.createElement("div");
      resultContainer.id = "result-container";
      document.getElementById("quiz-section").appendChild(resultContainer);

      checkAnswersButton.addEventListener("click", () => {
        let score = 0;
        data.questions.forEach((question, i) => {
          const selectedOption = document.querySelector(
            `input[name="q${i}"]:checked`
          );
          if (selectedOption && selectedOption.value === question.answer) {
            score++;
          }
        });

        // Mostrar el resultado debajo del cuestionario
        resultContainer.innerHTML = `<p><strong>Tu puntuación es: ${score} de ${data.questions.length}</strong></p>`;
      });

      // Botones de pestañas
      document
        .getElementById("btn-transcription")
        .addEventListener("click", () => {
          setActiveTab("transcription");
        });
      document.getElementById("btn-quiz").addEventListener("click", () => {
        setActiveTab("quiz");
      });

      function setActiveTab(tab) {
        document
          .getElementById("btn-transcription")
          .classList.remove("active");
        document.getElementById("btn-quiz").classList.remove("active");
        document
          .getElementById("transcription-section")
          .classList.remove("active");
        document.getElementById("quiz-section").classList.remove("active");

        if (tab === "transcription") {
          document.getElementById("btn-transcription").classList.add("active");
          document
            .getElementById("transcription-section")
            .classList.add("active");
        } else {
          document.getElementById("btn-quiz").classList.add("active");
          document.getElementById("quiz-section").classList.add("active");
        }
      }
    });
}
