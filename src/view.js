import onChange from "on-change";
import clear from "./cleaner";

const watch = (state, elements) =>
  onChange(state, (path, value) => {
    switch (path) {
      case "form.state": {
        formHandler(value, elements);
        break;
      }
      case "form.errors": {
        renderError(value, elements);
        break;
      }
      case "feeds": {
        renderFeeds(value, elements);
        break;
      }
      case "posts": {
        renderPosts(value, elements);
        
        break;
      }
      default:
        console.log("Unknown state");
    }
  });


const formHandler = (state, elements) => {
  const { input, feedback, button } = elements;
  switch (state) {
    case "sending": {
      clear(elements);
      feedback.textContent = "SENDING";
      feedback.classList.add("text-warning");
      input.disabled = "disabled";
      button.disabled = "disabled";
      button.textContent = "loading...";
      break;
    }
    case "success": {
      clear(elements);
      feedback.textContent = "RSS успешно загружен";
      feedback.classList.add("text-success");
      input.value = "";

      break;
    }

    case "failed": {
      clear(elements);
      input.value = "";
    }
    default:
      break;
  }
};

const renderFeeds = (feeds, elements) => {
  const { feedsContainer, templateFeed, templateFeedElement } = elements;

  const feedsElements = feeds.map((feed) => {
    const { title, description } = feed;
    const feedElement = templateFeedElement.content.cloneNode(true);
    feedElement.querySelector(".feed-title").textContent = title;
    feedElement.querySelector(".feed-description").textContent = description;
    return feedElement;
  });

  const feedWrapper = templateFeed.content.cloneNode(true);
  const feedList = feedWrapper.querySelector("ul");

  feedsContainer.innerHTML = "";

  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (posts, elements) => {
  const { postsContainer, templatePost, templatePostElement } = elements;
  const postsElements = posts.map((post) => {
    const { title, link } = post;
    const postElement = templatePostElement.content.cloneNode(true);
    const linkEl = postElement.querySelector("a");

    linkEl.textContent = title;
    linkEl.href = link;
    linkEl.setAttribute('data-id', post.id)

    const btn = postElement.querySelector('button')
    btn.setAttribute('data-id', post.id)

    return postElement;
  });

  const postsWrapper = templatePost.content.cloneNode(true);
  const postList = postsWrapper.querySelector("ul");

  postsContainer.innerHTML = "";

  postList.append(...postsElements);
  postsContainer.append(postsWrapper);
};

const parseError = (err) => {
  const mapping = {
    mustBeValid: "Ссылка должна быть валидным URL",
    linkExists: "RSS уже существует",
    invalidRSS: "Невалидный RSS"
  };

  return mapping[err];
};

const renderError = (errType, elements) => {
  const errMessage = parseError(errType);
  elements.feedback.textContent = errMessage;
  elements.feedback.classList.add("text-danger");
};

export default watch;
