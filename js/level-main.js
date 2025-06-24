import { setupSidebar } from './load-sidebar.js';
import { cargarContenidoNivel } from './load-level.js';
import { renderBreadcrumb } from './load-breadcrumb.js';
import { catalogModes } from '../data/modes.js'; // ✅ importante: para breadcrumb

export function actualizarVista(nivel, modo = null) {
  const urlParams = new URLSearchParams(location.search);

  // Actualiza parámetros
  urlParams.set('nivel', nivel);
  if (modo) {
    urlParams.set('modo', modo);
  } else {
    urlParams.delete('modo');
  }

  // Actualiza la URL sin recargar
  history.pushState({}, '', `level.html?${urlParams.toString()}`);

  // Vuelve a aplicar sidebar visual
  setupSidebar(nivel, actualizarVista);

  // Cargar contenido del nivel, y si modo está definido, ir directo a ese componente
  cargarContenidoNivel(nivel, modo, actualizarVista); // ✅ pasa actualizarVista

  // Breadcrumb dinámico
  const ruta = [{ label: 'Inicio', href: 'home.html' }];
  ruta.push({ label: nivel });

  if (modo) {
    const modoObj = catalogModes[modo];
    ruta.push({ label: modoObj?.titulo || modo });
  }

  renderBreadcrumb(ruta);
}

// Inicializar vista
fetch('./components/sidebar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('sidebar-container').innerHTML = html;

    const params = new URLSearchParams(location.search);
    const nivel = params.get("nivel") || "Basico1";
    const modo = params.get("modo") || null;
    actualizarVista(nivel, modo);
  });

// Soporte para botones atrás/adelante del navegador
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(location.search);
  const nivel = params.get("nivel") || "Basico1";
  const modo = params.get("modo") || null;
  actualizarVista(nivel, modo);
});
