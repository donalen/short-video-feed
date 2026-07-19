import { vi } from "vitest";

// jsdom doesn't implement real media playback: play()/pause() throw or
// no-op, and paused/duration/currentTime are non-configurable readonly
// getters. This patches a <video> element with controllable stand-ins
// so services under test can drive it like a real player.
export function patchVideoElement(
  video,
  { paused = true, duration = 0, currentTime = 0 } = {},
) {
  let pausedState = paused;

  Object.defineProperty(video, "paused", {
    get: () => pausedState,
    configurable: true,
  });

  Object.defineProperty(video, "duration", {
    value: duration,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(video, "currentTime", {
    value: currentTime,
    writable: true,
    configurable: true,
  });

  video.play = vi.fn(() => {
    pausedState = false;
    return Promise.resolve();
  });

  video.pause = vi.fn(() => {
    pausedState = true;
  });

  video.load = vi.fn();

  return video;
}
