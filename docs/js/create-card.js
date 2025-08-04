export function createCard(
  { image, title, description, imageBgColor, onClick, altText },
  template
) {
  if (!template) return null;

  const fragment = template.content.cloneNode(true);
  const cardElement = fragment.querySelector(".card");

  const imgWrapper = cardElement.querySelector(".card-image-wrapper");
  const img = cardElement.querySelector(".card-image");
  const h3 = cardElement.querySelector(".card-title");
  const p = cardElement.querySelector(".card-description");

  img.src = image;
  img.alt = altText;
  h3.textContent = title;
  p.textContent = description;

  // Agregar tabindex a los elementos solicitados
  img.tabIndex = 0;
  h3.tabIndex = 0;
  p.tabIndex = 0;

  if (imageBgColor) {
    imgWrapper.style.backgroundColor = imageBgColor;
  }

  cardElement.addEventListener("click", onClick);

  return { fragment, cardElement };
}
