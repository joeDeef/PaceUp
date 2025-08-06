import { videoQuizData } from "../data/video-quiz.js";

export function loadVideoQuiz(containerId, videoId) {
  const container = document.getElementById("nivel-content");
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

      const transcriptionHtml = data.transcription
        .map((line) => `<p>${line}</p>`)
        .join("");
      document.getElementById("transcription-section").innerHTML =
        transcriptionHtml;

      const quizHtml = data.questions
        .map((q, i) => {
          const options = q.options
            .map(
              (opt) =>
                `<label><input type="radio" name="q${i}" value="${opt}"> ${opt}</label><br>`
            )
            .join("");
          return `<li><p>${q.question}</p>${options}</li>`;
        })
        .join("");
      document.getElementById(
        "quiz-section"
      ).innerHTML = `<ul>${quizHtml}</ul>`;

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