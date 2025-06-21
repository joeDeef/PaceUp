import { createCard } from "./create-card.js";
import { levelContent } from "../data/level-content.js";
import { catalogModes } from "../data/modes.js";

// Función para cargar el contenido de un nivel específico
export function cargarContenidoNivel(nivel) {
  // Obtiene el contenido correspondiente al nivel solicitado
  const contenido = levelContent[nivel];
  // Obtiene el contenedor donde se insertará el contenido del nivel
  const contenedor = document.getElementById("nivel-content");

  // Si no existe contenido para el nivel, muestra mensaje de error y termina
  if (!contenido) {
    contenedor.innerHTML = "<p>Nivel no encontrado.</p>";
    return;
  }

  // Carga la plantilla HTML para el contenido específico del nivel
  fetch("./components/levelEspecific.html")
    .then((res) => res.text())
    .then((template) => {
      // Reemplaza los marcadores en la plantilla con los datos del nivel
      let htmlFinal = template
        .replace(/{{titulo}}/g, contenido.titulo)
        .replace(/{{bienvenida}}/g, contenido.bienvenida)
        .replace(/{{imagen}}/g, contenido.imagen);
      // Nota: No se reemplaza {{modos}}, ya que el contenedor para modos queda vacío

      // Inserta el HTML generado en el contenedor del nivel
      contenedor.innerHTML = htmlFinal;

      // Obtiene la plantilla para las tarjetas y el contenedor donde se añadirán las tarjetas dinámicas
      const cardTemplate = document.getElementById("card-template");
      const lista = document.getElementById("modos-dinamicos");

      // Si existe plantilla, contenedor y modos definidos, crea tarjetas para cada modo
      if (cardTemplate && lista && contenido.modos) {
        contenido.modos.forEach((keyModo) => {
          // Busca los datos del modo en el catálogo de modos
          const modo = catalogModes[keyModo];
          if (!modo) return; // Si no existe, salta

          // Crea la tarjeta usando la función createCard con los datos del modo
          const card = createCard(
            {
              image: modo.imagen,
              title: modo.titulo,
              description: modo.descripcion,
              imageBgColor: "#f5f5f5",
              onClick: () => console.log(`Clic en ${modo.titulo}`), // Evento click para debug
            },
            cardTemplate
          );

          // Si la tarjeta se creó correctamente, la añade al contenedor dinámico
          const { fragment } = createCard(
            {
              image: modo.imagen,
              title: modo.titulo,
              description: modo.descripcion,
              imageBgColor: "#f5f5f5",
              onClick: () => console.log(`Clic en ${modo.titulo}`),
            },
            cardTemplate
          );

          if (fragment) lista.appendChild(fragment);
        });
      }
    });
}
