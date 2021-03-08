Array.from(
  document.getElementsByClassName('js--components-function--dropdown__btn')
).forEach((btn) => {
  btn.addEventListener('click', function () {
    this.nextElementSibling.classList.toggle('menu-dropdown__list--show');
  });
});

const lists = Array.from(
  document.getElementsByClassName('menu-dropdown__list')
);

window.addEventListener('click', function (event) {
  if (
    !event.target.matches('.js--components-function--dropdown') &&
    !event.target.matches('.js--components-function--dropdown *')
  ) {
    lists.forEach((list) => {
      list.classList.remove('menu-dropdown__list--show');
    });
  }
});
