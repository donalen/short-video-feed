export function createVideoCard({ id, src }) {
  const card = document.createElement("section");

  card.className = "video-card is-loading";
  card.dataset.videoId = String(id);

  card.innerHTML = `
    <video
      class="video-card__video"
      data-src="${src}"
      muted
      playsinline
      preload="metadata"
      aria-label="Video ${id}"
    ></video>

    <div class="video-card__spinner" aria-hidden="true"></div>

    <div class="video-card__error" role="alert">
      <p class="video-card__error-message">Не удалось загрузить видео</p>
      <button type="button" class="video-card__retry">Повторить</button>
    </div>

    <div class="video-card__playback-indicator" aria-hidden="true">
      ▶
    </div>

    <button
      type="button"
      class="video-card__mute"
      aria-pressed="true"
      aria-label="Unmute"
    >🔇</button>
  `;

  return card;
}
