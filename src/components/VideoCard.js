export function createVideoCard({ id, title, description }) {
  const card = document.createElement("section");

  card.className = "video-card";
  card.dataset.videoId = String(id);

  card.innerHTML = `
    <div class="video-card__content">
      <h2 class="video-card__title">${title}</h2>
      <p class="video-card__description">${description}</p>
    </div>
  `;

  return card;
}
