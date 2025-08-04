// Insertar el HTML del modal en el body solo una vez
function crearModal() {
  if (document.getElementById("modal-bloqueo")) return; // evitar duplicados

  const modalHTML = `
    <div id="modal-bloqueo" class="modal-overlay" style="display:none;">
      <div class="modal-content">
        <p id="modal-mensaje"></p>
        <button id="modal-ok-btn">OK</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Agregar listener al botón OK para cerrar modal
  const okBtn = document.getElementById("modal-ok-btn");
  okBtn.addEventListener("click", ocultarModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Enter") {
      ocultarModal();
    }
    trapFocus(e);
  });
}

// Bloqueo de foco/tabulación global para el modal
function trapFocus(e) {
  const modal = document.getElementById("modal-bloqueo");
  if (!modal || modal.style.display !== "flex") return;
  const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.key === "Tab") {
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

function mostrarModal(mensaje) {
  crearModal();
  const modal = document.getElementById("modal-bloqueo");
  const mensajeElem = document.getElementById("modal-mensaje");
  const okBtn = document.getElementById("modal-ok-btn");
  if (!modal || !mensajeElem || !okBtn) return;

  mensajeElem.textContent = mensaje;
  modal.style.display = "flex";

  // Bloquear scroll y foco
  document.body.style.overflow = "hidden";
  okBtn.focus();
}

function ocultarModal() {
  const modal = document.getElementById("modal-bloqueo");
  if (!modal) return;

  modal.style.display = "none";

  // Restaurar scroll
  document.body.style.overflow = "";
}

export { mostrarModal, ocultarModal };
