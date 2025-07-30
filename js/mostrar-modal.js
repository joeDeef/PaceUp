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
  document
    .getElementById("modal-ok-btn")
    .addEventListener("click", ocultarModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      ocultarModal();
    }
  });
}

function mostrarModal(mensaje) {
  crearModal();
  const modal = document.getElementById("modal-bloqueo");
  const mensajeElem = document.getElementById("modal-mensaje");
  if (!modal || !mensajeElem) return;

  mensajeElem.textContent = mensaje;
  modal.style.display = "flex";

  // Opcional: bloquear scroll de fondo mientras está abierto
  document.body.style.overflow = "hidden";
}

function ocultarModal() {
  const modal = document.getElementById("modal-bloqueo");
  if (!modal) return;

  modal.style.display = "none";

  // Restaurar scroll
  document.body.style.overflow = "";
}

export { mostrarModal, ocultarModal };
