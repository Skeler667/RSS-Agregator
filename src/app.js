import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import watch from './view.js';
import parseRSS from './parseRSS.js';
import resources from './locales/index.js';

const UPDATE_TIME = 5000;
const TIMEOUT = 10000;

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const updatePosts = (state) => {
  const promises = state.feeds.map((feed) => axios.get(addProxy(feed.url), { timeout: TIMEOUT })
    .then((response) => {
      const oldPosts = state.posts;
      const { posts: newPosts } = parseRSS(response.data.contents);
      const posts = _.differenceBy(newPosts, oldPosts, 'link')
        .map((post) => ({
          ...post,
          channelId: feed.id,
          id: _.uniqueId(),
        }));
        // eslint-disable-next-line no-param-reassign
      state.posts = posts.concat(...state.posts);
    })
    .catch((error) => {
      console.log(error);
      // eslint-disable-next-line no-param-reassign
      state.processLoading = { status: 'failed', errors: error };
    }));

  Promise.all(promises).finally(() => setTimeout(() => updatePosts(state), UPDATE_TIME));
};

const getError = (errors) => {
  if (errors.code === 'ECONNABORTED') {
    return 'timeout';
  }
  if (errors.isAxiosError) {
    return 'network';
  }
  if (errors.isParserError) {
    return 'invalidRSS';
  }
  return 'unknown';
};

const fetchRSS = (url, state) => {
  // eslint-disable-next-line no-param-reassign
  state.processLoading = { status: 'loading', errors: '' };
  axios.get(addProxy(url), { timeout: TIMEOUT })
    .then((response) => {
      const data = parseRSS(response.data.contents);
      data.feed.id = _.uniqueId();
      data.feed.url = url;
      state.feeds.unshift(data.feed);
      const newPosts = data
        .posts
        .map((post) => ({
          ...post,
          channelId: data.feed.id,
          id: _.uniqueId(),
        }));
      // eslint-disable-next-line no-param-reassign
      state.posts = [...newPosts, ...state.posts];
      // eslint-disable-next-line no-param-reassign
      state.processLoading = { status: 'success', errors: '' };
    })
    .catch((error) => {
      // eslint-disable-next-line no-param-reassign
      state.processLoading = { status: 'failed', errors: getError(error) };
    });
};

export default () => {
  const elements = {
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal-link'),

    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('[aria-label="add"]'),

    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),

    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),

    feedsTemplate: document.querySelector('#template-feeds-wrapper'),
    feedTemplate: document.querySelector('#template-feed-element'),
    postTemplate: document.querySelector('#template-posts-wrapper'),
    postsTemplate: document.querySelector('#template-post-element'),
  };

  const initialState = {
    form: {
      errors: '',
      status: 'filling',
    },
    processLoading: {
      errors: '',
      status: 'filling',
    },
    currentPost: null,
    visitedPostsId: new Set(),
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

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const { feeds } = wathcedState;
      validate(url, feeds)
        .then((error) => {
          if (error) {
            wathcedState.form = { status: 'failed', errors: error.message };
            return;
          }
          wathcedState.form = { status: 'success', errors: '' };
          fetchRSS(url, wathcedState);
        });
    });

    setTimeout(() => updatePosts(wathcedState), UPDATE_TIME);

    elements.posts.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-id')) {
        wathcedState.visitedPostsId.add(e.target.dataset.id);
        wathcedState.currentPost = wathcedState.posts.find(
          (post) => post.id === e.target.dataset.id,
        );
      }
    });
  });
};
