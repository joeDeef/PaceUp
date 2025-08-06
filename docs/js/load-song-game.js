import { mostrarModal } from "./mostrar-modal.js";
import { mostrarModalFinal } from "./modal-juego.js";

// Determina si el tiempo actual está dentro del rango permitido para escuchar la palabra
function isInAnswerRange(currentTime) {
  const line2 = syncedLyrics[currentPairIndex + 1];
  if (!line2 || !line2.words || line2.words.length === 0) return true;
  const start = line2.words[0].start;
  const lastWord = line2.words[line2.words.length - 1];
  const end = lastWord.end + 1; // 1 segundo extra para escuchar
  return currentTime >= start && currentTime <= end;
}
// --- STATUS ITEM ---
let puntos = 0,
  aciertos = 0,
  fallas = 0,
  totalHuecos = 0;
let tiempoInicio = null;

function calcularTotalHuecos() {
  // Cuenta pares jugables (de 2 en 2)
  let count = 0;
  for (let i = 0; i < syncedLyrics.length; i += 2) {
    if (
      (syncedLyrics[i]?.jugable ?? true) ||
      (syncedLyrics[i + 1]?.jugable ?? true)
    )
      count++;
  }
  return count;
}

function actualizarStatusItem() {
  const huecosCompletados = aciertos;
  const puntosEl = document.getElementById("status-puntos");
  const huecosEl = document.getElementById("status-huecos");
  const aciertosEl = document.getElementById("status-aciertos");
  const fallasEl = document.getElementById("status-fallas");

  const puntosItem = puntosEl?.closest(".status-item");
  const huecosItem = huecosEl?.closest(".status-item");
  const aciertosItem = aciertosEl?.closest(".status-item");
  const fallasItem = fallasEl?.closest(".status-item");

  if (puntosEl && puntosItem) {
    puntosEl.textContent = puntos;
    puntosItem.setAttribute("aria-label", `Puntos obtenidos: ${puntos}`);
  }

  if (huecosEl && huecosItem) {
    huecosEl.textContent = `${huecosCompletados}/${totalHuecos}`;
    huecosItem.setAttribute(
      "aria-label",
      `Huecos completados: ${huecosCompletados} de ${totalHuecos}`
    );
  }

  if (aciertosEl && aciertosItem) {
    aciertosEl.textContent = aciertos;
    aciertosItem.setAttribute(
      "aria-label",
      `Aciertos realizados: ${aciertos}`
    );
  }

  if (fallasEl && fallasItem) {
    fallasEl.textContent = fallas;
    fallasItem.setAttribute("aria-label", `Fallas cometidas: ${fallas}`);
  }
}

let youtubePlayer,
  syncedLyrics = [],
  currentPairIndex = 0,
  animationRunning = false,
  fadeInterval,
  isFading = false,
  lastPairIndexShown = -1,
  isPausedForAnswer = false,
  isTryingToGoBack = false;
let lastSeekTime = 0; // Para detectar si el usuario retrocede

export async function cargarVideo(levelId, videoId) {
  document.body.classList.add("modo-juego");

  const container = document.getElementById("nivel-content");
  container.innerHTML = "";

  const res = await fetch("components/song-game.html");
  container.innerHTML = await res.text();
  await new Promise((r) => setTimeout(r, 0));

  // Cargar canciones desde JSON
  let canciones = [];
  try {
    const resCanciones = await fetch("data/songs.json");
    canciones = await resCanciones.json();
  } catch (e) {
    container.innerHTML = "<p>Error cargando canciones.</p>";
    return;
  }

  const song = canciones.find((c) => c.id === String(videoId));
  if (!song) {
    container.innerHTML = "<p>Canci\u00f3n no encontrada.</p>";
    return;
  }

  const videoTitle = document.getElementById("video-title");
  videoTitle.textContent = song.title;
  videoTitle.setAttribute("tabindex", "0");
  document.getElementById("video-container").innerHTML =
    '<div id="youtube-wrapper" tabindex="0"></div>';

  if (song.lyrics_file) {
    await loadLyrics(song.lyrics_file);
    totalHuecos = calcularTotalHuecos();
    puntos = aciertos = fallas = 0;
    actualizarStatusItem();
  }

  youtubePlayer && youtubePlayer.destroy();
  if (window.YT?.Player) {
    createPlayer(song);
  } else {
    window.onYouTubeIframeAPIReady = () => createPlayer(song);
    document.head.appendChild(
      Object.assign(document.createElement("script"), {
        src: "https://www.youtube.com/iframe_api",
      })
    );
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
  const playPauseBtn = document.getElementById("playpause-btn");
  playPauseBtn.setAttribute("tabindex", "0");
  playPauseBtn.onclick = () => {
    const state = youtubePlayer.getPlayerState();
    const line2 = syncedLyrics[currentPairIndex + 1];
    const esJugable = line2?.jugable ?? true;
    const currentTime = youtubePlayer.getCurrentTime();
    // Si el usuario acaba de intentar retroceder, permite reproducir sin mostrar el modal
    if (isTryingToGoBack) {
      isTryingToGoBack = false;
      isPausedForAnswer = false;
      if (line2) line2.paused = false;
    } else if (isPausedForAnswer && esJugable && (!line2 || !line2.answered)) {
      if (!isInAnswerRange(currentTime)) {
        return mostrarModal("Primero debes contestar antes de continuar.");
      } else {
        // Si está dentro del rango, desactiva la pausa forzada
        isPausedForAnswer = false;
        if (line2) line2.paused = false;
      }
    }
    esJugable && state === YT.PlayerState.PLAYING
      ? youtubePlayer.pauseVideo()
      : (restoreVolume(), youtubePlayer.playVideo(), startLyricsAnimation());
    lastSeekTime = currentTime;
  };
  const retrocederBtn = document.getElementById("retroceder-btn");
  retrocederBtn.setAttribute("tabindex", "0");
  retrocederBtn.onclick = () => {
    isTryingToGoBack = true;
    const prevTime = youtubePlayer.getCurrentTime();
    const newTime = Math.max(0, prevTime - 2);
    youtubePlayer.seekTo(newTime, true);
    updateCurrentPairIndex(newTime);
    renderCurrentLyrics(newTime);
    restoreVolume();
    startLyricsAnimation();
    youtubePlayer.playVideo();
    lastSeekTime = newTime;
  };
  window.addEventListener("keydown", (e) => {
    const playPauseBtn = document.getElementById("playpause-btn"),
      retrocederBtn = document.getElementById("retroceder-btn");
    if (e.code === "Space" || e.code === "ArrowLeft") {
      e.preventDefault();
      (e.code === "Space" ? playPauseBtn : retrocederBtn).click();
    }
  });
  resetState();
}

function handlePlayerStateChange(event) {
  const isPlaying = event.data === YT.PlayerState.PLAYING;
  const icon = document.getElementById("playpause-icon");
  const text = document.querySelector("#playpause-btn span");

  if (event.data === YT.PlayerState.PLAYING && tiempoInicio === null) {
    tiempoInicio = Date.now();
  }

  if (event.data === YT.PlayerState.ENDED) {
    const tiempoFin = Date.now();
    const tiempoTotal = Math.floor((tiempoFin - tiempoInicio) / 1000);

    mostrarModalFinal({
      puntos,
      aciertos,
      fallas,
      tiempoSegundos: tiempoTotal,
      redireccion: 'level.html?nivel=Intermedio1&modo=canciones'
    });
  }

  if (icon) {
    icon.src = isPlaying
      ? "assets/icons/pause-solid.svg"
      : "assets/icons/play-solid.svg";
    icon.alt = isPlaying ? "Pause" : "Play";
  }
  if (text) text.textContent = isPlaying ? "Pause" : "Play";

  // --- Lógica para bloquear play nativo si no ha respondido ---
  if (isPlaying) {
    const currentTime = youtubePlayer.getCurrentTime();
    const line2 = syncedLyrics[currentPairIndex + 1];
    const esJugable = line2?.jugable ?? true;
    // Si el usuario acaba de intentar retroceder, permite reproducir sin mostrar el modal
    if (isTryingToGoBack) {
      isTryingToGoBack = false;
      isPausedForAnswer = false;
      if (line2) line2.paused = false;
    } else if (isPausedForAnswer && esJugable && (!line2 || !line2.answered)) {
      if (!isInAnswerRange(currentTime)) {
        youtubePlayer.pauseVideo();
        mostrarModal("Primero debes contestar antes de continuar.");
        return;
      } else {
        // Si está dentro del rango, desactiva la pausa forzada
        isPausedForAnswer = false;
        if (line2) line2.paused = false;
      }
    }
    startLyricsAnimation();
    lastSeekTime = currentTime;
  } else {
    stopLyricsAnimation();
  }
}

function extractVideoId(url) {
  return url.match(/(?:embed\/|v=)([\w-]{11})/)?.[1] || "";
}

async function loadLyrics(fileName) {
  const res = await fetch(`data/lyrics/${fileName}`);
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
    line.paused = line.answered = false;
    line.words.forEach((word) => delete word.oculta);
  });
  renderCurrentLyrics(0);
}

function updateCurrentPairIndex(currentTime) {
  for (let i = 0; i < syncedLyrics.length; i += 2) {
    const line = syncedLyrics[i];
    if (line?.words?.length) {
      const start = line.words[0].start;
      const end =
        syncedLyrics[i + 1]?.words?.slice(-1)[0]?.end ??
        line.words.slice(-1)[0].end;
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
        youtubePlayer.pauseVideo();
        stopLyricsAnimation();
        isPausedForAnswer = true;
        line2.paused = true;
      }
    }
  } else {
    isPausedForAnswer = false;

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
      /*
      if (nextLine && nextLine.words?.length > 0) {
        youtubePlayer.seekTo(nextLine.words[0].start, true);
      }*/
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
  const lineaActual = document.getElementById("linea-actual");
  const lineaSiguiente = document.getElementById("linea-siguiente");
  lineaActual.setAttribute("tabindex", "0");
  lineaSiguiente.setAttribute("tabindex", "0");
  renderLine(lineaActual, line1, currentTime);
  renderLine(lineaSiguiente, line2, currentTime);
  if (currentPairIndex !== lastPairIndexShown) {
    mostrarOpcionesAleatorias(line1, line2);
    lastPairIndexShown = currentPairIndex;
  }
  actualizarStatusItem(); // <-- Actualiza siempre que se renderiza
}

function renderLine(container, line, currentTime) {
  if (!container || !line) return;
  if (currentTime < line.time) return void (container.textContent = "......");
  container.innerHTML = line.words
    .map((word) => {
      let cssClass = word.oculta
        ? ""
        : word.completada
        ? "completada"
        : currentTime >= word.start && currentTime < word.end
        ? "cantandose"
        : currentTime >= word.end
        ? "cantada"
        : "";
      let contenido = word.oculta ? "_".repeat(word.text.length) : word.text;
      return `<span class="${cssClass}">${contenido}</span>`;
    })
    .join(" ");
}

function fadeOutVolume(duration = 1000) {
  if (isFading) return;
  isFading = true;
  let step = 100 / (duration / 50),
    current = 100;
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
  let step = 100 / (duration / 50),
    current = 0;
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

// Navegación por teclado entre opciones de palabra
function setupKeyboardNavigation() {
  const mainSection = document.querySelector(".video-section");
  if (!mainSection) return;

  // Evitar múltiples listeners
  mainSection.removeEventListener("keydown", handleNavigation);
  mainSection.addEventListener("keydown", handleNavigation);
}

function handleNavigation(e) {
  const options = Array.from(document.querySelectorAll(".opcion-palabra"));
  if (!options.length) return;

  const active = document.activeElement;
  let idx = options.findIndex((btn) => btn === active);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (idx === -1) {
      options[0].focus();
    } else if (idx < options.length - 1) {
      options[idx + 1].focus();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (idx === -1) {
      options[options.length - 1].focus();
    } else if (idx > 0) {
      options[idx - 1].focus();
    }
  } else if (e.key === "Enter") {
    if (idx !== -1) {
      e.preventDefault();
      options[idx].click();
      setTimeout(() => {
        const mainSection = document.querySelector(".video-section");
        if (mainSection) mainSection.focus();
      }, 10);
    }
  }
}

// Llamar después de renderizar las opciones
function mostrarOpcionesAleatorias(line1, line2) {
  const container = document.getElementById("game-options");
  if (!container) return;
  // Solo mostrar opciones si alguna línea es jugable
  if ((line1?.jugable ?? true) === false && (line2?.jugable ?? true) === false)
    return void (container.innerHTML = "");
  const palabras = [...(line1?.words || []), ...(line2?.words || [])];
  if (palabras.length < 4) return void (container.innerHTML = "");
  const seleccionadas = [];
  while (seleccionadas.length < 4) {
    const palabra = palabras[Math.floor(Math.random() * palabras.length)].text;
    if (!seleccionadas.includes(palabra)) seleccionadas.push(palabra);
  }
  const palabraOculta = seleccionadas[Math.floor(Math.random() * 4)];
  [line1, line2].forEach((line) =>
    line?.words.forEach((word) => {
      if (word.text === palabraOculta) word.oculta = true;
    })
  );
  container.innerHTML = seleccionadas
    .map(
      (word, i) =>
        `<button class="opcion-palabra" id="opcion-palabra-${i}" aria-label="Opción de palabra: ${word}" tabindex="0">${word}</button>`
    )
    .join("");
  container.querySelectorAll(".opcion-palabra").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (
        btn.classList.contains("correcta") ||
        btn.classList.contains("incorrecta")
      )
        return;
      if (btn.textContent === palabraOculta) {
        btn.classList.add("correcta");
        btn.setAttribute(
          "aria-label",
          `Respuesta correcta: ${btn.textContent}`
        );
        btn.setAttribute("aria-live", "assertive");
        setTimeout(() => {
          btn.classList.remove("correcta");
          btn.setAttribute(
            "aria-label",
            `Opción de palabra: ${btn.textContent}`
          );
          btn.setAttribute("aria-live", "off");
        }, 1000);
        // Validar si respondió antes de que acabara el tiempo
        const line2 = syncedLyrics[currentPairIndex + 1];
        const lastWord = line2?.words?.[line2.words.length - 1];
        const currentTime = youtubePlayer.getCurrentTime();
        let puntosGanados = 3;
        if (lastWord && currentTime < lastWord.end) {
          puntosGanados = 5;
        }
        puntos += puntosGanados;
        aciertos++;
        actualizarStatusItem();
        avanzarLineaConRespuestaCorrecta();
      } else {
        btn.classList.add("incorrecta");
        btn.setAttribute(
          "aria-label",
          `Respuesta incorrecta: ${btn.textContent}`
        );
        btn.setAttribute("aria-live", "assertive");
        setTimeout(() => {
          btn.classList.remove("incorrecta");
          btn.setAttribute(
            "aria-label",
            `Opción de palabra: ${btn.textContent}`
          );
          btn.setAttribute("aria-live", "off");
        }, 1000);
        fallas++;
        actualizarStatusItem();
      }
    });
    btn.dataset.idx = i;
  });
  // Enfocar el contenedor principal para que la navegación por teclado siempre funcione
  const mainSection = document.querySelector(".video-section");
  if (mainSection) mainSection.focus();
  setupKeyboardNavigation();

  // Limpia el foco actual antes de regenerar
  document.activeElement?.blur();

  // Focaliza la primera opción por defecto
  setTimeout(() => {
    const options = Array.from(document.querySelectorAll(".opcion-palabra"));
    if (options.length > 0) options[0].focus();
  }, 100);
}

function avanzarLineaConRespuestaCorrecta() {
  const line1 = syncedLyrics[currentPairIndex];
  const line2 = syncedLyrics[currentPairIndex + 1];

  [line1, line2].forEach((line) =>
    line?.words.forEach((word) => {
      if (word.oculta) {
        delete word.oculta;
        word.completada = true;
      }
    })
  );
  renderCurrentLyrics(youtubePlayer.getCurrentTime());
  if (line1) line1.answered = true;
  if (line2) line2.answered = true;
  if (isPausedForAnswer) {
    isPausedForAnswer = false;
    do {
      currentPairIndex += 2;
    } while (
      currentPairIndex < syncedLyrics.length &&
      syncedLyrics[currentPairIndex]?.jugable === false
    );
    if (currentPairIndex >= syncedLyrics.length) return stopLyricsAnimation();
    const nextLine = syncedLyrics[currentPairIndex];
    //if (nextLine?.words?.length)
    //  youtubePlayer.seekTo(nextLine.words[0].start, true);
    restoreVolume();
    startLyricsAnimation();
    youtubePlayer.playVideo();
    resetLineState(currentPairIndex);
  }
}

function resetLineState(pairIndex) {
  [pairIndex, pairIndex + 1].forEach((i) => {
    if (syncedLyrics[i]) {
      syncedLyrics[i].paused = false;
      syncedLyrics[i].answered = false;
      syncedLyrics[i].words.forEach((word) => delete word.oculta);
    }
  });
  lastPairIndexShown = -1;
}

function actualizarBarraProgreso() {
  if (!youtubePlayer?.getCurrentTime) return;
  const currentTime = youtubePlayer.getCurrentTime(),
    duration = youtubePlayer.getDuration();
  if (!duration) return;
  const porcentaje = Math.floor((currentTime / duration) * 100);
  const barra = document.getElementById("progress-bar");
  if (barra) barra.style.width = porcentaje + "%";
}

