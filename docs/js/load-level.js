import { createCard } from "./create-card.js";
import { actualizarVista } from "./level-main.js";

// Variables que contendrán los datos cargados desde JSON
let levelContent = {};
let catalogModes = {};

// Función para cargar el contenido del nivel desde JSON
async function cargarDatosNivel() {
  if (Object.keys(levelContent).length === 0) {
    const res = await fetch("data/level-content.json");
    levelContent = await res.json();
  }
}

// Función para cargar los modos desde JSON
async function cargarCatalogoModos() {
  if (Object.keys(catalogModes).length === 0) {
    const res = await fetch("data/modes.json");
    catalogModes = await res.json();
  }
}

// Función para cargar el contenido de un nivel específico
export async function cargarContenidoNivel(
  nivel,
  modoSeleccionado = null,
  id = null
) {
  await cargarDatosNivel();
  await cargarCatalogoModos();

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
        import("./loadSongs.js").then((m) => m.cargarCanciones(nivel, id));
        break;
      case "videos":
        import("./loadSongs.js").then((m) => m.cargarVideosInteractivos(nivel, id));
        break;
      case "gramatica":
        import("./cargarGramatica.js").then((m) =>
          m.cargarGramaticaComponent(nivel)
        );
        break;
      default:
        contenedor.innerHTML = `<p>Modo "${modoSeleccionado}" aún no implementado.</p>`;
        break;
    }
    return;
  }

  // Si no hay modo seleccionado, mostrar vista general del nivel
  fetch("components/levelEspecific.html")
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

          let onClick;
          if (keyModo === "gramatica") {
            // Si el modo es gramática, redirige a la página gramatica.html
            onClick = () => {
              actualizarVista(nivel, "gramatica");
            };
          } else {
            // Para los demás modos sigue como antes
            onClick = () => {
              actualizarVista(nivel, keyModo);
            };
          }

          const { fragment } = createCard(
            {
              image: modo.imagen,
              title: modo.titulo,
              description: modo.descripcion,
              altText: modo.altText,
              imageBgColor: "#f5f5f5",
              onClick,
            },
            cardTemplate
          );

          if (fragment) {
            // Hacer toda la tarjeta y sus hijos accesibles al click y Enter
            fragment.addEventListener("click", onClick);
            fragment.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            });
            // También para los hijos principales
            const title = fragment.querySelector(".card-title");
            const img = fragment.querySelector(".card-image");
            const desc = fragment.querySelector(".card-description");
            [title, img, desc].forEach((el) => {
              if (el) {
                el.addEventListener("click", (ev) => {
                  ev.stopPropagation();
                  onClick();
                });
                el.addEventListener("keydown", (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                  }
                });
              }
            });
            lista.appendChild(fragment);
          }
        });
      }
    });
}
