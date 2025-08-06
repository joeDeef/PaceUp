import { createCard } from './create-card.js'; // Asegúrate de importar la función para crear tarjetas
import { extractVideoId } from './loadSongs.js'; // Reutilizamos la función para extraer el ID del video

// Función para cargar los videos desde YouTube
export async function cargarVideos(nivel) {
  const response = await fetch("data/videos.json");
  const videos = await response.json();

  const contenedor = document.getElementById("video-container");
  contenedor.innerHTML = ""; // Limpiar contenedor

  // Crear tarjetas de video y agregarlas al contenedor
  videos.forEach(video => {
    const card = createCard(
      {
        image: "path/to/video-thumbnail.jpg", // Puedes agregar una miniatura si la tienes
        title: video.title,
        description: "Descripción del video", // Puedes personalizar la descripción
        onClick: () => {
          // Aquí puedes definir lo que sucede al hacer clic en la tarjeta
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${extractVideoId(video.url)}`;
          iframe.width = "560";
          iframe.height = "315";
          iframe.frameBorder = "0";
          iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
          iframe.allowFullscreen = true;
          contenedor.innerHTML = ""; // Limpiar contenedor antes de agregar el iframe
          contenedor.appendChild(iframe);
        },
        altText: video.title // Texto alternativo para la tarjeta
      },
      document.getElementById("card-template") // Asegúrate de que el template esté en el HTML
    );

    if (card) {
      contenedor.appendChild(card.fragment); // Agregar la tarjeta al contenedor
    }
  });
}

// Cargar videos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarVideos(); // Llama a la función para cargar videos
});
