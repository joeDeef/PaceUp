// Carga el archivo HTML del header y lo inserta en el contenedor
fetch('components/header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;

  })
  .catch(err => {
    console.error('Error al cargar el header:', err);
  });
