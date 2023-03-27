import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import watch from './view.js';
import parseRSS from './parseRSS.js';
import resources from './locales/index.js';

const UPDATE_TIME = 5000;

const updatePosts = (wathcedState) => {
  const urls = wathcedState.feeds.map((feed) => feed.url);
  const promises = urls.map((url) => axios.get(addProxy(url), { timeout: UPDATE_TIME })
    .then((response) => {
      const data = parseRSS(response.data.contents);
      const oldPosts = wathcedState.posts;
      const diff = _.differenceBy(data.posts, oldPosts, 'link');
      wathcedState.posts = diff.concat(...wathcedState.posts);
      wathcedState.processLoading = { status: 'success', errors: '' };
    })
    .catch((err) => {
      console.log('err');
      wathcedState.processLoading = { status: 'failed', errors: err };
    }));
    console.log('status: `success`')
  // wathcedState.processLoading = { status: 'success', errors: '' };
  Promise.all(promises).finally(() => setTimeout(() => updatePosts(wathcedState), UPDATE_TIME));
};

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const fetchRSS = (url, wathcedState) => {
  wathcedState.processLoading = { status: 'sending', errors: '' };
  axios.get(addProxy(url), { delay: 10000 })
    .then((response) => {
      const data = parseRSS(response.data.contents);
      data.feed.id = _.uniqueId();
      data.feed.url = url;
      wathcedState.feeds.unshift(data.feed);
      const posts = data.posts.map((post) => ({ ...post, channelId: data.feed.id, id: _.uniqueId() }));
      wathcedState.form = { status: 'success', errors: '' };
      wathcedState.processLoading = { status: 'success', errors: '' };

      wathcedState.posts = [...posts, ...wathcedState.posts];
    })
    .catch((errors) => {
      console.log(`${errors} error in catch after updatePosts`);
      switch (errors.name) {
        case 'ParseError':
          wathcedState.processLoading = { status: 'failed', errors: errors.message };
          break;
        case 'ValidationError':
          wathcedState.form = { status: 'failed', errors: errors.message };
          break;
        default: console.log('xz');
      }
    });
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('[aria-label="add"]'),

    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),

    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),

    templateFeed: document.querySelector('#template-feeds-wrapper'),
    templateFeedElement: document.querySelector('#template-feed-element'),
    templatePost: document.querySelector('#template-posts-wrapper'),
    templatePostElement: document.querySelector('#template-post-element'),
  };

  const initialState = {
    form: {
      errors: '',
      status: 'filling',
    },
    processLoading: {
      errors: '',
      status: 'idle',
    },
    currentPost: null,
    visitedPostsId: [],
    feeds: [],
    posts: [],
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    const wathcedState = watch(initialState, elements, i18nextInstance);

    const validate = (url, feeds) => {
      const urls = feeds.map((feed) => feed.url);

      const userSchema = yup
        .string()
        .url('mustBeValid')
        .notOneOf(urls, 'linkExists')
        .required()
        .validate(url);
      return userSchema
        .then(() => null)
        .catch((error) => error);
    };

    //  .then((response) => {
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const { feeds } = wathcedState;
      validate(url, feeds)
        .then((error) => {
          if (error) {
            wathcedState.form = { status: 'failed', errors: error };
            console.log(`${error} Ошибка в ссылке валидации`);
            
          } else {
            // wathcedState.processLoading = { status: 'sending', errors: '' };
            // Процесс в форме не меняем - обработчик формы отвечает только за форму
            wathcedState.form = { status: 'sending', errors: '' };
            // вызвать функцию загрузки фида
            fetchRSS(url, wathcedState);
          }
        });

      wathcedState.feeds = [...wathcedState.feeds];
    });
    // EvtListener from posts btn
    // setTimeout(updatePosts(), 5000)
    setTimeout(() => updatePosts(wathcedState), UPDATE_TIME);

    const modal = document.querySelector('.modal');
    elements.posts.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-id')) {
        wathcedState.currentPost = e.target.dataset.id;
        wathcedState.visitedPostsId.push(e.target.dataset.id);
      }

      if (e.target.tagName === 'BUTTON') {
        const { id } = e.target.dataset;
        wathcedState.currentPost = wathcedState.posts.find(
          (post) => post.id === id,
        );
      }
    });
    const closeModal = document.querySelector('.btn-secondary');
    closeModal.addEventListener('click', () => {
      document.body.setAttribute('style', '');
      document.body.classList.remove('modal-open');
      modal.classList.remove('show');
      modal.removeAttribute('aria-modal');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('style', 'display: none;');
    });
    const btnClose = modal.querySelector('.btn-close');
    btnClose.addEventListener('click', () => {
      document.body.setAttribute('style', '');
      document.body.classList.remove('modal-open');
      modal.classList.remove('show');
      modal.removeAttribute('aria-modal');
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('style', 'display: none;');
    });
  });
};

// const addBtn = document.querySelector('data-bs-toggle');

// addBtn.addEventListener('click', (e) => {
//   e.preventDefault();
// console.log(e)
// })
