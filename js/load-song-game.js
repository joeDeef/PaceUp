import { canciones } from "../data/songs.js";

let player;

export async function cargarVideo(nivelActual, id) {
  const contenedor = document.getElementById("nivel-content");
  contenedor.innerHTML = "";

  const res = await fetch("./components/song-game.html");
  const html = await res.text();
  contenedor.innerHTML = html;

  await new Promise((r) => setTimeout(r, 0));

  const cancion = canciones.find(c => c.id === String(id));
  if (!cancion) {
    contenedor.innerHTML = "<p>Canción no encontrada.</p>";
    return;
  }

  document.getElementById("video-title").textContent = cancion.title;
  const videoContainer = document.getElementById("video-container");
  videoContainer.innerHTML = `
    <div id="youtube-wrapper"></div>
  `;

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
      enablejsapi: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
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
}

function onPlayerStateChange(e) {
  const btn = document.getElementById("playpause-btn");
  if (e.data === YT.PlayerState.PLAYING) {
    btn.textContent = "⏸️ Pause";
  } else {
    btn.textContent = "▶️ Play";
  }
}

function extraerVideoId(url) {
  const match = url.match(/(?:embed\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}
