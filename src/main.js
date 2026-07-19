import "./styles/main.css";
import { videos } from "./data/videos.js";
import { createVideoCard } from "./components/VideoCard.js";
import { Player } from "./services/Player.js";
import { VideoLoader } from "./services/VideoLoader.js";
import { VideoStatus } from "./services/VideoStatus.js";

const feed = document.querySelector(".video-feed");

if (!feed) {
  throw new Error('Video feed container ".video-feed" was not found');
}

const player = new Player();
const videoLoader = new VideoLoader();
const videoStatus = new VideoStatus();

videos.forEach((videoData) => {
  const card = createVideoCard(videoData);
  const video = card.querySelector(".video-card__video");

  if (!video) {
    return;
  }

  feed.append(card);

  player.observe(video);
  videoLoader.observe(video);
  videoStatus.observe(video);
});

feed.focus({ preventScroll: true });
