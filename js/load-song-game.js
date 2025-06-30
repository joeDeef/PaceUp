import { canciones } from "../data/songs.js";

let player;
let letraSincronizada = [];
let letraIndex = -1;

let palabraObjetivo = null;
let opcionesVisibles = false;
let haRespondido = true;
let intentosRestantes = 3;
let idxPalabraOculta = -1;
let volumenOriginal = 100;
let pausaForzada = false; // Pausa para esperar respuesta
let bajandoVolumen = false;
let esperandoContinuar = false; // Flag para controlar retroceso y reanudación

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
      volume: 100,
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
    resetearEstadoLinea();
  };

  btnBack.onclick = () => {
    player.seekTo(Math.max(0, player.getCurrentTime() - 5), true);
    resetearEstadoLinea();
  };

  // Iniciar sincronización letra
  requestAnimationFrame(actualizarLetra);
}

function onPlayerStateChange(e) {
  const btn = document.getElementById("playpause-btn");

  if (e.data === YT.PlayerState.PLAYING) {
    btn.textContent = "⏸️ Pause";
    requestAnimationFrame(actualizarLetra);
  } else {
    btn.textContent = "▶️ Play";
    // Seguimos actualizando letra para mantener sincronía incluso pausado
    requestAnimationFrame(actualizarLetra);
  }
}

function extraerVideoId(url) {
  const match = url.match(/(?:embed\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

async function cargarLetra(nombreArchivo) {
  try {
    const res = await fetch(`../data/lyrics/${nombreArchivo}`);
    if (!res.ok) throw new Error("Letra no encontrada");
    letraSincronizada = await res.json();
    letraIndex = -1;
  } catch (err) {
    console.error("Error cargando letra:", err);
  }
}

function actualizarLetra() {
  if (!player || typeof player.getCurrentTime !== "function") return;

  const tiempoActual = player.getCurrentTime();

  // Si estamos pausados forzadamente esperando respuesta, no avanzar índice ni mostrar nueva línea
  if (pausaForzada) {
    // Mostrar línea con hueco
    if (letraIndex >= 0 && letraIndex < letraSincronizada.length) {
      const actualEl = document.getElementById("linea-actual");
      const lineaActualObj = letraSincronizada[letraIndex];
      if (actualEl && palabraObjetivo) {
        renderizarLineaConHueco(lineaActualObj, idxPalabraOculta, haRespondido);
      }
    }
    requestAnimationFrame(actualizarLetra);
    return;
  }

  // Si estamos en proceso de retroceso para continuar (esperandoContinuar)
  if (esperandoContinuar) {
    // Si el tiempo actual es menor al tiempo de la línea actual menos 3 seg, ya retrocedimos suficiente
    const tiempoLinea = letraSincronizada[letraIndex]?.time ?? 0;
    if (tiempoActual <= tiempoLinea) {
      player.playVideo();
      esperandoContinuar = false;
      // Resetear para la nueva línea
      resetearEstadoLinea();
    }
    requestAnimationFrame(actualizarLetra);
    return;
  }

  if (letraSincronizada.length > 0) {
    // Encontrar la línea actual según tiempo (la línea más cercana sin pasarse)
    let i;
    for (i = letraSincronizada.length - 1; i >= 0; i--) {
      if (tiempoActual >= letraSincronizada[i].time) break;
    }
    if (i < 0) i = 0;

    // Si cambiamos de línea, resetear estado
    if (i !== letraIndex) {
      letraIndex = i;
      resetearEstadoLinea();
    }

    const lineaActualObj = letraSincronizada[letraIndex];
    const lineaSiguienteObj = letraSincronizada[letraIndex + 1];

    const actualEl = document.getElementById("linea-actual");
    const siguienteEl = document.getElementById("linea-siguiente");

    if (lineaActualObj && actualEl) {
      if (!opcionesVisibles && tiempoActual >= lineaActualObj.time) {
        generarOpciones(lineaActualObj);
        opcionesVisibles = true;
      }

      if (opcionesVisibles && palabraObjetivo) {
        renderizarLineaConHueco(lineaActualObj, idxPalabraOculta, haRespondido);
      } else {
        actualEl.innerHTML = lineaActualObj.words.map(w => `<span>${w.text}</span>`).join(" ");
      }
    }

    // Pausar justo al final de la línea para responder, si no ha respondido todavía
    if (
      palabraObjetivo &&
      !haRespondido &&
      tiempoActual >= obtenerFinLinea(lineaActualObj) &&
      !pausaForzada &&
      !bajandoVolumen
    ) {
      pausaForzada = true;
      bajarVolumenYPausar();
    }

    if (lineaSiguienteObj && siguienteEl) {
      const textoSiguiente = lineaSiguienteObj.words.map((w) => w.text).join(" ");
      siguienteEl.textContent = textoSiguiente;
    } else if (siguienteEl) {
      siguienteEl.textContent = "";
    }
  } else {
    // Si no hay letra, limpiar
    const actualEl = document.getElementById("linea-actual");
    const siguienteEl = document.getElementById("linea-siguiente");
    if (actualEl) actualEl.textContent = "";
    if (siguienteEl) siguienteEl.textContent = "";
  }

  requestAnimationFrame(actualizarLetra);
}

function obtenerFinLinea(linea) {
  if (!linea || !linea.words || linea.words.length === 0) return 0;
  return linea.words[linea.words.length - 1].end;
}

async function bajarVolumenYPausar() {
  if (bajandoVolumen) return;
  bajandoVolumen = true;
  let volumen = player.getVolume();
  volumenOriginal = volumen;

  while (volumen > 0) {
    volumen -= 5;
    if (volumen < 0) volumen = 0;
    player.setVolume(volumen);
    await new Promise(r => setTimeout(r, 50));
  }

  player.pauseVideo();
  bajandoVolumen = false;
}

function subirVolumen() {
  let volumen = 0;
  player.setVolume(0);
  const interval = setInterval(() => {
    volumen += 5;
    if (volumen >= volumenOriginal) {
      player.setVolume(volumenOriginal);
      clearInterval(interval);
    } else {
      player.setVolume(volumen);
    }
  }, 50);
}

function generarOpciones(linea) {
  const gameOptions = document.getElementById("game-options");
  gameOptions.innerHTML = "";

  if (!linea.words || linea.words.length === 0) return;

  idxPalabraOculta = Math.floor(Math.random() * linea.words.length);
  palabraObjetivo = linea.words[idxPalabraOculta];
  intentosRestantes = 3;
  haRespondido = false;

  renderizarLineaConHueco(linea, idxPalabraOculta);

  const distractores = obtenerDistractores(palabraObjetivo.text, 3);
  const opciones = [palabraObjetivo.text, ...distractores].sort(() => Math.random() - 0.5);

  opciones.forEach((opcion) => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.className = "opcion-btn";
    btn.onclick = () => verificarRespuesta(opcion, linea);
    gameOptions.appendChild(btn);
  });
}

function renderizarLineaConHueco(linea, huecoIdx, mostrarCorrecta = false) {
  const actualEl = document.getElementById("linea-actual");

  const palabrasHTML = linea.words
    .map((word, i) => {
      if (i === huecoIdx) {
        if (mostrarCorrecta) {
          return `<span class="cantada">${word.text}</span>`;
        } else {
          return `<span class="hueco">_____</span>`;
        }
      }
      return `<span>${word.text}</span>`;
    })
    .join(" ");
  actualEl.innerHTML = palabrasHTML;
}

function verificarRespuesta(opcionSeleccionada, linea) {
  const esCorrecta = opcionSeleccionada === palabraObjetivo.text;

  const botones = document.querySelectorAll(".opcion-btn");
  botones.forEach((btn) => (btn.disabled = true));

  if (esCorrecta) {
    haRespondido = true;
    pausaForzada = false;
    renderizarLineaConHueco(linea, idxPalabraOculta, true);
    alert("✅ ¡Correcto!");
    // Subir volumen y retroceder 3 segundos antes de seguir
    subirVolumen();
    retrocederYContinuar();
  } else {
    intentosRestantes--;
    if (intentosRestantes > 0) {
      alert(`❌ Incorrecto. Te quedan ${intentosRestantes} intento(s).`);
      // Permitir reintentar habilitando botones otra vez
      botones.forEach((btn) => (btn.disabled = false));
    } else {
      haRespondido = true;
      pausaForzada = false;
      renderizarLineaConHueco(linea, idxPalabraOculta, true);
      alert(`❌ Incorrecto. La respuesta correcta era: \"${palabraObjetivo.text}\".`);
      subirVolumen();
      retrocederYContinuar();
    }
  }
}

function retrocederYContinuar() {
  // Retroceder 3 segundos y mantener el flag para continuar cuando llegue el tiempo
  esperandoContinuar = true;
  const tiempoARetroceder = Math.max(0, player.getCurrentTime() - 3);
  player.seekTo(tiempoARetroceder, true);
  // Nota: la reanudación se hará en actualizarLetra
}

function obtenerDistractores(correcta, cantidad) {
  const pool = [
    "love", "the", "you", "is", "go", "home", "find", "a",
    "club", "night", "best", "me", "we", "music"
  ];
  const sinRepetir = pool.filter((w) => w.toLowerCase() !== correcta.toLowerCase());
  return sinRepetir.sort(() => Math.random() - 0.5).slice(0, cantidad);
}

function resetearEstadoLinea() {
  pausaForzada = false;
  haRespondido = true;
  opcionesVisibles = false;
  palabraObjetivo = null;
  intentosRestantes = 3;
  idxPalabraOculta = -1;
  esperandoContinuar = false;
  const gameOptions = document.getElementById("game-options");
  if (gameOptions) gameOptions.innerHTML = "";
}
