Array.from(
  document.getElementsByClassName('js--components-function--dropdown__btn')
).forEach((btn) => {
  btn.addEventListener('click', function () {
    const dropdown = this.closest('.js--components-function--dropdown');

    if (!dropdown) {
      return;
    }

    let list = dropdown.getElementsByClassName(
      'js--components-function--dropdown__list'
    )[0];

    if (!list) {
      return;
    }

    // console.log(this.dataset.showClass);

    if (list.dataset.showClass) {
      list.classList.toggle(list.dataset.showClass);
    }
  });
});

const lists = Array.from(
  document.getElementsByClassName('js--components-function--dropdown__list')
);

window.addEventListener('click', function (event) {
  if (
    !event.target.matches('.js--components-function--dropdown') &&
    !event.target.matches('.js--components-function--dropdown *')
  ) {
    lists.forEach((list) => {
      // 'menu-dropdown__list--show'
      if (list.dataset.showClass) {
        list.classList.remove(list.dataset.showClass);
      }
    });
  }
});
