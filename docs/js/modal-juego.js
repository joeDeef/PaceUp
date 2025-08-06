let modalFinalCreado = false;

function crearModalFinal() {
  if (modalFinalCreado) return;

  const modalHTML = `
    <div id="modal-final" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <img src="https://cdn-icons-png.flaticon.com/512/3159/3159066.png" alt="Felicidades" class="modal-img" />
        <h2>🎉 ¡Felicidades!</h2>
        <p><strong>Puntos:</strong> <span id="modal-puntos">0</span></p>
        <p><strong>Aciertos:</strong> <span id="modal-aciertos">0</span></p>
        <p><strong>Fallas:</strong> <span id="modal-fallas">0</span></p>
        <p><strong>Tiempo:</strong> <span id="modal-tiempo">0s</span></p>
        <button id="modal-ok-btn">OK</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  modalFinalCreado = true;

  // Eventos: cerrar con botón o teclas
  const okBtn = document.getElementById('modal-ok-btn');
  okBtn.addEventListener('click', () => {
    ocultarModalFinal();
    if (redireccionFinal) window.location.href = redireccionFinal;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      ocultarModalFinal();
      if (redireccionFinal) window.location.href = redireccionFinal;
    }
    trapFocusFinal(e);
  });
}

let redireccionFinal = null;

export function mostrarModalFinal({ puntos, aciertos, fallas, tiempoSegundos, redireccion }) {
  crearModalFinal();

  const minutos = Math.floor(tiempoSegundos / 60);
  const segundos = tiempoSegundos % 60;
  const tiempoFormateado = `${minutos}m ${segundos}s`;

  document.getElementById('modal-puntos').textContent = puntos;
  document.getElementById('modal-aciertos').textContent = aciertos;
  document.getElementById('modal-fallas').textContent = fallas;
  document.getElementById('modal-tiempo').textContent = tiempoFormateado;

  const modal = document.getElementById('modal-final');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  document.getElementById('modal-ok-btn').focus();

  redireccionFinal = redireccion;
}

export function ocultarModalFinal() {
  const modal = document.getElementById('modal-final');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  redireccionFinal = null;
}

function trapFocusFinal(e) {
  const modal = document.getElementById('modal-final');
  if (!modal || modal.style.display !== 'flex') return;

  const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}
