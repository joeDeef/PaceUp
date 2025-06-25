import { createCard } from "./create-card.js";
import { levelContent } from "../data/level-content.js";
import { catalogModes } from "../data/modes.js";
import { actualizarVista } from "./level-main.js";

// Función para cargar el contenido de un nivel específico
export function cargarContenidoNivel(nivel, modoSeleccionado = null, id = null) {
  const contenido = levelContent[nivel];
  const contenedor = document.getElementById("nivel-content");

  if (!contenido) {
    contenedor.innerHTML = "<p>Nivel no encontrado.</p>";
    return;
  }

  // Si ya se seleccionó un modo específico, cargar su componente
  if (modoSeleccionado) {
    switch (modoSeleccionado) {
      case "canciones":
        import("./load-songs.js").then((m) => m.cargarCanciones(nivel));
        break;
      case "videos":
        import("./load-songs.js").then((m) => m.cargarCanciones(id));
        break;
      case "gramatica":
        import("./cargarGramatica.js").then((m) => m.cargarGramaticaComponent(nivel));
        break;
      default:
        contenedor.innerHTML = `<p>Modo "${modoSeleccionado}" aún no implementado.</p>`;
        break;
    }
    return;
  }

  // Si no hay modo seleccionado, mostrar vista general del nivel
  fetch("./components/levelEspecific.html")
    .then((res) => res.text())
    .then((template) => {
      let htmlFinal = template
        .replace(/{{titulo}}/g, contenido.titulo)
        .replace(/{{bienvenida}}/g, contenido.bienvenida)
        .replace(/{{imagen}}/g, contenido.imagen)
        .replace(/{{descripcion}}/g, contenido.descripcion)
        .replace(/{{estandar}}/g, contenido.estandar || "");

      contenedor.innerHTML = htmlFinal;

      const cardTemplate = document.getElementById("card-template");
      const lista = document.getElementById("modos-dinamicos");

      if (cardTemplate && lista && contenido.modos) {
        contenido.modos.forEach((keyModo) => {
          const modo = catalogModes[keyModo];
          if (!modo) return;

          const { fragment } = createCard(
            {
              image: modo.imagen,
              title: modo.titulo,
              description: modo.descripcion,
              imageBgColor: "#f5f5f5",
              onClick: () => {
                actualizarVista(nivel, keyModo);
              },
            },
            cardTemplate
          );

          if (fragment) lista.appendChild(fragment);
        });
      }
    });
}
