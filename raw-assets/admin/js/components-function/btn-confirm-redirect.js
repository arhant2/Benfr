import confirmDialog from './confirm-dialog';

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

    confirmDialog(
      'Confirm redirect',
      this.dataset.confirmMessage,
      undefined,
      () => {
        window.location.href = this.dataset.redirectTo;
      }
    );
  });
});
