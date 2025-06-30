export function renderBreadcrumb(rutas = []) {
  const pathContainer = document.getElementById('breadcrumb-path');
  if (!pathContainer) return;

  pathContainer.innerHTML = '';

  rutas.forEach((ruta, index) => {
    if (index > 0) {
      pathContainer.appendChild(document.createTextNode(' / '));
    }
    const span = document.createElement('span');
    span.textContent = ruta.label;
    pathContainer.appendChild(span);
  });
}
