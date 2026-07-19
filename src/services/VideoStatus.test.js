import { describe, expect, it } from "vitest";
import { VideoStatus } from "./VideoStatus.js";
import { createTestCard } from "../test/createTestCard.js";

describe("VideoStatus", () => {
  it("shows the loading state on loadstart", () => {
    const status = new VideoStatus();
    const { card, video } = createTestCard();
    document.body.append(card);
    status.observe(video);

    video.dispatchEvent(new Event("loadstart"));

    expect(card.classList.contains("is-loading")).toBe(true);
  });

  it("switches to ready once the video can play", () => {
    const status = new VideoStatus();
    const { card, video } = createTestCard();
    document.body.append(card);
    status.observe(video);

    video.dispatchEvent(new Event("loadstart"));
    video.dispatchEvent(new Event("canplay"));

    expect(card.classList.contains("is-loading")).toBe(false);
    expect(card.classList.contains("is-ready")).toBe(true);
  });

  it("shows the error state when a loaded video fails", () => {
    const status = new VideoStatus();
    const { card, video } = createTestCard();
    document.body.append(card);
    video.setAttribute("src", "/videos/video-00.MP4");
    status.observe(video);

    video.dispatchEvent(new Event("error"));

    expect(card.classList.contains("is-error")).toBe(true);
  });

  it("ignores error events fired while the video has no src (intentional unload)", () => {
    const status = new VideoStatus();
    const { card, video } = createTestCard();
    document.body.append(card);
    card.classList.remove("is-loading");
    card.classList.add("is-ready");
    status.observe(video);

    video.dispatchEvent(new Event("error"));

    expect(card.classList.contains("is-error")).toBe(false);
    expect(card.classList.contains("is-ready")).toBe(true);
  });

  it("retries loading and resets to the loading state on retry click", () => {
    const status = new VideoStatus();
    const { card, video } = createTestCard();
    document.body.append(card);
    card.classList.remove("is-loading");
    card.classList.add("is-error");
    status.observe(video);

    card.querySelector(".video-card__retry").click();

    expect(video.load).toHaveBeenCalledTimes(1);
    expect(card.classList.contains("is-loading")).toBe(true);
    expect(card.classList.contains("is-error")).toBe(false);
  });

  it("stops reacting after unobserve", () => {
    const status = new VideoStatus();
    const { card, video } = createTestCard();
    document.body.append(card);
    status.observe(video);
    status.unobserve(video);

    video.dispatchEvent(new Event("canplay"));

    expect(card.classList.contains("is-ready")).toBe(false);
    expect(card.classList.contains("is-loading")).toBe(true);
  });
});
