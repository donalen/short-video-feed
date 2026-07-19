import { describe, expect, it, vi } from "vitest";
import { VideoLoader } from "./VideoLoader.js";

function createVideo(dataSrc) {
  const video = document.createElement("video");
  video.dataset.src = dataSrc;
  video.load = vi.fn();
  video.pause = vi.fn();
  return video;
}

describe("VideoLoader", () => {
  it("watches exactly one card-height (prev/current/next) around the viewport", () => {
    const loader = new VideoLoader();

    // Each .video-card is 100dvh, so a 100% rootMargin covers exactly
    // the adjacent card on each side - see VideoLoader.js.
    expect(loader.observer.rootMargin).toBe("100% 0px");
  });

  it("loads the video once it starts intersecting", () => {
    const loader = new VideoLoader();
    const video = createVideo("/videos/video-00.MP4");

    loader.handleIntersection([{ target: video, isIntersecting: true }]);

    expect(video.getAttribute("src")).toBe("/videos/video-00.MP4");
    expect(video.load).toHaveBeenCalledTimes(1);
  });

  it("does not reload a video that already has a src", () => {
    const loader = new VideoLoader();
    const video = createVideo("/videos/video-00.MP4");
    video.setAttribute("src", "/videos/video-00.MP4");

    loader.handleIntersection([{ target: video, isIntersecting: true }]);

    expect(video.load).not.toHaveBeenCalled();
  });

  it("frees the decoder by unloading the video once it leaves the watched area", () => {
    const loader = new VideoLoader();
    const video = createVideo("/videos/video-00.MP4");
    video.setAttribute("src", "/videos/video-00.MP4");

    loader.handleIntersection([{ target: video, isIntersecting: false }]);

    expect(video.pause).toHaveBeenCalledTimes(1);
    expect(video.getAttribute("src")).toBeNull();
    expect(video.load).toHaveBeenCalledTimes(1);
  });

  it("does nothing when an already-unloaded video leaves the watched area", () => {
    const loader = new VideoLoader();
    const video = createVideo("/videos/video-00.MP4");

    loader.handleIntersection([{ target: video, isIntersecting: false }]);

    expect(video.pause).not.toHaveBeenCalled();
    expect(video.load).not.toHaveBeenCalled();
  });
});
