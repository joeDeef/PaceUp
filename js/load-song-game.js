import { canciones } from "../data/songs.js";

let player;
let letraSincronizada = [];
let letraIndex = -1;

export async function cargarVideo(nivelActual, id) {
  const contenedor = document.getElementById("nivel-content");
  contenedor.innerHTML = "";

  const res = await fetch("./components/song-game.html");
  const html = await res.text();
  contenedor.innerHTML = html;

  await new Promise((r) => setTimeout(r, 0));

  const cancion = canciones.find((c) => c.id === String(id));
  if (!cancion) {
    contenedor.innerHTML = "<p>Canción no encontrada.</p>";
    return;
  }

  document.getElementById("video-title").textContent = cancion.title;

  const videoContainer = document.getElementById("video-container");
  videoContainer.innerHTML = `<div id="youtube-wrapper"></div>`;

  // Cargar letra sincronizada desde archivo JSON
  if (cancion.lyrics_file) {
    await cargarLetra(cancion.lyrics_file);
  }

  if (player) {
    player.destroy();
  }

  if (window.YT && window.YT.Player) {
    crearPlayer(cancion);
  } else {
    window.onYouTubeIframeAPIReady = () => crearPlayer(cancion);
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

function crearPlayer(cancion) {
  player = new YT.Player("youtube-wrapper", {
    videoId: extraerVideoId(cancion.embed_link),
    playerVars: {
      controls: 0,
      modestbranding: 1,
      rel: 0,
      fs: 0,
      enablejsapi: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady() {
  const btnPlay = document.getElementById("playpause-btn");
  const btnFwd = document.getElementById("adelantar-btn");
  const btnBack = document.getElementById("retroceder-btn");

  btnPlay.onclick = () => {
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  btnFwd.onclick = () => {
    player.seekTo(player.getCurrentTime() + 5, true);
  };

  btnBack.onclick = () => {
    player.seekTo(Math.max(0, player.getCurrentTime() - 5), true);
  };

  // Iniciar sincronización de letra
  requestAnimationFrame(actualizarLetra);
}

function onPlayerStateChange(e) {
  const btn = document.getElementById("playpause-btn");

  if (e.data === YT.PlayerState.PLAYING) {
    btn.textContent = "⏸️ Pause";
    requestAnimationFrame(actualizarLetra);
  } else {
    btn.textContent = "▶️ Play";
  }
}

function extraerVideoId(url) {
  const match = url.match(/(?:embed\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

// 🔽 Cargar letra sincronizada desde archivo JSON
async function cargarLetra(nombreArchivo) {
  try {
    const res = await fetch(`../data/lyrics/${nombreArchivo}`);
    if (!res.ok) throw new Error("Letra no encontrada");
    letraSincronizada = await res.json();
    console.log("Letra cargada:", letraSincronizada); // <-- Aquí
    letraIndex = -1;
  } catch (err) {
    console.error("Error cargando letra:", err);
  }
}

// 🔽 Mostrar línea actual y siguiente según tiempo
function actualizarLetra() {
  if (!player || typeof player.getCurrentTime !== "function") return;

  const tiempoActual = player.getCurrentTime();

  if (letraSincronizada.length > 0) {
    let i;
    for (i = letraSincronizada.length - 1; i >= 0; i--) {
      if (tiempoActual >= letraSincronizada[i].time) break;
    }

    if (i !== letraIndex) {
      letraIndex = i;
    }

    // --- Crear el contenido HTML con karaoke para la línea actual ---
    const lineaActualObj = letraSincronizada[i];
    const lineaSiguienteObj = letraSincronizada[i + 1];

    const actualEl = document.getElementById("linea-actual");
    const siguienteEl = document.getElementById("linea-siguiente");

    if (lineaActualObj && actualEl) {
      const palabrasHTML = lineaActualObj.words
        .map((word) => {
          if (tiempoActual >= word.end) {
            // Palabra ya cantada - blanca
            return `<span class="cantada">${word.text}</span>`;
          } else if (tiempoActual >= word.start && tiempoActual < word.end) {
            // Palabra cantándose ahora - resaltada
            return `<span class="cantandose">${word.text}</span>`;
          } else {
            // Palabra aún no cantada - gris claro (color base de #linea-actual)
            return `<span>${word.text}</span>`;
          }
        })
        .join(" ");

      actualEl.innerHTML = palabrasHTML;
    } else if (actualEl) {
      actualEl.innerHTML = "";
    }

    if (lineaSiguienteObj && siguienteEl) {
      // Solo mostrar texto plano para la siguiente línea
      const textoSiguiente = lineaSiguienteObj.words
        .map((w) => w.text)
        .join(" ");
      siguienteEl.textContent = textoSiguiente;
    } else if (siguienteEl) {
      siguienteEl.textContent = "";
    }
  }

  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    requestAnimationFrame(actualizarLetra);
  }
}
