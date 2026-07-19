import { describe, expect, it } from "vitest";
import { VideoProgress } from "./VideoProgress.js";
import { createTestCard } from "../test/createTestCard.js";

describe("VideoProgress", () => {
  it("updates the progress bar width on timeupdate", () => {
    const progress = new VideoProgress();
    const { card, video } = createTestCard({ duration: 10, currentTime: 2.5 });
    document.body.append(card);
    progress.observe(video);

    video.dispatchEvent(new Event("timeupdate"));

    const bar = card.querySelector(".video-card__progress-bar");
    expect(bar.style.width).toBe("25%");
  });

  it("ignores timeupdate before duration is known", () => {
    const progress = new VideoProgress();
    const { card, video } = createTestCard({ duration: 0, currentTime: 0 });
    document.body.append(card);
    progress.observe(video);

    video.dispatchEvent(new Event("timeupdate"));

    const bar = card.querySelector(".video-card__progress-bar");
    expect(bar.style.width).toBe("");
  });

  it("resets the bar to 0% when the video is unloaded", () => {
    const progress = new VideoProgress();
    const { card, video } = createTestCard({ duration: 10, currentTime: 8 });
    document.body.append(card);
    progress.observe(video);

    video.dispatchEvent(new Event("timeupdate"));
    video.dispatchEvent(new Event("emptied"));

    const bar = card.querySelector(".video-card__progress-bar");
    expect(bar.style.width).toBe("0%");
  });

  it("stops updating after unobserve", () => {
    const progress = new VideoProgress();
    const { card, video } = createTestCard({ duration: 10, currentTime: 1 });
    document.body.append(card);
    progress.observe(video);
    progress.unobserve(video);

    video.dispatchEvent(new Event("timeupdate"));

    const bar = card.querySelector(".video-card__progress-bar");
    expect(bar.style.width).toBe("");
  });
});
