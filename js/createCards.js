// Crea una tarjeta a partir de la plantilla y datos recibidos
export function createCard({ image, title, description, imageBgColor, onClick }, template) {
  if (!template) return null;

  // Clona la plantilla para crear la tarjeta
  const card = template.content.cloneNode(true);
  const cardElement = card.querySelector('.card');
  const imgWrapper = card.querySelector('.card-image-wrapper'); // fondo de la imagen
  const img = card.querySelector('.card-image');
  const h3 = card.querySelector('.card-title');
  const p = card.querySelector('.card-description');

  // Asigna datos a la tarjeta
  img.src = image;
  img.alt = title;
  h3.textContent = title;
  p.textContent = description;

  // Si se indica un color de fondo para la imagen, se aplica aquí
  if (imageBgColor) {
    imgWrapper.style.backgroundColor = imageBgColor;
  }

  // Agrega el evento click a la tarjeta
  cardElement.addEventListener('click', onClick);

  return card;
}
