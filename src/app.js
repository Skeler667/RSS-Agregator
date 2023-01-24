import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import watch from './view';
import renderRss from './renderRss';
import resources from './locales/index';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: false,
  resources,
});

const validate = (url, urls) => yup
  .string()
  .required()
  .url('mustBeValid')
  .notOneOf(urls, 'linkExists')
  .validate(url);

const buildProxyURL = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
  url,
)}`;

const fetchRSS = (url) => axios.get(buildProxyURL(url));

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
  const wathcedState = watch(state, elements, i18nextInstance);
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urls = wathcedState.feeds.map((feed) => feed.url);
    validate(url, urls)
      .then((link) => {
        wathcedState.form.state = 'sending';
        wathcedState.form.errors = '';
        return fetchRSS(link);
      })
      .then((response) => {
        const data = renderRss(response.data.contents);

        const { feed } = data;
        const { posts } = data;

        feed.id = _.uniqueId();
        feed.url = url;
        wathcedState.feeds.unshift(feed);

        posts.forEach((post) => { post.id = _.uniqueId(); });

        wathcedState.form.state = 'success';
        wathcedState.form.errors = '';

        wathcedState.posts = [...posts, ...wathcedState.posts];

        const loadPosts = () => {
          const urlsFeed = wathcedState.feeds.map((feedEl) => feedEl.url);
          const promises = urlsFeed.map((urlEl) => fetchRSS(urlEl)
            .then((dataUrls) => {
              const data = renderRss(dataUrls.data.contents);
              const newPosts = data.posts;
              const links = wathcedState.posts.map((post) => post.link);
              const addedPosts = newPosts.filter((post) => !links.includes(post.link));

              wathcedState.posts = addedPosts.concat(...wathcedState.posts);
            })
            .catch((err) => {
              console.error(err);
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
