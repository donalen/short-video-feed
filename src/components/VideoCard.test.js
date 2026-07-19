import { describe, expect, it } from "vitest";
import { createVideoCard } from "./VideoCard.js";

describe("createVideoCard", () => {
  it("renders the elements the playback/loading/mute services rely on", () => {
    const card = createVideoCard({ id: 3, src: "/videos/video-03.MP4" });

    expect(card.dataset.videoId).toBe("3");
    expect(card.classList.contains("is-loading")).toBe(true);

    const video = card.querySelector(".video-card__video");
    expect(video.dataset.src).toBe("/videos/video-03.MP4");
    expect(video.hasAttribute("muted")).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.getAttribute("src")).toBeNull();

    expect(card.querySelector(".video-card__spinner")).not.toBeNull();
    expect(card.querySelector(".video-card__error")).not.toBeNull();
    expect(card.querySelector(".video-card__retry")).not.toBeNull();
    expect(
      card.querySelector(".video-card__playback-indicator"),
    ).not.toBeNull();

    const mute = card.querySelector(".video-card__mute");
    expect(mute).not.toBeNull();
    expect(mute.getAttribute("aria-pressed")).toBe("true");

    expect(card.querySelector(".video-card__progress-bar")).not.toBeNull();
  });
});
