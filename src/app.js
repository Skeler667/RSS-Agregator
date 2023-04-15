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
  /* eslint-disable no-param-reassign */
  if (state.processLoading.errors !== '') {
    return;
  }
  const urls = state.feeds.map((feed) => feed.url);
  const promises = urls.map((url) => axios.get(addProxy(url), { timeout: TIMEOUT })
    .then((response) => {
      const data = parseRSS(response.data.contents);
      const oldPosts = state.posts;
      const diff = _.differenceBy(data.posts, oldPosts, 'link');
      const diffPosts = diff
        .map((post) => ({
          ...post,
          channelId: data.feed.id,
          id: _.uniqueId(),
        }));
      state.posts = diffPosts.concat(...state.posts);
    })
    .catch((err) => {
      state.processLoading = { status: 'failed', errors: err };
    }));

  Promise.all(promises).finally(() => setTimeout(() => updatePosts(state), UPDATE_TIME));
  /* eslint-enable no-param-reassign */
};

const fetchErrors = (errors, state) => {
  const stateProcess = state;
  if (errors.isParserError) {
    stateProcess.processLoading = { status: 'failed', errors: 'invalidRSS' };
    return;
  }
  if (errors.isAxiosError) {
    stateProcess.processLoading = { status: 'failed', errors: 'network' };
    return;
  }
  stateProcess.processLoading = { status: 'failed', errors: 'unknown' };
};

const fetchRSS = (url, wathcedState) => {
  const state = wathcedState;
  axios.get(addProxy(url), { timeout: 5000 })
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
      state.form = { status: 'success', errors: '' };
      state.processLoading = { status: 'success', errors: '' };

      state.posts = [...newPosts, ...state.posts];
    })
    .catch((errors) => {
      fetchErrors(errors, wathcedState);
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
          wathcedState.processLoading = { status: 'loading', errors: '' };
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
