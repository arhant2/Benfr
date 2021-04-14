import popup from './popup/index';

Array.from(
  document.getElementsByClassName(
    'js--components-function--btn-confirm-redirect'
  )
).forEach((btn) => {
  // console.log(btn.dataset);

  if (!btn.dataset.redirectTo) {
    return;
  }
  btn.addEventListener('click', function () {
    if (!this.dataset.confirmMessage) {
      window.location.href = this.dataset.redirectTo;
      return;
    }

    popup.confirm(
      'Confirm redirect',
      this.dataset.confirmMessage,
      undefined,
      () => {
        window.location.href = this.dataset.redirectTo;
      }
    );
  });
});
