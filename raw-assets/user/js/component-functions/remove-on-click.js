Array.from(
  document.getElementsByClassName(
    'js--components-function--remove-onclick__btn'
  )
).forEach((btn) => {
  btn.addEventListener('click', function (e) {
    const element = this.closest('.js--components-function--remove-onclick');

    if (!element) {
      return;
    }

    element.remove();
  });
});
