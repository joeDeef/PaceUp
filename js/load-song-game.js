import { canciones } from "../data/songs.js";

let youtubePlayer;
let syncedLyrics = [];
let currentPairIndex = 0;
let animationRunning = false;
let fadeInterval;
let isFading = false;
let lastPairIndexShown = -1;

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

    if (state === YT.PlayerState.PLAYING) {
      youtubePlayer.pauseVideo();
    } else {
      // Al dar play después de pausa:
      // 1. Si ya pausaste por la línea anterior, busca el tiempo de inicio de la primera palabra de la siguiente línea.
      const nextLineIndex = currentPairIndex;
      const nextLine = syncedLyrics[nextLineIndex];
      if (nextLine && nextLine.words && nextLine.words.length > 0) {
        const seekTime = nextLine.words[0].start;
        youtubePlayer.seekTo(seekTime, true);
      }
      restoreVolume(); // Subir volumen gradualmente
      startLyricsAnimation();
      youtubePlayer.playVideo();
    }
  };

  document.getElementById("adelantar-btn").onclick = () => {
    const newTime = youtubePlayer.getCurrentTime() + 2;
    youtubePlayer.seekTo(newTime, true);
    resetState();
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
    const adelantarBtn = document.getElementById("adelantar-btn");

    switch (e.code) {
      case "Space": // barra espacio
        e.preventDefault();
        playPauseBtn.click();
        break;
      case "ArrowLeft": // flecha izquierda
        e.preventDefault();
        retrocederBtn.click();
        break;
      case "ArrowRight": // flecha derecha
        e.preventDefault();
        adelantarBtn.click();
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
  lastPairIndexShown = -1; // Reinicia para permitir mostrar opciones desde el principio
  stopLyricsAnimation();
  syncedLyrics.forEach((line) => delete line.paused);
  renderCurrentLyrics(0);
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

  const lastWord = line2.words[line2.words.length - 1];
  const pauseTime = lastWord.end + 1;

  if (!line2.paused && currentTime >= lastWord.end && currentTime < pauseTime) {
    fadeOutVolume(1000);
  }

  if (!line2.paused && currentTime >= pauseTime) {
    youtubePlayer.pauseVideo();
    stopLyricsAnimation();
    line2.paused = true;
    currentPairIndex += 2;
  }

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
      if (currentTime >= word.start && currentTime < word.end) {
        cssClass = "cantandose"; // palabra cantándose
      } else if (currentTime >= word.end) {
        cssClass = "cantada"; // palabra ya cantada
      }
      return `<span class="${cssClass}">${word.text}</span>`;
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

  const palabras = [...(line1?.words || []), ...(line2?.words || [])];
  if (palabras.length < 4) return;

  const seleccionadas = [];
  while (seleccionadas.length < 4) {
    const randIndex = Math.floor(Math.random() * palabras.length);
    const palabra = palabras[randIndex].text;
    if (!seleccionadas.includes(palabra)) {
      seleccionadas.push(palabra);
    }
  }

  container.innerHTML = seleccionadas
    .map((word) => `<button class="opcion-palabra">${word}</button>`)
    .join("");
}
