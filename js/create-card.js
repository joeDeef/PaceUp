export function createCard(
  { image, title, description, imageBgColor, onClick },
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
  img.alt = title;
  h3.textContent = title;
  p.textContent = description;

  if (imageBgColor) {
    imgWrapper.style.backgroundColor = imageBgColor;
  }

  cardElement.addEventListener("click", onClick);

  return { fragment, cardElement };
}
