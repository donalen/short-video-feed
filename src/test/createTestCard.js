import { createVideoCard } from "../components/VideoCard.js";
import { patchVideoElement } from "./patchVideoElement.js";

export function createTestCard(overrides = {}) {
  const card = createVideoCard({ id: 0, src: "/videos/video-00.MP4" });
  const video = card.querySelector(".video-card__video");

  patchVideoElement(video, overrides);

  return { card, video };
}
