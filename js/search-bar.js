// search-bar.js
window.handleSearch = function(form) {
  const query = form.querySelector('input').value.trim();
  if (query) {
    alert('Buscar: ' + query);
    // Aquí tu lógica real de búsqueda
  }
}
