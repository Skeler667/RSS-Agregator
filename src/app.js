import * as yup from "yup";
import axios from "axios";
import watch from "./view.js";
import parserRss from "./renderRss.js";
import _ from 'lodash';

const validate = (url, urls) =>
  yup
    .string()
    .required()
    .url("mustBeValid")
    .notOneOf(urls, "linkExists")
    .validate(url);

const buildProxyURL = (url) =>
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
    url
  )}`;

const fetchRSS = (url) => axios.get(buildProxyURL(url));

export default () => {
  const elements = {
    form: document.querySelector(".rss-form"),
    input: document.querySelector("#url-input"),
    button: document.querySelector('[aria-label="add"]'),

    feedback: document.querySelector(".feedback"),
    posts: document.querySelector(".posts"),

    feedsContainer: document.querySelector(".feeds"),
    postsContainer: document.querySelector(".posts"),

    templateFeed: document.querySelector("#template-feeds-wrapper"),
    templateFeedElement: document.querySelector("#template-feed-element"),
    templatePost: document.querySelector("#template-posts-wrapper"),
    templatePostElement: document.querySelector("#template-post-element")
  };

  const state = {
    form: {
      errors: "",
      state: "filling"
    },
    feeds: [],
    posts: []
  };
  const wathcedState = watch(state, elements);
  elements.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get("url");
    const urls = wathcedState.feeds.map((feed) => feed.url);
    validate(url, urls)
      .then((link) => {
        wathcedState.form.state = "sending";
        wathcedState.form.errors = "";
        return fetchRSS(link);
      })
      .then((response) => {
        const data = parserRss(response.data.contents);

        const feed = data.feed;
        const posts = data.posts;
        

        feed.id = _.uniqueId();
        feed.url = url;
        wathcedState.feeds.unshift(feed)

        posts.forEach(post => post.id = _.uniqueId());
  
        

        wathcedState.form.state = "success";
        wathcedState.form.errors = "";
 
        wathcedState.posts = [...posts, ...wathcedState.posts];
        wathcedState.feeds = [...feed, ...wathcedState.feeds];
        
      })
      .catch((e) => {
        wathcedState.form.errors = e.message;
      });
  });
  elements.posts.addEventListener('click', (e) => {
    console.log(e.target.dataset.id)
  })
};
