// Función que maneja el evento submit del formulario de búsqueda
window.handleSearch = function(form) {
  const query = form.querySelector('input').value.trim();
  if (query) {
    alert('Buscar: ' + query);
    //Lógica real para buscar con la query
  }
}
