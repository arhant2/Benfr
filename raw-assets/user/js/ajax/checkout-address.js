import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

import popup from '../component-functions/popup/index';

/////////////////////////////////////////////////////////////////////
// Select address form
/////////////////////////////////////////////////////////////////////
(() => {
  const form = document.getElementById('checkout-select-address-form');

  if (!form) {
    return;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const address = new FormData(this).get('address');

    if (!address) {
      handleError('Please select an address or checkout with a new address');
      return;
    }

    window.location.replace(`/checkout/${address}`);
  });
})();

/////////////////////////////////////////////////////////////////////
// New address form
/////////////////////////////////////////////////////////////////////
(() => {
  const form = document.getElementById('checkout-new-address-form');
  const btn = document.getElementById('checkout-new-address-form-btn');

  if (!form) {
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = new FormData(this);

    popup.confirm(
      'Confirm',
      'Save address and continue to checkcout?',
      undefined,
      async () => {
        const data = new FormData(this);

        if (btn) {
          btn.setAttribute('disabled', 'disabled');
        }

        try {
          const res = await axios({
            method: 'POST',
            url: '/api/v1/addresses',
            data,
          });

          clearFlashMessages();

          addFlashMessage(
            'success',
            'Saved address sucessfully! Moving you to checkout page...'
          );

          setTimeout(() => {
            window.location.replace(`/checkout/${res.data.data.address.id}`);
          }, 2000);
        } catch (err) {
          handleError(err);
          if (btn) {
            btn.removeAttribute('disabled');
          }
        }
      }
    );
  });
})();
