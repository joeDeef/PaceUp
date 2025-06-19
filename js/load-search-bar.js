export async function loadSearchBar(container) {
  const res = await fetch('./components/search-bar.html');
  const html = await res.text();

  // Parsear el HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Obtener el template
  const template = tempDiv.querySelector('#search-bar-template');
  if (!template) {
    console.error('No se encontró el template #search-bar-template');
    return;
  }

  // Clonar contenido
  const clone = template.content.cloneNode(true);

  // Insertar en el container
  container.appendChild(clone);

  // Insertar estilos si no están
  if (!document.getElementById('search-bar-css')) {
    const link = document.createElement('link');
    link.id = 'search-bar-css';
    link.rel = 'stylesheet';
    link.href = './css/search-bar.css';
    document.head.appendChild(link);
  }
}
