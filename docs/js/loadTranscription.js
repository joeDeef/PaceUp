import { extractVideoId } from './loadSongs.js'; // Reutilizamos la función

// Función para cargar transcripción del video seleccionado
export async function cargarTranscripcion(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  
  // Suponiendo que la transcripción está disponible en un archivo JSON
  const response = await fetch(`data/transcriptions/${videoId}.json`);
  const transcription = await response.json();

  const videoPlayer = document.getElementById("video-player");
  const transcriptionContainer = document.getElementById("transcription-container");

  // Insertar el video en el contenedor
  videoPlayer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  // Insertar la transcripción
  transcriptionContainer.innerHTML = transcription.text || "No hay transcripción disponible.";
}

// Cargar la transcripción cuando la página esté lista
document.addEventListener("DOMContentLoaded", function() {
  // Pasar la URL del video desde la pantalla 1
  const videoUrl = localStorage.getItem("selectedVideoUrl");
  if (videoUrl) {
    cargarTranscripcion(videoUrl);
  }
});
