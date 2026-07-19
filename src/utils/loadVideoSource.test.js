import { describe, expect, it, vi } from "vitest";
import { loadVideoSource } from "./loadVideoSource.js";

function createVideo({ src, dataSrc } = {}) {
  const video = document.createElement("video");

  if (src) {
    video.setAttribute("src", src);
  }

  if (dataSrc) {
    video.dataset.src = dataSrc;
  }

  video.load = vi.fn();

  return video;
}

describe("loadVideoSource", () => {
  it("does nothing when the video already has a src", () => {
    const video = createVideo({ src: "/a.mp4", dataSrc: "/b.mp4" });

    loadVideoSource(video);

    expect(video.getAttribute("src")).toBe("/a.mp4");
    expect(video.load).not.toHaveBeenCalled();
  });

  it("does nothing when there is no data-src to load", () => {
    const video = createVideo();

    loadVideoSource(video);

    expect(video.getAttribute("src")).toBeNull();
    expect(video.load).not.toHaveBeenCalled();
  });

  it("assigns the src from data-src and loads it", () => {
    const video = createVideo({ dataSrc: "/videos/video-00.MP4" });

    loadVideoSource(video);

    expect(video.getAttribute("src")).toBe("/videos/video-00.MP4");
    expect(video.load).toHaveBeenCalledTimes(1);
  });
});
