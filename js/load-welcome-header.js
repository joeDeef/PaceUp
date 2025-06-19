import { loadSearchBar } from './load-search-bar.js';

async function loadWelcomeHeader() {
  const res = await fetch('./components/welcome-header.html');
  const html = await res.text();

  const headerContainer = document.getElementById('header-container');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const template = tempDiv.querySelector('#welcome-header-template');
  if (!template) {
    console.error('No se encontró el template #welcome-header-template');
    return;
  }

  const clone = template.content.cloneNode(true);

  // Insertar el fragmento como hermano siguiente del headerContainer
  headerContainer.parentNode.insertBefore(clone, headerContainer.nextSibling);

  const searchBarContainer = document.querySelector('#search-bar-container');
  if (!searchBarContainer) {
    console.error('No se encontró el contenedor #search-bar-container después de insertar el template');
    return;
  }

  await loadSearchBar(searchBarContainer);

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
