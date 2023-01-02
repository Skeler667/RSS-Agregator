import { object, string, setLocale,} from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import cb from './view';
import axios from 'axios';

console.log(axios.isCancel('something'));

const app = () => {

  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          validUrl: "RSS успешно загружен",
          invalidUrl: "Ссылка должна быть валидным URL",
          repeatUrl: "RSS уже существует",
        }
      }
    }
  });

  const state = {
    repeatUrls: [],
    inputValue: '',
    inputState: 'filling',
  };
  const watchedState = onChange(state, () => cb(state, i18next.t));
  const form = document.querySelector('.rss-form');

  setLocale({
    mixed: {
      default: 'Não é válido',
    },
    number: {
      min: 'Deve ser maior que ${min}',
    },
  });
  let schema = object({
    website: string().url(),
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const schema = object({
      website: string().url(),
    });
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.inputValue = url;
    schema.isValid({ website: state.inputValue }).then((bl) => {
      if (bl === true && state.repeatUrls.includes(state.inputValue)) {
        watchedState.inputState = 'exists';
      }
      if (bl === true && !state.repeatUrls.includes(state.inputValue)) {
        watchedState.inputState = 'correct';
        state.repeatUrls.push(watchedState.inputValue);
        const RSS_URL = `${state.inputValue}`

        console.log(`${RSS_URL}`)

        axios.get(`${RSS_URL}`)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });

        
    


      }
      if (bl === false) {
        watchedState.inputState = 'uncorrect';
      }
    });
  });
};
export default app;
