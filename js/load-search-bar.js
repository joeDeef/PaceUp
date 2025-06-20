// Función para cargar el buscador desde un template y agregarlo a un contenedor
export async function loadSearchBar(container) {
  const res = await fetch('./components/search-bar.html');
  const html = await res.text();

  // Parsear el HTML y obtener el template
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const template = tempDiv.querySelector('#search-bar-template');
  if (!template) {
    console.error('No se encontró el template #search-bar-template');
    return;
  }

  // Clonar y agregar el contenido al contenedor dado
  const clone = template.content.cloneNode(true);
  container.appendChild(clone);

  // Agregar CSS solo si no existe
  if (!document.getElementById('search-bar-css')) {
    const link = document.createElement('link');
    link.id = 'search-bar-css';
    link.rel = 'stylesheet';
    link.href = '../css/search-bar.css';
    document.head.appendChild(link);
  }
}
