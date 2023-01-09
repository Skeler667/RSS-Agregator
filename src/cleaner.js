const clear = (elements) => {
    const { input, feedback, button } = elements;
    input.classList.remove("is-invalid");
    feedback.classList.remove("text-danger");
    feedback.classList.remove("text-success");
    feedback.classList.remove("text-warning");
    feedback.textContent = "";
  
    input.disabled = "";
    button.disabled = "";
    button.textContent = "Добавить";
  };

  export default clear;