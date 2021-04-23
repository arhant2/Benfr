Array.from(
  document.getElementsByClassName('js--components-function--toggle-on-click')
).forEach((el) => {
  el.addEventListener('click', function (e) {
    const { toggleClass, toggleElementId } = this.dataset;

    if (!toggleClass) {
      return;
    }

    const element = document.getElementById(toggleElementId);

    if (!element) {
      return;
    }

    element.classList.toggle(toggleClass);
  });
});
