import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Player } from "./Player.js";
import { createTestCard } from "../test/createTestCard.js";

function flushMicrotasks() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("Player", () => {
  let player;

  beforeEach(() => {
    player = new Player();
  });

  afterEach(() => {
    player.destroy();
    document.body.innerHTML = "";
  });

  describe("mute toggle", () => {
    it("toggles the global muted state and reflects it on the button", () => {
      const { card, video } = createTestCard();
      document.body.append(card);
      player.observe(video);

      card.querySelector(".video-card__mute").click();

      const button = card.querySelector(".video-card__mute");
      expect(player.muted).toBe(false);
      expect(video.muted).toBe(false);
      expect(button.getAttribute("aria-pressed")).toBe("false");
      expect(button.getAttribute("aria-label")).toBe("Mute");
    });
  });

  describe("togglePlayback", () => {
    it("plays a paused video and shows the pause icon", async () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);

      player.togglePlayback(video);
      await flushMicrotasks();

      expect(video.play).toHaveBeenCalledTimes(1);
      const indicator = card.querySelector(".video-card__playback-indicator");
      expect(indicator.dataset.icon).toBe("pause");
      expect(indicator.classList.contains("is-visible")).toBe(true);
    });

    it("pauses a playing video and shows the play icon", () => {
      const { card, video } = createTestCard({ paused: false });
      document.body.append(card);
      player.observe(video);

      player.togglePlayback(video);

      expect(video.pause).toHaveBeenCalledTimes(1);
      const indicator = card.querySelector(".video-card__playback-indicator");
      expect(indicator.dataset.icon).toBe("play");
    });
  });

  describe("autoplay-with-sound fallback", () => {
    it("retries muted when unmuted autoplay is rejected", async () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);
      player.muted = false;

      video.play = vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject(new Error("NotAllowedError")),
        )
        .mockImplementationOnce(() => Promise.resolve());

      await player.play(video);

      expect(video.play).toHaveBeenCalledTimes(2);
      expect(player.muted).toBe(true);
      expect(video.muted).toBe(true);
      expect(
        card.querySelector(".video-card__mute").getAttribute("aria-pressed"),
      ).toBe("true");
    });

    it("propagates the rejection when playback fails even muted", async () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);
      player.muted = true;

      video.play = vi.fn(() => Promise.reject(new Error("fatal")));

      await expect(player.play(video)).rejects.toThrow("fatal");
      expect(video.play).toHaveBeenCalledTimes(1);
    });
  });

  describe("scroll-driven autoplay debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("does not start playback for a video scrolled past quickly", () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);

      player.handleIntersection([{ target: video, isIntersecting: true }]);
      player.handleIntersection([{ target: video, isIntersecting: false }]);

      vi.advanceTimersByTime(200);

      expect(video.play).not.toHaveBeenCalled();
    });

    it("starts playback after the debounce delay when the video stays in view", () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);

      player.handleIntersection([{ target: video, isIntersecting: true }]);
      vi.advanceTimersByTime(200);

      expect(video.play).toHaveBeenCalledTimes(1);
    });

    it("pauses the previous video immediately when a new one becomes current", () => {
      const first = createTestCard({ paused: false });
      const second = createTestCard({ paused: true });
      document.body.append(first.card, second.card);
      player.observe(first.video);
      player.observe(second.video);
      player.currentVideo = first.video;

      player.handleIntersection([
        { target: second.video, isIntersecting: true },
      ]);

      expect(first.video.pause).toHaveBeenCalledTimes(1);
    });
  });

  describe("visibilitychange", () => {
    afterEach(() => {
      Object.defineProperty(document, "hidden", {
        value: false,
        configurable: true,
      });
    });

    it("pauses on hide and resumes on show when it was playing", () => {
      const { card, video } = createTestCard({ paused: false });
      document.body.append(card);
      player.observe(video);
      player.currentVideo = video;

      Object.defineProperty(document, "hidden", {
        value: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      expect(video.pause).toHaveBeenCalledTimes(1);

      Object.defineProperty(document, "hidden", {
        value: false,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
      expect(video.play).toHaveBeenCalledTimes(1);
    });

    it("does not resume a video that was already paused before hiding", () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);
      player.currentVideo = video;

      Object.defineProperty(document, "hidden", {
        value: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      Object.defineProperty(document, "hidden", {
        value: false,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      expect(video.play).not.toHaveBeenCalled();
    });
  });

  describe("keyboard controls", () => {
    it("toggles playback on Space for the current video", () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);
      player.currentVideo = video;

      document.dispatchEvent(
        new KeyboardEvent("keydown", { code: "Space", cancelable: true }),
      );

      expect(video.play).toHaveBeenCalledTimes(1);
    });

    it("ignores Space while typing in a text field", () => {
      const { card, video } = createTestCard({ paused: true });
      document.body.append(card);
      player.observe(video);
      player.currentVideo = video;

      const input = document.createElement("input");
      document.body.append(input);

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "Space",
          cancelable: true,
          bubbles: true,
        }),
      );

      expect(video.play).not.toHaveBeenCalled();
    });
  });
});
