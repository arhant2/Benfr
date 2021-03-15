const container = document.getElementsByClassName(
  'js--components-function--confirm-dialog'
)[0];

const heading = document.getElementsByClassName(
  'js--components-function--confirm-dialog__heading'
)[0];

const body = document.getElementsByClassName(
  'js--components-function--confirm-dialog__body'
)[0];

const closeBtn1 = document.getElementsByClassName(
  'js--components-function--confirm-dialog__close-btn-1'
)[0];

const closeBtn2 = document.getElementsByClassName(
  'js--components-function--confirm-dialog__close-btn-2'
)[0];

const confirmBtn = document.getElementsByClassName(
  'js--components-function--confirm-dialog__confirm-btn'
)[0];

let noneClass;

const confirmFunction = (title, message, noFn, yesFn) => {
  // Call the default one if the custom one cannot be called
  if (
    !container ||
    !heading ||
    !body ||
    !(closeBtn1 || closeBtn2) ||
    !confirmBtn ||
    !container.dataset.noneClass
  ) {
    if (window.confirm(message)) {
      yesFn();
    } else {
      if (noFn) {
        noFn();
      }
    }
    return;
  }

  let noFnToCall, yesFnToCall;

  // Remove listeners and hide the dialog when work is done
  const removeEventListener = () => {
    container.classList.add(container.dataset.noneClass);
    confirmBtn.removeEventListener('click', yesFnToCall);
    if (closeBtn1) {
      closeBtn1.removeEventListener('click', noFnToCall);
    }
    if (closeBtn2) {
      closeBtn2.removeEventListener('click', noFnToCall);
    }
  };

  yesFnToCall = () => {
    removeEventListener();
    yesFn();
  };

  noFnToCall = () => {
    removeEventListener();
    if (noFn) {
      noFn();
    }
  };

  confirmBtn.addEventListener('click', yesFnToCall);
  if (closeBtn1) {
    closeBtn1.addEventListener('click', noFnToCall);
  }
  if (closeBtn2) {
    closeBtn2.addEventListener('click', noFnToCall);
  }

  // Add message
  heading.textContent = title;
  body.textContent = message;
  container.classList.remove(container.dataset.noneClass);
};

export default confirmFunction;
