let player;

window.onYouTubeIframeAPIReady = function() {
  player = new YT.Player('youtube-video', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
};

function onPlayerReady() {
  const retrocederBtn = document.getElementById("retroceder-btn");
  const adelantarBtn = document.getElementById("adelantar-btn");
  const playpauseBtn = document.getElementById("playpause-btn");

  if (!retrocederBtn || !adelantarBtn || !playpauseBtn) return;

  retrocederBtn.addEventListener("click", () => {
    const nuevoTiempo = Math.max(0, player.getCurrentTime() - 5);
    player.seekTo(nuevoTiempo, true);
  });

  adelantarBtn.addEventListener("click", () => {
    const nuevoTiempo = player.getCurrentTime() + 5;
    player.seekTo(nuevoTiempo, true);
  });

  playpauseBtn.addEventListener("click", () => {
    const estado = player.getPlayerState();
    if (estado === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });
}

function onPlayerStateChange(event) {
  const playpauseBtn = document.getElementById("playpause-btn");
  if (!playpauseBtn) return;

  if (event.data === YT.PlayerState.PLAYING) {
    playpauseBtn.textContent = "⏸️ Pause";
  } else if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED ||
    event.data === YT.PlayerState.CUED
  ) {
    playpauseBtn.textContent = "▶️ Play";
  }
}

// Cargar la API si no está cargada
if (!window.YT) {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
} else if (window.YT && window.YT.loaded) {
  window.onYouTubeIframeAPIReady();
}
