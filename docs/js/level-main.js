import { setupSidebar } from "./load-sidebar.js";
import { cargarContenidoNivel } from "./load-level.js";

/**
 * Actualiza la vista con nivel, modo e id opcional.
 * pushState controla si se modifica el historial (true salvo al iniciar o popstate)
 */
export async function actualizarVista(
  nivel,
  modo = null,
  id = null,
  pushState = true
) {
  const urlParams = new URLSearchParams(location.search);
  urlParams.set("nivel", nivel);

  if (modo) urlParams.set("modo", modo);
  else urlParams.delete("modo");

  if (id) urlParams.set("id", id);
  else urlParams.delete("id");

  if (pushState) {
    history.pushState({}, "", `level.html?${urlParams.toString()}`);
  }

  // Actualiza sidebar, pasando callback para cambio de nivel (sin modo ni id)
  setupSidebar(nivel, (nuevoNivel) =>
    actualizarVista(nuevoNivel, null, null, true)
  );

  // Carga el contenido con nivel, modo e id
  cargarContenidoNivel(nivel, modo, id);
}

// Carga inicial (sin modificar historial porque ya está la URL)
fetch("components/sidebar.html")
  .then((res) => res.text())
  .then((html) => {
    document.getElementById("sidebar-container").innerHTML = html;

    const params = new URLSearchParams(location.search);
    const nivel = params.get("nivel") || "Basico1";
    const modo = params.get("modo") || null;
    const id = params.get("id") || null;

    actualizarVista(nivel, modo, id, false);
  });

// Manejar botón atrás/adelante (sin modificar historial)
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(location.search);
  const nivel = params.get("nivel") || "Basico1";
  const modo = params.get("modo") || null;
  const id = params.get("id") || null;

  actualizarVista(nivel, modo, id, false);
});