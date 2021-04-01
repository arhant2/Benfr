import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

import alertDialog from '../component-functions/alert-dialog';
import confirmDialog from '../component-functions/confirm-dialog';

// Update/create address
(() => {
  const form = document.getElementById('address-form');
  const btn = document.getElementById('address-form-btn');

  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      confirmDialog(
        'Confirm changes',
        'Are you sure you want to save the changes?',
        undefined,
        async () => {
          const data = new FormData(this);
          const addressId = data.get('addressId');

          const isNew = !addressId;

          if (addressId) {
            data.delete(addressId);
          }

          if (btn) {
            btn.setAttribute('disabled', 'disabled');
          }

          try {
            const res = await axios({
              method: isNew ? 'POST' : 'PATCH',
              url: `/api/v1/addresses/${isNew ? '' : addressId}`,
              data,
            });

            clearFlashMessages();

            if (isNew) {
              addFlashMessage(
                'success',
                `Successfully added new adddress. Reloading...`
              );

              setTimeout(() => {
                window.location.replace(
                  `/addresses/${res.data.data.address.id}`
                );
              }, 2000);

              return;
            }

            addFlashMessage('success', 'Updated information sucessfully!');

            if (btn) {
              btn.removeAttribute('disabled');
            }
          } catch (err) {
            handleError(err);
            if (btn) {
              btn.removeAttribute('disabled');
            }
          }
        }
      );
    });
  }
})();

// Delete address
Array.from(
  document.getElementsByClassName('js--ajax--delete-address__btn')
).forEach((btn) => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();

    const { addressId } = this.dataset;
    const element = this.closest('.js--ajax--delete-address');

    if (!addressId || !element) {
      clearFlashMessages();
      handleError('Cannot delete address, please try again later', true);
      return;
    }

    confirmDialog(
      'Confirm Delete',
      'Are you sure, you want to delete this address?',
      undefined,
      async () => {
        this.setAttribute('disabled', 'disabled');

        try {
          await axios({
            method: 'DELETE',
            url: `/api/v1/addresses/${addressId}`,
          });

          element.remove();

          addFlashMessage('success', 'Deleted address sucessfully!');
        } catch (err) {
          this.removeAttribute('disabled');
          clearFlashMessages();
          handleError(err, true);
        }
      }
    );
  });
});
