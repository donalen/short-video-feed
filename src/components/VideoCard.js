export function createVideoCard({ id, src }) {
  const card = document.createElement("section");

  card.className = "video-card";
  card.dataset.videoId = String(id);

  card.innerHTML = `
    <video
      class="video-card__video"
      src="${src}"
      controls
      muted
      playsinline
      preload="metadata"
    ></video>
  `;

  return card;
}
