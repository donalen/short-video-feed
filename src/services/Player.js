export class Player {
  constructor() {
    this.currentVideo = null;
    this.indicatorTimers = new WeakMap();

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
        this.hideIndicator(video);
        return;
      }

      if (this.currentVideo && this.currentVideo !== video) {
        this.currentVideo.pause();
        this.hideIndicator(this.currentVideo);
      }

      this.currentVideo = video;
      this.ensureLoaded(video);

      video
        .play()
        .then(() => {
          this.hideIndicator(video);
        })
        .catch(() => {});
    });
  }

  handleClick = (event) => {
    const video = event.currentTarget;

    if (video.paused) {
      this.ensureLoaded(video);

      video
        .play()
        .then(() => {
          this.showIndicator(video, "❚❚", true);
        })
        .catch(() => {});
    } else {
      video.pause();
      this.showIndicator(video, "▶");
    }
  };

  ensureLoaded(video) {
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

  showIndicator(video, symbol, autoHide = false) {
    const indicator = this.getIndicator(video);

    if (!indicator) {
      return;
    }

    this.clearIndicatorTimer(video);

    indicator.textContent = symbol;
    indicator.classList.add("is-visible");

    if (autoHide) {
      const timerId = window.setTimeout(() => {
        indicator.classList.remove("is-visible");
        this.indicatorTimers.delete(video);
      }, 500);

      this.indicatorTimers.set(video, timerId);
    }
  }

  hideIndicator(video) {
    const indicator = this.getIndicator(video);

    if (!indicator) {
      return;
    }

    this.clearIndicatorTimer(video);
    indicator.classList.remove("is-visible");
  }

  clearIndicatorTimer(video) {
    const timerId = this.indicatorTimers.get(video);

    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      this.indicatorTimers.delete(video);
    }
  }

  getIndicator(video) {
    return video
      .closest(".video-card")
      ?.querySelector(".video-card__playback-indicator");
  }
}
