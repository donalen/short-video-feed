export function loadVideoSource(video) {
  if (video.getAttribute("src")) {
    return;
  }

  const source = video.dataset.src;

  if (!source) {
    return;
  }

  video.src = source;
  video.load();
}
