import { loadVideoSource } from "../utils/loadVideoSource.js";

// Scroll wobble near the watched-area boundary can flip isIntersecting
// back and forth within a single gesture. Loading is instant (start the
// fetch as soon as a video is in range), but unloading is debounced so a
// brief exit doesn't tear down and immediately re-request an already
// cached video.
const UNLOAD_DEBOUNCE_MS = 400;

export class VideoLoader {
  constructor() {
    this.unloadTimers = new WeakMap();

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
    this.cancelPendingUnload(video);
  }

  destroy() {
    this.observer.disconnect();
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        this.cancelPendingUnload(video);
        this.load(video);
      } else {
        this.scheduleUnload(video);
      }
    });
  }

  load(video) {
    loadVideoSource(video);
  }

  scheduleUnload(video) {
    this.cancelPendingUnload(video);

    const timerId = window.setTimeout(() => {
      this.unloadTimers.delete(video);
      this.unload(video);
    }, UNLOAD_DEBOUNCE_MS);

    this.unloadTimers.set(video, timerId);
  }

  cancelPendingUnload(video) {
    const timerId = this.unloadTimers.get(video);

    if (timerId === undefined) {
      return;
    }

    window.clearTimeout(timerId);
    this.unloadTimers.delete(video);
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
