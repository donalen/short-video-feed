import { loadVideoSource } from "../utils/loadVideoSource.js";

const AUTOPLAY_DEBOUNCE_MS = 120;

export class Player {
  constructor() {
    this.currentVideo = null;
    this.wasPlayingBeforeHidden = false;
    this.muted = true;
    this.indicatorTimers = new WeakMap();
    this.playTimers = new WeakMap();
    this.videos = new Set();

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: 0.75,
      },
    );

    document.addEventListener("keydown", this.handleKeydown);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  observe(video) {
    this.videos.add(video);
    this.observer.observe(video);
    video.addEventListener("click", this.handleClick);
    this.getMuteButton(video)?.addEventListener("click", this.handleMuteClick);
  }

  unobserve(video) {
    this.videos.delete(video);
    this.observer.unobserve(video);
    video.removeEventListener("click", this.handleClick);
    this.getMuteButton(video)?.removeEventListener(
      "click",
      this.handleMuteClick,
    );

    this.cancelPendingPlay(video);
    this.clearIndicatorTimer(video);

    if (this.currentVideo === video) {
      this.currentVideo = null;
    }
  }

  destroy() {
    this.videos.forEach((video) => {
      video.removeEventListener("click", this.handleClick);
      this.getMuteButton(video)?.removeEventListener(
        "click",
        this.handleMuteClick,
      );
      this.cancelPendingPlay(video);
      this.clearIndicatorTimer(video);
    });

    document.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );

    this.videos.clear();
    this.observer.disconnect();
    this.currentVideo = null;
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      const video = entry.target;

      if (!entry.isIntersecting) {
        this.cancelPendingPlay(video);
        this.pause(video, false);
        this.hideIndicator(video);

        if (this.currentVideo === video) {
          this.currentVideo = null;
        }

        return;
      }

      if (this.currentVideo && this.currentVideo !== video) {
        this.cancelPendingPlay(this.currentVideo);
        this.pause(this.currentVideo, false);
        this.hideIndicator(this.currentVideo);
      }

      this.currentVideo = video;
      this.schedulePlay(video);
    });
  }

  schedulePlay(video) {
    this.cancelPendingPlay(video);

    const timerId = window.setTimeout(() => {
      this.playTimers.delete(video);

      if (this.currentVideo !== video) {
        return;
      }

      this.play(video)
        .then(() => {
          this.hideIndicator(video);
        })
        .catch(() => {});
    }, AUTOPLAY_DEBOUNCE_MS);

    this.playTimers.set(video, timerId);
  }

  cancelPendingPlay(video) {
    const timerId = this.playTimers.get(video);

    if (timerId === undefined) {
      return;
    }

    window.clearTimeout(timerId);
    this.playTimers.delete(video);
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

  handleVisibilityChange = () => {
    const video = this.currentVideo;

    if (!video) {
      return;
    }

    if (document.hidden) {
      this.wasPlayingBeforeHidden = !video.paused;

      if (this.wasPlayingBeforeHidden) {
        this.pause(video, false);
      }

      return;
    }

    if (this.wasPlayingBeforeHidden) {
      this.wasPlayingBeforeHidden = false;
      this.play(video).catch(() => {});
    }
  };

  handleMuteClick = (event) => {
    const video = event.currentTarget
      .closest(".video-card")
      ?.querySelector(".video-card__video");

    if (!video) {
      return;
    }

    this.toggleMute(video);
  };

  toggleMute(video) {
    this.muted = !this.muted;
    video.muted = this.muted;
    this.updateMuteButton(video);
  }

  togglePlayback(video) {
    if (video.paused) {
      this.play(video)
        .then(() => {
          this.showIndicator(video, "pause", true);
        })
        .catch(() => {});
    } else {
      this.pause(video);
    }
  }

  play(video) {
    loadVideoSource(video);
    video.muted = this.muted;
    this.updateMuteButton(video);
    return video.play();
  }

  pause(video, showIndicator = true) {
    video.pause();

    if (showIndicator) {
      this.showIndicator(video, "play");
    }
  }

  showIndicator(video, icon, autoHide = false) {
    const indicator = this.getIndicator(video);

    if (!indicator) {
      return;
    }

    this.clearIndicatorTimer(video);

    indicator.dataset.icon = icon;
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

  updateMuteButton(video) {
    const button = this.getMuteButton(video);

    if (!button) {
      return;
    }

    button.setAttribute("aria-pressed", String(this.muted));
    button.setAttribute("aria-label", this.muted ? "Unmute" : "Mute");
  }

  getMuteButton(video) {
    return video.closest(".video-card")?.querySelector(".video-card__mute");
  }
}
