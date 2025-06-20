// Carga el archivo HTML del header y lo inserta en el contenedor
fetch('components/header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;

    // Después de cargar el header, añade el script para el cambio de idioma
    const script = document.createElement('script');
    script.src = 'js/language.js';
    document.body.appendChild(script);
  })
  .catch(err => {
    console.error('Error al cargar el header:', err);
  });
