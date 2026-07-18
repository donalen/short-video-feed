export class VideoLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: "100% 0px",
      },
    );
  }

  observe(video) {
    this.observer.observe(video);
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      this.load(entry.target);
    });
  }

  load(video) {
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
}
