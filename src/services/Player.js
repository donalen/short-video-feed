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
    video.addEventListener("click", this.handleClick);
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

  handleClick = (event) => {
    const video = event.currentTarget;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };
}
