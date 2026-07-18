import "./styles/main.css";
import { videos } from "./data/videos.js";
import { createVideoCard } from "./components/VideoCard.js";
import { Player } from "./services/Player.js";

const app = document.querySelector("#app");
const player = new Player();

function renderFeed(items) {
  const feed = document.createElement("div");
  const fragment = document.createDocumentFragment();

  feed.className = "video-feed";

  items.forEach((videoData) => {
    const card = createVideoCard(videoData);
    const videoElement = card.querySelector("video");

    if (videoElement) {
      player.observe(videoElement);
    }

    fragment.append(card);
  });

  feed.append(fragment);
  app.append(feed);
}

renderFeed(videos);
