export class Player {
  constructor() {
    this.currentVideo = null;
    this.indicatorTimers = new WeakMap();
    this.videos = new Set();

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: 0.75,
      },
    );

    document.addEventListener("keydown", this.handleKeydown);
  }

  observe(video) {
    this.videos.add(video);
    this.observer.observe(video);
    video.addEventListener("click", this.handleClick);
  }

  unobserve(video) {
    this.videos.delete(video);
    this.observer.unobserve(video);
    video.removeEventListener("click", this.handleClick);

    this.clearIndicatorTimer(video);

    if (this.currentVideo === video) {
      this.currentVideo = null;
    }
  }

  destroy() {
    this.videos.forEach((video) => {
      video.removeEventListener("click", this.handleClick);
      this.clearIndicatorTimer(video);
    });

    document.removeEventListener("keydown", this.handleKeydown);

    this.videos.clear();
    this.observer.disconnect();
    this.currentVideo = null;
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      const video = entry.target;

      if (!entry.isIntersecting) {
        this.pause(video, false);
        this.hideIndicator(video);

        if (this.currentVideo === video) {
          this.currentVideo = null;
        }

        return;
      }

      if (this.currentVideo && this.currentVideo !== video) {
        this.pause(this.currentVideo, false);
        this.hideIndicator(this.currentVideo);
      }

      this.currentVideo = video;

      this.play(video)
        .then(() => {
          this.hideIndicator(video);
        })
        .catch(() => {});
    });
  }

  handleClick = (event) => {
    const video = event.currentTarget;
    const feed = video.closest(".video-feed");

    this.currentVideo = video;
    this.togglePlayback(video);

    feed?.focus({ preventScroll: true });
  };

  handleKeydown = (event) => {
    if (event.code !== "Space" && event.code !== "Enter") {
      return;
    }

    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLButtonElement ||
      target?.isContentEditable
    ) {
      return;
    }

    if (!this.currentVideo) {
      return;
    }

    event.preventDefault();
    this.togglePlayback(this.currentVideo);
  };

  togglePlayback(video) {
    if (video.paused) {
      this.play(video)
        .then(() => {
          this.showIndicator(video, "❚❚", true);
        })
        .catch(() => {});
    } else {
      this.pause(video);
    }
  }

  play(video) {
    this.ensureLoaded(video);
    return video.play();
  }

  pause(video, showIndicator = true) {
    video.pause();

    if (showIndicator) {
      this.showIndicator(video, "▶");
    }
  }

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

    if (timerId === undefined) {
      return;
    }

    window.clearTimeout(timerId);
    this.indicatorTimers.delete(video);
  }

  getIndicator(video) {
    return video
      .closest(".video-card")
      ?.querySelector(".video-card__playback-indicator");
  }
}
