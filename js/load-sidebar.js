import { cargarContenidoNivel } from './load-level.js';

// Datos estáticos con información de niveles (id, etiqueta e imagen)
const niveles = [
  { id: 'Basico1', label: 'Básico 1 (A1)', img: '../assets/img/levels/A1.png' },
  { id: 'Basico2', label: 'Básico 2 (A2)', img: '../assets/img/levels/A2.png' },
  { id: 'Intermedio1', label: 'Intermedio 1 (B1)', img: '../assets/img/levels/B1.png' },
  { id: 'Intermedio2', label: 'Intermedio 2 (B2)', img: '../assets/img/levels/B2.png' },
  { id: 'Avanzado1', label: 'Avanzado 1 (C1)', img: '../assets/img/levels/C1.png' },
  { id: 'Avanzado2', label: 'Avanzado 2 (C2)', img: '../assets/img/levels/C2.png' },
];

// Función para configurar la barra lateral con la lista de niveles
// selectedNivelId: nivel activo
// onNivelChange: función callback para cambio de nivel
export function setupSidebar(selectedNivelId, onNivelChange) {
  // Obtiene el contenedor UL de niveles
  const lista = document.getElementById('nivel-list');

  // Clona cada <li> para eliminar event listeners previos y limpiar imágenes
  lista.querySelectorAll('li').forEach(li => {
    li.replaceWith(li.cloneNode(true));
  });

  // Selecciona todos los <li> actualizados
  const items = lista.querySelectorAll('li');

  items.forEach(li => {
    // Quita clase activa para resetear estado visual
    li.classList.remove('active');

    // Elimina imagen preview si existe
    const existingImg = li.querySelector('.preview-img');
    if (existingImg) existingImg.remove();

    // Si el <li> corresponde al nivel seleccionado, activa estilos y añade imagen preview
    if (li.dataset.nivel === selectedNivelId) {
      li.classList.add('active');

      // Busca datos del nivel para añadir imagen
      const nivelData = niveles.find(n => n.id === li.dataset.nivel);
      if (nivelData) {
        // Crea el elemento <img> para la preview
        const img = document.createElement('img');
        img.src = nivelData.img;
        img.alt = nivelData.label;
        img.classList.add('preview-img');
        li.appendChild(img);
      }
    }

    // Añade evento click a cada <li> para disparar el callback con el nivel seleccionado
    li.addEventListener('click', () => {
      if (typeof onNivelChange === 'function') {
        onNivelChange(li.dataset.nivel);
      }
    });
  });
}
