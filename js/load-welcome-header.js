import { loadSearchBar } from './load-search-bar.js';

// Carga el header de bienvenida, lo inserta y agrega la barra de búsqueda
async function loadWelcomeHeader() {
  const res = await fetch('./components/welcome-header.html');
  const html = await res.text();

  const headerContainer = document.getElementById('header-container');

  // Parsear el HTML y obtener el template
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const template = tempDiv.querySelector('#welcome-header-template');
  if (!template) {
    console.error('No se encontró el template #welcome-header-template');
    return;
  }

  // Clonar contenido y colocar después del headerContainer
  const clone = template.content.cloneNode(true);
  headerContainer.parentNode.insertBefore(clone, headerContainer.nextSibling);

  // Buscar el contenedor para insertar la barra de búsqueda
  const searchBarContainer = document.querySelector('#search-bar-container');
  if (!searchBarContainer) {
    console.error('No se encontró el contenedor #search-bar-container después de insertar el template');
    return;
  }

  // Cargar la barra de búsqueda dentro del contenedor
  await loadSearchBar(searchBarContainer);

  // Mostrar u ocultar el header de bienvenida según scroll
  const welcomeHeader = document.querySelector('.welcome-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      welcomeHeader.classList.add('hidden');
    } else {
      welcomeHeader.classList.remove('hidden');
    }
  });
}

loadWelcomeHeader();
