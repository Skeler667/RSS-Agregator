import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import watch from './view.js';
import parseRSS from './parseRSS.js';
import resources from './locales/index.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const fetchRSS = (url) => axios.get(addProxy(url), { delay: 10000 });

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
  
  const state = {
    form: {
      errors: '',
      state: 'filling',
    },
    lang: 'ru',
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
  });

  const wathcedState = watch(state, elements, i18nextInstance);

  const validate = (url, feeds) => {
    const urls = feeds.map((feed) => feed.url);

    return yup
      .string()
      .url('mustBeValid')
      .notOneOf(urls, 'linkExists')
      .required()
      .validate(url);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const { feeds } = wathcedState;
    validate(url, feeds)
      .then((link) => {
        wathcedState.form = { state: 'sending', errors: ''}
        return link;
      })
      .then((validatedLink) => fetchRSS(validatedLink))
      .then((response) => {
        const data = parseRSS(response.data.contents);

        data.feed.id = _.uniqueId();
        data.feed.url = url;

        wathcedState.feeds.unshift(data.feed);

        const posts = data.posts.map((item) => ({ ...item, id: _.uniqueId() }));

        wathcedState.form.state = 'success';
        wathcedState.form.errors = '';

        wathcedState.posts = [...posts, ...wathcedState.posts];

        const loadPosts = () => {
          const urlsFeed = wathcedState.feeds.map((feedEl) => feedEl.url);
          const promises = urlsFeed.map((urlEl) => fetchRSS(urlEl)
            .then((dataUrls) => {
              const dataParse = parseRSS(dataUrls.data.contents);
              const newPosts = dataParse.posts;
              const links = wathcedState.posts.map((post) => post.link);
              const addedPosts = newPosts.filter((post) => !links.includes(post.link));

              wathcedState.posts = addedPosts.concat(...wathcedState.posts);
            })
            .catch((err) => {
              wathcedState.form.state = 'failed';
              console.log(err.message);
            }));

          Promise.all(promises).finally(() => {
            setTimeout(() => loadPosts(), 1000);
          });
        };

        wathcedState.feeds = [...wathcedState.feeds];
        loadPosts();
      })
      .catch((errors) => {
        console.log(`${errors} error in catch after loadPosts`);
        wathcedState.form.errors = errors.message;
      });
  });
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
};
