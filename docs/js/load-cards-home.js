document.addEventListener("DOMContentLoaded", () => {
  fetch("data/modes.json")
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

        // Genera un id único para el encabezado h3
        const headingId = `modo-titulo-${index}`;

        // Le asignas ese id al h3 para que pueda ser referenciado
        card.innerHTML = `
    <h3 id="${headingId}" tabindex="0">${data.titulo}</h3>
    <img src="${data.imagen}" alt="${data.altText}" tabindex="0">
    <div class="practicar-content">
      <p tabindex="0">${data.descripcion}</p>
      ${
        data.activo
          ? `<button tabindex="0" onclick="window.location.href='level.html?nivel=Intermedio1&modo=${clave}'">Practicar</button>`
          : `<span class="proximamente-label" tabindex="0">Próximamente</span>`
      }
    </div>
  `;

        card.setAttribute("role", "listitem");

        contenedor.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error al cargar los modos:", error);
    });
});
