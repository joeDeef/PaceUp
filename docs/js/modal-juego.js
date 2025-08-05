export async function mostrarModalFinal({ puntos, aciertos, fallas, tiempoSegundos, redireccion }) {
  const minutos = Math.floor(tiempoSegundos / 60);
  const segundos = tiempoSegundos % 60;
  const tiempoFormateado = `${minutos}m ${segundos}s`;

  // Cargar el HTML del modal desde archivo externo
  const response = await fetch('components/modal-juego.html');
  const html = await response.text();

  // Insertar en el DOM
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // Inyectar datos
  document.getElementById('modal-puntos').textContent = puntos;
  document.getElementById('modal-aciertos').textContent = aciertos;
  document.getElementById('modal-fallas').textContent = fallas;
  document.getElementById('modal-tiempo').textContent = tiempoFormateado;

  // Redirección al hacer clic en OK
  document.getElementById('modal-ok-btn').addEventListener('click', () => {
    window.location.href = redireccion;
  });
}
