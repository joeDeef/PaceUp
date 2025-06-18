fetch('components/header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;

    // Cargar el script del cambio de idioma después de insertar el header
    const script = document.createElement('script');
    script.src = 'js/language.js';
    document.body.appendChild(script);
  })
  .catch(err => {
    console.error('Error al cargar el header:', err);
  });
