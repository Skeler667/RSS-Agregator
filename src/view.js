export default (state) => {
  const p = document.querySelector('.feedback');
  const input = document.querySelector('#url-input');
  if (state.inputState === 'correct') {
    input.classList.remove('is-invalid');
    p.classList.remove('text-danger');
    p.classList.add('text-success');
    p.textContent = 'RSS успешно загружен';
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
