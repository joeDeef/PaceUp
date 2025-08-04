document.addEventListener("DOMContentLoaded", () => {
  fetch("../data/modes.json")
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");
      return response.json();
    })
    .then((modos) => {
      const contenedor = document.getElementById("practicar-section");

      Object.entries(modos).forEach(([clave, data], index) => {
        const card = document.createElement("div");
        card.className = "practicar-card";
        card.setAttribute("role", "region");
        card.setAttribute("aria-label", `${data.titulo}`);
        card.setAttribute("tabindex", "0");

        const contenidoBoton = data.activo
          ? `<button tabindex="0" aria-label="Practicar ${data.titulo}" onclick="window.location.href='level.html?nivel=Intermedio1&modo=${clave}'">Practicar</button>`
          : `<span class="proximamente-label" tabindex="0" aria-label="Modo próximamente disponible">Próximamente</span>`;

        card.innerHTML = `
          <h3 tabindex="0">${data.titulo}</h3>
          <img src="${data.imagen}" alt="${data.altText}" tabindex="0">
          <div class="practicar-content" aria-label="Contenido del modo ${data.titulo}">
            <p tabindex="0">${data.descripcion}</p>
            ${contenidoBoton}
          </div>
        `;

        contenedor.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error al cargar los modos:", error);
    });
});
