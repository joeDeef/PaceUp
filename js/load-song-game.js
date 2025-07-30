import { canciones } from "../data/songs.js";
import { mostrarModal } from "./mostrar-modal.js";

let youtubePlayer;
let syncedLyrics = [];
let currentPairIndex = 0;
let animationRunning = false;
let fadeInterval;
let isFading = false;
let lastPairIndexShown = -1;
let isPausedForAnswer = false;

export async function cargarVideo(levelId, videoId) {
  const container = document.getElementById("nivel-content");
  container.innerHTML = "";

  const res = await fetch("./components/song-game.html");
  container.innerHTML = await res.text();
  await new Promise((r) => setTimeout(r, 0));

  const song = canciones.find((c) => c.id === String(videoId));
  if (!song) {
    container.innerHTML = "<p>Canci\u00f3n no encontrada.</p>";
    return;
  }

  document.getElementById("video-title").textContent = song.title;
  document.getElementById("video-container").innerHTML =
    '<div id="youtube-wrapper"></div>';

  if (song.lyrics_file) {
    await loadLyrics(song.lyrics_file);
  }

  if (youtubePlayer) youtubePlayer.destroy();

  if (window.YT && window.YT.Player) {
    createPlayer(song);
  } else {
    window.onYouTubeIframeAPIReady = () => createPlayer(song);
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

function createPlayer(song) {
  youtubePlayer = new YT.Player("youtube-wrapper", {
    videoId: extractVideoId(song.embed_link),
    playerVars: { controls: 0, modestbranding: 1, rel: 0, fs: 0, disablekb: 1 },
    events: {
      onReady: () => handlePlayerReady(song),
      onStateChange: handlePlayerStateChange,
    },
  });
}

function handlePlayerReady(song) {
  document.getElementById("playpause-btn").onclick = () => {
    const state = youtubePlayer.getPlayerState();
    const line2 = syncedLyrics[currentPairIndex + 1];
    const esJugable = line2?.jugable ?? true;

    if (isPausedForAnswer && esJugable) {
      if (!line2 || !line2.answered) {
        mostrarModal("Primero debes contestar antes de continuar.");
        return; // No reproducir
      }
    }

    // Solo permitir pausa si el bloque es jugable
    if (esJugable && state === YT.PlayerState.PLAYING) {
      youtubePlayer.pauseVideo();
    } else {
      restoreVolume();
      youtubePlayer.playVideo();
      startLyricsAnimation();
    }
  };

  document.getElementById("retroceder-btn").onclick = () => {
    const newTime = Math.max(0, youtubePlayer.getCurrentTime() - 2);
    youtubePlayer.seekTo(newTime, true);

    updateCurrentPairIndex(newTime);
    renderCurrentLyrics(newTime);
    restoreVolume();
    startLyricsAnimation();
    youtubePlayer.playVideo();
  };

  window.addEventListener("keydown", (e) => {
    const playPauseBtn = document.getElementById("playpause-btn");
    const retrocederBtn = document.getElementById("retroceder-btn");
    // const adelantarBtn = document.getElementById("adelantar-btn");

    switch (e.code) {
      case "Space": // barra espacio
        e.preventDefault();
        playPauseBtn.click();
        break;
      case "ArrowLeft": // flecha izquierda
        e.preventDefault();
        retrocederBtn.click();
        break;
    }
  });

  resetState();
}

function handlePlayerStateChange(event) {
  const isPlaying = event.data === YT.PlayerState.PLAYING;
  const icon = document.getElementById("playpause-icon");
  const text = document.querySelector("#playpause-btn span");

  if (icon) {
    icon.src = isPlaying
      ? "../assets/icons/pause-solid.svg"
      : "../assets/icons/play-solid.svg";
    icon.alt = isPlaying ? "Pause" : "Play";
  }

  if (text) {
    text.textContent = isPlaying ? "Pause" : "Play";
  }

  if (isPlaying) {
    startLyricsAnimation();
  } else {
    stopLyricsAnimation();
  }
}

function extractVideoId(url) {
  const match = url.match(/(?:embed\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

async function loadLyrics(fileName) {
  const res = await fetch(`../data/lyrics/${fileName}`);
  syncedLyrics = await res.json();
  currentPairIndex = 0;
}

function startLyricsAnimation() {
  if (!animationRunning) {
    animationRunning = true;
    requestAnimationFrame(updateLyrics);
  }
}

function stopLyricsAnimation() {
  animationRunning = false;
}

function resetState() {
  currentPairIndex = 0;
  lastPairIndexShown = -1;
  isPausedForAnswer = false;
  stopLyricsAnimation();
  syncedLyrics.forEach((line) => {
    line.paused = false;
    line.answered = false;
    line.words.forEach((word) => delete word.oculta);
  });
  renderCurrentLyrics(0);
}

function updateCurrentPairIndex(currentTime) {
  for (let i = 0; i < syncedLyrics.length; i += 2) {
    const line = syncedLyrics[i];
    if (line && line.words && line.words.length > 0) {
      const start = line.words[0].start;
      const end = syncedLyrics[i + 1]
        ? syncedLyrics[i + 1].words[syncedLyrics[i + 1].words.length - 1].end
        : line.words[line.words.length - 1].end;
      if (currentTime >= start && currentTime <= end) {
        currentPairIndex = i;
        break;
      }
    }
  }
}

function updateLyrics() {
  if (
    !youtubePlayer ||
    typeof youtubePlayer.getCurrentTime !== "function" ||
    !animationRunning
  )
    return;

  const currentTime = youtubePlayer.getCurrentTime();
  const line1 = syncedLyrics[currentPairIndex];
  const line2 = syncedLyrics[currentPairIndex + 1];
  if (!line1 || !line2) return;

  renderCurrentLyrics(currentTime);

  const esJugable = line2.jugable ?? true; // true por defecto

  const lastWord = line2.words[line2.words.length - 1];
  const pauseTime = line2.answered ? lastWord.end : lastWord.end + 1;

  if (esJugable) {
    // Lógica normal para jugables
    if (
      !line2.paused &&
      !line2.answered &&
      currentTime >= lastWord.end &&
      currentTime < pauseTime
    ) {
      fadeOutVolume(1000);
    }

    if (!line2.paused) {
      if (line2.answered) {
        // deja fluir
      } else if (currentTime >= lastWord.end && currentTime < pauseTime) {
        fadeOutVolume(1000);
      } else if (currentTime >= pauseTime) {
        console.log("Pausando video porque bloque es jugable", currentPairIndex);
        youtubePlayer.pauseVideo();
        stopLyricsAnimation();
        isPausedForAnswer = true;
        line2.paused = true;
      }
    }
  } else {
      console.log("Bloque no jugable, no pausar, avance automático", currentPairIndex);
    // Bloque NO jugable: nunca pausar, ni isPausedForAnswer true
    isPausedForAnswer = false; // <-- limpiar bandera

    // Si por alguna razón está pausado, reproducir
    if (youtubePlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
      youtubePlayer.playVideo();
    }

    // Avanzar automáticamente si tiempo pasó
    if (currentTime >= pauseTime) {
      currentPairIndex += 2;
      renderCurrentLyrics(currentTime);
      resetLineState(currentPairIndex);

      const nextLine = syncedLyrics[currentPairIndex];
      if (nextLine && nextLine.words?.length > 0) {
        youtubePlayer.seekTo(nextLine.words[0].start, true);
      }
    }
  }

  // Avanzar cuando ya respondió y no está pausado
  if (line2.answered && !line2.paused && currentTime >= pauseTime) {
    currentPairIndex += 2;
    line2.paused = true;
    renderCurrentLyrics(currentTime);
  }

  actualizarBarraProgreso();

  if (animationRunning) {
    requestAnimationFrame(updateLyrics);
  }
}

function renderCurrentLyrics(currentTime) {
  const line1 = syncedLyrics[currentPairIndex];
  const line2 = syncedLyrics[currentPairIndex + 1];

  renderLine(document.getElementById("linea-actual"), line1, currentTime);
  renderLine(document.getElementById("linea-siguiente"), line2, currentTime);

  if (currentPairIndex !== lastPairIndexShown) {
    mostrarOpcionesAleatorias(line1, line2);
    lastPairIndexShown = currentPairIndex;
  }
}

function renderLine(container, line, currentTime) {
  if (!container || !line) return;

  if (currentTime < line.time) {
    container.textContent = "......";
    return;
  }

  container.innerHTML = line.words
    .map((word) => {
      let cssClass = "";
      let contenido = word.text;

      if (word.oculta) {
        contenido = "_".repeat(word.text.length);
      } else if (word.completada) {
        cssClass = "completada";
      } else if (currentTime >= word.start && currentTime < word.end) {
        cssClass = "cantandose";
      } else if (currentTime >= word.end) {
        cssClass = "cantada";
      }

      return `<span class="${cssClass}">${contenido}</span>`;
    })
    .join(" ");
}

function fadeOutVolume(duration = 1000) {
  if (isFading) return;
  isFading = true;
  let step = 100 / (duration / 50);
  let current = 100;

  fadeInterval = setInterval(() => {
    current -= step;
    if (current <= 0) {
      current = 0;
      clearInterval(fadeInterval);
      isFading = false;
    }
    youtubePlayer.setVolume(Math.round(current));
  }, 50);
}

function restoreVolume(duration = 1000) {
  clearInterval(fadeInterval);
  let step = 100 / (duration / 50);
  let current = 0;
  isFading = true;

  fadeInterval = setInterval(() => {
    current += step;
    if (current >= 100) {
      current = 100;
      clearInterval(fadeInterval);
      isFading = false;
    }
    youtubePlayer.setVolume(Math.round(current));
  }, 50);
}

function mostrarOpcionesAleatorias(line1, line2) {
  const container = document.getElementById("game-options");
  if (!container) return;

  // Solo mostrar opciones si alguna línea es jugable
  if (
    (line1?.jugable ?? true) === false &&
    (line2?.jugable ?? true) === false
  ) {
    container.innerHTML = ""; // Vaciar opciones
    return;
  }

  const palabras = [...(line1?.words || []), ...(line2?.words || [])];
  if (palabras.length < 4) {
    container.innerHTML = "";
    return;
  }

  const seleccionadas = [];
  while (seleccionadas.length < 4) {
    const randIndex = Math.floor(Math.random() * palabras.length);
    const palabra = palabras[randIndex].text;
    if (!seleccionadas.includes(palabra)) {
      seleccionadas.push(palabra);
    }
  }

  const palabraOculta = seleccionadas[Math.floor(Math.random() * 4)];

  for (const line of [line1, line2]) {
    if (!line) continue;
    for (const word of line.words) {
      if (word.text === palabraOculta) {
        word.oculta = true;
        break;
      }
    }
  }

  container.innerHTML = seleccionadas
    .map((word) => `<button class="opcion-palabra">${word}</button>`)
    .join("");

  const botones = container.querySelectorAll(".opcion-palabra");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (
        btn.classList.contains("correcta") ||
        btn.classList.contains("incorrecta")
      ) {
        return;
      }
      if (btn.textContent === palabraOculta) {
        btn.classList.add("correcta");
        setTimeout(() => {
          btn.classList.remove("correcta");
        }, 1000);

        avanzarLineaConRespuestaCorrecta();
      } else {
        btn.classList.add("incorrecta");
        setTimeout(() => {
          btn.classList.remove("incorrecta");
        }, 1000);
      }
    });
  });
}

function avanzarLineaConRespuestaCorrecta() {
  const line1 = syncedLyrics[currentPairIndex];
  const line2 = syncedLyrics[currentPairIndex + 1];

  [line1, line2].forEach((line) => {
    if (!line) return;
    line.words.forEach((word) => {
      if (word.oculta) {
        delete word.oculta;
        word.completada = true;
      }
    });
  });

  renderCurrentLyrics(youtubePlayer.getCurrentTime());

  if (line1) line1.answered = true;
  if (line2) line2.answered = true;

  if (isPausedForAnswer) {
    isPausedForAnswer = false;
    currentPairIndex += 2;

    // Saltar bloques no jugables automáticamente
    while (
      currentPairIndex < syncedLyrics.length &&
      syncedLyrics[currentPairIndex]?.jugable === false
    ) {
      currentPairIndex += 2;
    }

    if (currentPairIndex >= syncedLyrics.length) {
      stopLyricsAnimation();
      return;
    }

    const nextLine = syncedLyrics[currentPairIndex];
    if (nextLine && nextLine.words?.length > 0) {
      youtubePlayer.seekTo(nextLine.words[0].start, true);
    }

    restoreVolume();
    startLyricsAnimation();
    youtubePlayer.playVideo();
    resetLineState(currentPairIndex);
  }
}

function resetLineState(pairIndex) {
  if (!syncedLyrics[pairIndex]) return;

  syncedLyrics[pairIndex].paused = false;
  syncedLyrics[pairIndex].answered = false;
  syncedLyrics[pairIndex].words.forEach((word) => delete word.oculta);

  const nextPairIndex = pairIndex + 1;
  if (syncedLyrics[nextPairIndex]) {
    syncedLyrics[nextPairIndex].paused = false;
    syncedLyrics[nextPairIndex].answered = false;
    syncedLyrics[nextPairIndex].words.forEach((word) => delete word.oculta);
  }

  lastPairIndexShown = -1;
}

let porcentajeActual = 0;

function actualizarBarraProgreso() {
  if (!youtubePlayer || typeof youtubePlayer.getCurrentTime !== "function")
    return;

  const currentTime = youtubePlayer.getCurrentTime();
  const duration = youtubePlayer.getDuration();

  if (!duration || duration === 0) return;

  const porcentaje = Math.floor((currentTime / duration) * 100);

  const barra = document.getElementById("progress-bar");
  const texto = document.getElementById("progress-text");

  if (barra && texto) {
    barra.style.width = porcentaje + "%"; // Cambia ancho
    texto.textContent = porcentaje + "%"; // Actualiza número
  }
}
