import { object, string } from 'yup';

import onChange from 'on-change';
import cb from './view';

// export default () => {
//   const element = document.getElementById('point');
//   const obj = new Example(element);
//   obj.init();
// };

const app = () => {
  const state = {
    repeatUrls: [],
    inputValue: '',
    inputState: 'filling',
  };

  const watchedState = onChange(state, () => cb(state));
  const form = document.querySelector('.rss-form');

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
      }
      if (bl === false) {
        watchedState.inputState = 'uncorrect';
      }
    });
  });
};
export default app;
