export class Player {
  constructor() {
    this.currentVideo = null;

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: 0.75,
      },
    );
  }

  observe(video) {
    this.observer.observe(video);
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      const video = entry.target;

      if (!entry.isIntersecting) {
        video.pause();
        return;
      }

      if (this.currentVideo && this.currentVideo !== video) {
        this.currentVideo.pause();
      }

      this.currentVideo = video;

      video.play().catch(() => {});
    });
  }
}
