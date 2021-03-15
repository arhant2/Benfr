import confirmDialog from './confirm-dialog';

Array.from(
  document.getElementsByClassName(
    'js--components-function--btn-confirm-redirect'
  )
).forEach((btn) => {
  if (!btn.dataset.redirectTo || !btn.dataset.confirmMessage) {
    return;
  }
  btn.addEventListener('click', function () {
    confirmDialog(
      'Confirm redirect',
      btn.dataset.confirmMessage,
      undefined,
      () => {
        window.location.href = btn.dataset.redirectTo;
      }
    );
  });
});
