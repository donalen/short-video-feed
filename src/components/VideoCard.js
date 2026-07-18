export function createVideoCard({ id, src }) {
  const card = document.createElement("section");

  card.className = "video-card";
  card.dataset.videoId = String(id);

  card.innerHTML = `
    <video
      class="video-card__video"
      data-src="${src}"
      muted
      playsinline
      preload="metadata"
    ></video>

    <div class="video-card__playback-indicator" aria-hidden="true">
      ▶
    </div>
  `;

  return card;
}
