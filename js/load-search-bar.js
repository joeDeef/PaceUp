import { handleSearch, removeHighlights } from './highlightSearch.js';
window.handleSearch = handleSearch;

export async function loadSearchBar(container, context = "") {
  const res = await fetch('./components/search-bar.html');
  const html = await res.text();

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const template = tempDiv.querySelector('#search-bar-template');
  if (!template) {
    console.error('No se encontró el template #search-bar-template');
    return;
  }

  const clone = template.content.cloneNode(true);

  const form = clone.querySelector('form');
  form.dataset.context = context;

  container.innerHTML = '';
  container.appendChild(clone);

  if (!document.getElementById('search-bar-css')) {
    const link = document.createElement('link');
    link.id = 'search-bar-css';
    link.rel = 'stylesheet';
    link.href = '../css/search-bar.css';
    document.head.appendChild(link);
  }

  const input = container.querySelector('input[type="search"]');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        const form = input.closest('form');
        if (form) {
          handleSearch(form);
        }
      }
    });

    input.addEventListener('input', () => {
      if (input.value.trim() === '') {
        removeHighlights();
      }
    });
  }
}
