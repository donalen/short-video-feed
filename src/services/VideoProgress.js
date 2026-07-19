export class VideoProgress {
  observe(video) {
    video.addEventListener("timeupdate", this.handleTimeUpdate);
    video.addEventListener("emptied", this.handleEmptied);
  }

  unobserve(video) {
    video.removeEventListener("timeupdate", this.handleTimeUpdate);
    video.removeEventListener("emptied", this.handleEmptied);
  }

  handleTimeUpdate = (event) => {
    const video = event.target;

    if (!video.duration) {
      return;
    }

    this.setProgress(video, (video.currentTime / video.duration) * 100);
  };

  handleEmptied = (event) => {
    this.setProgress(event.target, 0);
  };

  setProgress(video, percent) {
    const bar = this.getProgressBar(video);

    if (!bar) {
      return;
    }

    bar.style.width = `${percent}%`;
  }

  getProgressBar(video) {
    return video
      .closest(".video-card")
      ?.querySelector(".video-card__progress-bar");
  }
}
