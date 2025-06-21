// Renderiza el breadcrumb con las rutas proporcionadas
export function renderBreadcrumb(rutas = []) {
  // Carga el contenido HTML del componente breadcrumb
  fetch('./components/breadcrumb.html')
    .then(res => res.text())
    .then(html => {
      // Obtiene el contenedor donde se insertará el breadcrumb
      const container = document.getElementById('breadcrumb-container');
      if (!container) return;

      // Inserta el HTML del breadcrumb en el contenedor
      container.innerHTML = html;

      // Obtiene el elemento donde se mostrará el camino de rutas
      const pathContainer = document.getElementById('breadcrumb-path');
      if (!pathContainer) return;

      // Limpia cualquier contenido previo del camino
      pathContainer.innerHTML = '';

      // Itera las rutas para construir el breadcrumb
      rutas.forEach((ruta, index) => {
        // Agrega un separador " / " entre rutas, excepto antes de la primera
        if (index > 0) {
          pathContainer.appendChild(document.createTextNode(' / '));
        }

        // Crea un span con el texto de la ruta y lo añade al contenedor
        const span = document.createElement('span');
        span.textContent = ruta.label;
        pathContainer.appendChild(span);
      });
    });
}
