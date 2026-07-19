import { loadVideoSource } from "../utils/loadVideoSource.js";

export class VideoLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        // Each card is 100dvh, so a 100% margin covers exactly prev/next.
        rootMargin: "100% 0px",
      },
    );
  }

  observe(video) {
    this.observer.observe(video);
  }

  unobserve(video) {
    this.observer.unobserve(video);
  }

  destroy() {
    this.observer.disconnect();
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        this.load(video);
      } else {
        this.unload(video);
      }
    });
  }

  load(video) {
    loadVideoSource(video);
  }

  unload(video) {
    if (!video.getAttribute("src")) {
      return;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}
