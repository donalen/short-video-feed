export class VideoStatus {
  observe(video) {
    video.addEventListener("loadstart", this.handleLoadStart);
    video.addEventListener("canplay", this.handleCanPlay);
    video.addEventListener("error", this.handleError);

    this.getRetryButton(video)?.addEventListener("click", this.handleRetry);
  }

  unobserve(video) {
    video.removeEventListener("loadstart", this.handleLoadStart);
    video.removeEventListener("canplay", this.handleCanPlay);
    video.removeEventListener("error", this.handleError);

    this.getRetryButton(video)?.removeEventListener(
      "click",
      this.handleRetry,
    );
  }

  handleLoadStart = (event) => {
    this.setState(event.target, "loading");
  };

  handleCanPlay = (event) => {
    this.setState(event.target, "ready");
  };

  handleError = (event) => {
    const video = event.target;

    if (!video.getAttribute("src")) {
      return;
    }

    this.setState(video, "error");
  };

  handleRetry = (event) => {
    const card = event.currentTarget.closest(".video-card");
    const video = card?.querySelector(".video-card__video");

    if (!video) {
      return;
    }

    this.setState(video, "loading");
    video.load();
  };

  setState(video, state) {
    const card = video.closest(".video-card");

    if (!card) {
      return;
    }

    card.classList.remove("is-loading", "is-ready", "is-error");
    card.classList.add(`is-${state}`);
  }

  getRetryButton(video) {
    return video.closest(".video-card")?.querySelector(".video-card__retry");
  }
}
