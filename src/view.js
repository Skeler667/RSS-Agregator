export default (state) => {
  const p = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  if (state.inputState === 'correct') {
    input.classList.remove('is-invalid');
    p.classList.remove('text-danger');
    p.classList.add('text-success');
    p.textContent = 'RSS успешно загружен';

fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${state.inputValue}`)}`)
        .then(response => {
          if (response.ok) return response.json()
          throw new Error('Network response was not ok.')
        })
        .then(data => {
          const parser = new DOMParser();
        const dataHTML = parser.parseFromString(data.contents, "text/html");
        // console.log(d)
        const titleTest = dataHTML.querySelector('title')
        titleTest.classList.add('.card')
        titleTest.classList.add('.w-75')
        console.log(titleTest)
        const mainHTML = document.querySelector('.col-md-10')
        mainHTML.prepend(titleTest)
        });

  }
  if (state.inputState === 'uncorrect') {
    input.classList.add('is-invalid');
    p.classList.remove('text-success');
    p.classList.add('text-danger');
    p.textContent = 'Ссылка должна быть валидным URL';
  }
  if (state.inputState === 'exists') {
    input.classList.add('is-invalid');
    p.classList.remove('text-success');
    p.classList.add('text-danger');
    p.textContent = 'RSS уже существует';
  }
  return 1;
};
