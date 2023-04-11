import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import watch from './view.js';
import parseRSS from './parseRSS.js';
import resources from './locales/index.js';

const UPDATE_TIME = 5000;

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const updatePosts = (wathcedState) => {
  const state = wathcedState;
  if (state.form.errors !== '') {
    return;
  }
  const urls = state.feeds.map((feed) => feed.url);
  const promises = urls.map((url) => axios.get(addProxy(url), { timeout: UPDATE_TIME })
    .then((response) => {
      const data = parseRSS(response.data.contents);
      const oldPosts = state.posts;
      const diff = _.differenceBy(data.posts, oldPosts, 'link');
      diff.map((post) => post.id = _.uniqueId());
      state.posts = diff.concat(...state.posts);
      state.processLoading = { status: 'success', errors: '' };
    })

    .catch((err) => {
      console.log(`${err}`);
      state.processLoading = { status: 'failed', errors: err };
    }));

  Promise.all(promises).finally(() => setTimeout(() => updatePosts(wathcedState), UPDATE_TIME));
};

const fetchRSS = (url, wathcedState) => {
  const state = wathcedState;
  state.processLoading = { status: 'loading', errors: '' };
  axios.get(addProxy(url), { timeout: 1000 * 5 })
    .then((response) => {
      const data = parseRSS(response.data.contents);
      data.feed.id = _.uniqueId();
      data.feed.url = url;
      state.feeds.unshift(data.feed);
      const posts = data.posts.map((post) => ({ ...post, channelId: data.feed.id, id: _.uniqueId() }));
      state.form = { status: 'success', errors: '' };
      state.processLoading = { status: 'success', errors: '' };

      state.posts = [...posts, ...state.posts];
    })
    .catch((errors) => {
      console.log(`${errors} error in catch after updatePosts`);
      state.processLoading = { status: 'failed', errors: errors.message };
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
          } else {
            fetchRSS(url, wathcedState);
          }
        });
      wathcedState.feeds = [...wathcedState.feeds];
    });

    elements.postsContainer.addEventListener('click', (e) => {
      wathcedState.currentPost = e.target.getAttribute('data-id');
      wathcedState.visitedPostsId.add(e.target.getAttribute('data-id'));
    });

    setTimeout(() => updatePosts(wathcedState), UPDATE_TIME);

    elements.posts.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-id')) {
        wathcedState.currentPost = e.target.dataset.id;
        wathcedState.visitedPostsId.add(e.target.dataset.id);
      }

      if (e.target.tagName === 'BUTTON') {
        const { id } = e.target.dataset;
        wathcedState.currentPost = wathcedState.posts.find(
          (post) => post.id === id,
        );
      }
    });
  });
};
