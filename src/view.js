import onChange from 'on-change';

const clear = (elements, i18nextInstance) => {
  const { input, feedback, button } = elements;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.classList.remove('text-warning');
  feedback.textContent = '';

  input.disabled = false;
  button.disabled = false;
  button.textContent = i18nextInstance.t('add');
};

const renderModal = (post) => {
  const {
    id, title, description, link,
  } = post;
  const modal = document.querySelector('.modal');
  const titleEl = modal.querySelector('.modal-title');
  const bodyEl = modal.querySelector('.modal-body');
  const postLink = modal.querySelector('.full-article');

  titleEl.textContent = title;
  bodyEl.textContent = description;

  modal.setAttribute('data-id', id);
  postLink.setAttribute('href', link);
};

// const renderVisitedPosts = (state) => {
//   state.visitedPostsId.forEach((id) => {
//     const link = document.querySelector(`a[data-id="${id}"]`);
//     link.classList.remove('fw-normal');
//     link.classList.add('fw-normal', 'link-secondary');
//   });
// };

const renderFeeds = (feeds, elements) => {
  const { feedsContainer, feedsTemplate, feedTemplate } = elements;

  const feedsElements = feeds.map((feed) => {
    const { title, description } = feed;
    const feedElement = feedTemplate.content.cloneNode(true);
    feedElement.querySelector('.feed-title').textContent = title;
    feedElement.querySelector('.feed-description').textContent = description;
    return feedElement;
  });

  const feedWrapper = feedsTemplate.content.cloneNode(true);
  const feedList = feedWrapper.querySelector('ul');

  feedsContainer.innerHTML = '';

  feedList.append(...feedsElements);
  feedsContainer.append(feedWrapper);
};

const renderPosts = (elements, state) => {
  const { postsContainer, templatePost, postsTemplate } = elements;
  const postsElements = state.posts.map(({ title, link, id }) => {
    const post = postsTemplate.content.cloneNode(true);
    const postLink = post.querySelector('a');
    postLink.textContent = title;
    postLink.href = link;
    postLink.setAttribute('data-id', id);

    const buttonPost = post.querySelector('button');
    buttonPost.setAttribute('data-id', id);
    if (state.visitedPostsId.has(id)) {
      postLink.classList.add('fw-normal', 'link-secondary');
    } else {
      postLink.classList.add('fw-bold');
    }
    return post;
  });

  const postsWrapper = templatePost.content.cloneNode(true);
  const postList = postsWrapper.querySelector('ul');

  postsContainer.innerHTML = '';

  postList.append(...postsElements);
  postsContainer.append(postsWrapper);
};

const renderError = (errType, elements, i18nextInstance) => {
  const { feedback, input } = elements;
  clear(elements, i18nextInstance);
  input.classList.add('is-invalid');
  feedback.textContent = i18nextInstance.t(errType);
  feedback.classList.add('text-danger');
};

const handleForm = (state, elements, i18nextInstance) => {
  const { input } = elements;
  const { status, errors } = state;
  switch (status) {
    case 'success': {
      clear(elements, i18nextInstance);
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
      clear(elements, i18nextInstance);
      input.focus();
      feedback.textContent = i18nextInstance.t('success');
      feedback.classList.add('text-success');
      input.readOnly = false;
      button.disabled = false;
      break;
    case 'loading':
      clear(elements, i18nextInstance);
      feedback.textContent = i18nextInstance.t('loading');
      feedback.classList.add('text-warning');
      input.readOnly = true;
      button.disabled = true;
      break;
    case 'failed':
      input.readOnly = false;
      button.disabled = false;
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
      renderPosts(elements, state);
      break;
    }
    case 'visitedPostsId': {
      // renderVisitedPosts(state);
      renderPosts(elements, state);
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
