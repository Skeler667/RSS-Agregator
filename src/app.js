// import onChange from 'on-change';
// import { object, string, number, date, InferType } from 'yup';
import * as yup from "yup";

const validate = (url, urls) =>
  yup
    .string()
    .required()
    .url("mustBeValid")
    .notOneOf(urls, "linkExists")
    .validate(url);

const messages = {
  success: "RSS успешно загружен",
  loading: "Идёт загрузка...",
  mustBeValid: "Ссылка не содержит валидный URL",
  linkExists: "RSS уже загружен"
};

export default () => {
  const inputForm = document.querySelector(".rss-form");
  const feedback = document.querySelector(".feedback");
  const input = document.querySelector("#url-input");
  const button = document.querySelector("button");
  const state = {
    form: {
      errors: "",
      state: "filling"
    },
    urls: []
  };
  //  ты зво
  //
  //
  //
  //
  //

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get("url");
    validate(url, state.urls)
      .then((link) => {
        feedback.textContent = messages.loading;
        feedback.classList.remove("text-danger");
        feedback.classList.add("text-warning");
        input.disabled = true;
        button.disabled = true;
        // AXIOS.get(link)....
        return link;
      })
      .then((link) => {
        state.urls.push(link);
        feedback.textContent = messages.success;
        feedback.classList.remove("text-warning");
        feedback.classList.add("text-success");
        input.disabled = "";
        button.disabled = "";
      })
      .catch((e) => {
        feedback.textContent = messages[e.message];
        feedback.classList.remove("text-success");
        feedback.classList.remove("text-warning");
        feedback.classList.add("text-danger");
        input.classList.add("is-invalid");
      });
  });
};
