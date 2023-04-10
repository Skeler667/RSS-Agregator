import onChange from 'on-change';
import clear from './cleaner.js';

const renderModal = (post) => {
  const {
    id, title, description, link,
  } = post;
  const modal = document.querySelector('.modal');
  const titleEl = modal.querySelector('.modal-title');
  const bodyEl = modal.querySelector('.modal-body');
  const linkEl = modal.querySelector('.full-article');

  titleEl.textContent = title;
  bodyEl.textContent = description;

  modal.setAttribute('data-id', id);
  linkEl.setAttribute('href', link);
};

const renderVisitedPosts = (state) => {
  state.visitedPostsId.forEach((id) => {
    const link = document.querySelector(`a[data-id="${id}"]`);
    link.classList.remove('fw-normal');
    link.classList.add('fw-normal', 'link-secondary');
  });
};

const renderFeeds = (feeds, elements) => {
  const { feedsContainer, templateFeed, templateFeedElement } = elements;

  const feedsElements = feeds.map((feed) => {
    const { title, description } = feed;
    const feedElement = templateFeedElement.content.cloneNode(true);
    feedElement.querySelector('.feed-title').textContent = title;
    feedElement.querySelector('.feed-description').textContent = description;
    return feedElement;
  });

  const feedWrapper = templateFeed.content.cloneNode(true);
  const feedList = feedWrapper.querySelector('ul');

  feedsContainer.innerHTML = '';

  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (posts, elements, state) => {
  const { postsContainer, templatePost, templatePostElement } = elements;
  const postsElements = posts.map((post) => {
    const { title, link, id } = post;
    const postElement = templatePostElement.content.cloneNode(true);
    const linkEl = postElement.querySelector('a');

    linkEl.textContent = title;
    linkEl.href = link;
    linkEl.setAttribute('data-id', post.id);

    const btn = postElement.querySelector('button');
    btn.setAttribute('data-id', post.id);
    if (state.visitedPostsId.has(id)) {
      linkEl.classList.add('fw-normal', 'link-secondary');
    } else {
      linkEl.classList.add('fw-bold');
    }
    return postElement;
  });

  const postsWrapper = templatePost.content.cloneNode(true);
  const postList = postsWrapper.querySelector('ul');

  postsContainer.innerHTML = '';

  postList.append(...postsElements);
  postsContainer.append(postsWrapper);
};

const renderError = (errType, elements, i18nextInstance) => {
  console.log(i18nextInstance.t(errType));
  const { feedback, input } = elements;
  clear(elements);
  input.classList.add('is-invalid');
  feedback.textContent = i18nextInstance.t(errType);
  feedback.classList.add('text-danger');
};

const handleForm = (state, elements, i18nextInstance) => {
  const { input } = elements;
  const { status, errors } = state;
  // console.log(`FORM:\nstatus: ${status}\nerrors:${errors}`)
  switch (status) {
    case 'success': {
      clear(elements);
      input.value = '';
      input.focus();
      break;
    }
    case 'failed':
      renderError(errors, elements, i18nextInstance);
      break;
    default:
      break;
  }
};

const handleProcess = (state, elements, i18nextInstance) => {
  const { status, errors } = state;
  const { input, button, feedback } = elements;
  switch (status) {
    case 'success':
      input.focus();
      feedback.textContent = i18nextInstance.t('success');
      feedback.classList.add('text-success');
      break;
    case 'loading':
      clear(elements);
      feedback.textContent = i18nextInstance.t('loading');
      feedback.classList.add('text-warning');
      input.disabled = 'disabled';
      button.disabled = 'disabled';
      button.textContent = 'loading...';
      break;
    case 'failed':
      renderError(errors, elements, i18nextInstance);
      break;
    default:
      break;
  }
};

const watch = (state, elements, i18nextInstance) => onChange(state, (path, value) => {
  switch (path) {
    case 'form': {
      handleForm(value, elements, i18nextInstance);
      break;
    }
    case 'processLoading': {
      handleProcess(value, elements, i18nextInstance);
      break;
    }
    case 'feeds': {
      renderFeeds(value, elements);
      break;
    }
    case 'posts': {
      renderPosts(value, elements, state);
      break;
    }
    case 'visitedPostsId': {
      renderVisitedPosts(state);
      break;
    }
    case 'currentPost': {
      renderModal(value);
      break;
    }
    default:
      break;
  }
});

export default watch;
