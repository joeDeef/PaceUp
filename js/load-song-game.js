import { canciones } from "../data/songs.js";

let youtubePlayer;
let syncedLyrics = [];
let currentLineIndex = -1;
let animationRunning = false;

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
  document.getElementById("video-container").innerHTML = '<div id="youtube-wrapper"></div>';

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
    playerVars: { controls: 0, modestbranding: 1, rel: 0, fs: 0 },
    events: {
      onReady: () => handlePlayerReady(song),
      onStateChange: handlePlayerStateChange,
    },
  });
}

function handlePlayerReady(song) {
  const btnPlay = document.getElementById("playpause-btn");
  const btnFwd = document.getElementById("adelantar-btn");
  const btnBack = document.getElementById("retroceder-btn");

  btnPlay.onclick = () => {
    const state = youtubePlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      youtubePlayer.pauseVideo();
    } else {
      youtubePlayer.playVideo();
      resetLinePauseFlags();
      startLyricsAnimation();
    }
  };

  btnFwd.onclick = () => {
    const newTime = youtubePlayer.getCurrentTime() + 5;
    youtubePlayer.seekTo(newTime, true);
    currentLineIndex = -1;
    resetLinePauseFlags();
    startLyricsAnimation();
  };

  btnBack.onclick = () => {
    const newTime = Math.max(0, youtubePlayer.getCurrentTime() - 5);
    youtubePlayer.seekTo(newTime, true);
    currentLineIndex = -1;
    resetLinePauseFlags();
    startLyricsAnimation();
  };

  resetLinePauseFlags();
  startLyricsAnimation();
}

function handlePlayerStateChange(event) {
  const btn = document.getElementById("playpause-btn");
  btn.textContent = event.data === YT.PlayerState.PLAYING ? "⏸️ Pause" : "▶️ Play";
  if (event.data === YT.PlayerState.PLAYING) startLyricsAnimation();
  else stopLyricsAnimation();
}

function extractVideoId(url) {
  const match = url.match(/(?:embed\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

async function loadLyrics(fileName) {
  const res = await fetch(`../data/lyrics/${fileName}`);
  syncedLyrics = await res.json();
  currentLineIndex = -1;
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

function resetLinePauseFlags() {
  syncedLyrics.forEach(line => delete line.paused);
}

function updateLyrics() {
  if (!youtubePlayer || typeof youtubePlayer.getCurrentTime !== "function" || !animationRunning) return;

  const currentTime = youtubePlayer.getCurrentTime();

  if (syncedLyrics.length > 0) {
    let i = syncedLyrics.length - 1;
    while (i >= 0 && currentTime < syncedLyrics[i].time) i--;
    if (i < 0) i = 0;

    if (i !== currentLineIndex) {
      currentLineIndex = i;
    }

    const currentLineObj = syncedLyrics[currentLineIndex];
    const lastWord = currentLineObj.words[currentLineObj.words.length - 1];
    const pauseThreshold = lastWord.end-0.01;

    if (currentTime < currentLineObj.time) {
      document.getElementById("linea-actual").textContent = "......";
    } else {
      renderLineKaraoke(currentLineObj, currentTime);
    }

    // Solo si no se ha pausado aún esta línea
    if (!currentLineObj.paused && currentTime >= pauseThreshold && currentTime < lastWord.end) {
      const playerState = youtubePlayer.getPlayerState();
      if (playerState === YT.PlayerState.PLAYING) {
        youtubePlayer.pauseVideo();
        currentLineObj.paused = true;
        stopLyricsAnimation();
        return; // No pedir otro frame hasta que vuelva a dar play
      }
    }
  }

  requestAnimationFrame(updateLyrics);
}

function renderLineKaraoke(line, currentTime) {
  const currentEl = document.getElementById("linea-actual");
  if (!currentEl) return;

  const html = line.words.map(word => {
    const cssClass = currentTime >= word.start ? "cantada" : "";
    return `<span class="${cssClass}">${word.text}</span>`;
  }).join(" ");

  currentEl.innerHTML = html;
}
