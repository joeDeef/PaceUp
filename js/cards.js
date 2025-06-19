export function createCard({ image, title, description, onClick }, template) {
  if (!template) return null;

  const card = template.content.cloneNode(true);
  const cardElement = card.querySelector('.card');
  const img = card.querySelector('.card-image');
  const h3 = card.querySelector('.card-title');
  const p = card.querySelector('.card-description');

  img.src = image;
  img.alt = title;
  h3.textContent = title;
  p.textContent = description;

  cardElement.addEventListener('click', onClick);

  return card;
}
