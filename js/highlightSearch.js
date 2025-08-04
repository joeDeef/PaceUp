export function handleSearch(formElement) {
  const input = formElement.querySelector("input[type='search']");
  const searchTerm = input.value.trim().toLowerCase();
  const context = formElement.dataset.context;

  if (!searchTerm) {
    resetView(context);
    return;
  }

  if (context === "cards") {
    filterCards(searchTerm);
  } else {
    highlightMatches(searchTerm);
  }
}

function filterCards(searchTerm) {
  const cards = document.querySelectorAll("#lista-canciones .card");

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const match = text.includes(searchTerm);
    card.style.display = match ? "" : "none";
  });
}

function resetView(context) {
  if (context === "cards") {
    const cards = document.querySelectorAll("#lista-canciones .card");
    cards.forEach(card => {
      card.style.display = "";
    });
  } else {
    removeHighlights();
  }
}

function highlightMatches(term) {
  removeHighlights();

  // Normalizar término (sin tildes y en minúsculas)
  const normalizedTerm = term
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // Función auxiliar para normalizar texto
  function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const regex = new RegExp(term, "gi"); // Lo dejamos para el reemplazo original

  let firstMarkFocused = false;

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (node.parentNode.closest("#lista-canciones")) continue; // No resaltar en cards
    if (node.nodeValue.trim().length < 2) continue;

    // Normalizar texto del nodo para comparación
    const normalizedNodeValue = normalizeText(node.nodeValue);

    // Buscar índice de término normalizado dentro del texto normalizado
    const index = normalizedNodeValue.indexOf(normalizedTerm);
    if (index === -1) continue;

    // Ahora vamos a construir el nuevo HTML con <mark> para las coincidencias
    // Pero no usamos directamente node.nodeValue.replace(regex, ...), 
    // porque el regex no ignora tildes.
    // Por eso hacemos un reemplazo manual:

    let resultHTML = "";
    let lastIndex = 0;
    let searchIndex = index;

    // Buscamos todas las ocurrencias normalizadas para marcar
    while (searchIndex !== -1) {
      // Obtener la longitud exacta del término en el texto original:
      // Como el término puede ser más corto o largo, vamos a tomar el substring de la longitud original del término
      // Buscamos la parte en el texto original que corresponde a la parte normalizada

      // Para simplificar, asumimos la misma longitud (puede fallar con ligaduras, pero es aceptable)
      const originalMatch = node.nodeValue.substr(searchIndex, term.length);

      // Añadir texto previo sin marcar
      resultHTML += node.nodeValue.substring(lastIndex, searchIndex);
      // Añadir texto marcado
      resultHTML += `<mark tabindex="0">${originalMatch}</mark>`;

      lastIndex = searchIndex + term.length;

      // Buscar siguiente ocurrencia normalizada
      const restText = normalizedNodeValue.substring(lastIndex);
      searchIndex = restText.indexOf(normalizedTerm);
      if (searchIndex !== -1) {
        searchIndex += lastIndex; // Ajustar índice al texto completo
      }
    }

    // Añadir resto del texto
    resultHTML += node.nodeValue.substring(lastIndex);

    // Crear span con innerHTML
    const span = document.createElement("span");
    span.innerHTML = resultHTML;

    node.parentNode.replaceChild(span, node);

    // Enfocar el primer mark agregado solo una vez
    if (!firstMarkFocused) {
      const firstMark = span.querySelector("mark");
      if (firstMark) {
        firstMark.focus();
        firstMarkFocused = true;
      }
    }
  }
}


export function removeHighlights() {
  document.querySelectorAll("mark").forEach(mark => {
    mark.replaceWith(document.createTextNode(mark.textContent));
  });
}
