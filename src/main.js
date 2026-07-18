import "./styles/main.css";
import { videos } from "./data/videos.js";
import { createVideoCard } from "./components/VideoCard.js";

const app = document.querySelector("#app");

function renderFeed(items) {
  const feed = document.createElement("div");
  const fragment = document.createDocumentFragment();

  feed.className = "video-feed";

  items.forEach((video) => {
    fragment.append(createVideoCard(video));
  });

  feed.append(fragment);
  app.append(feed);
}

renderFeed(videos);
