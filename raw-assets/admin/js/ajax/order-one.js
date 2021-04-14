import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../components-function/flash-messages';

import confirmDialog from '../components-function/confirm-dialog';
import btnStatesClass from '../utils/btnsStatesClass';

const form = document.getElementById('order-one-form');

const nextBtn = document.getElementById('order-one-next-btn');
const invoiceBtn = document.getElementById('order-one-invoice-btn');
const cancelBtn = document.getElementById('order-one-cancel-btn');
const resetBtn = document.getElementById('order-one-reset-btn');

const id = document.getElementById('id')?.value;

const btnStates = new btnStatesClass([
  {
    name: 'next',
    btn: nextBtn,
  },
  {
    name: 'invoice',
    btn: invoiceBtn,
  },
  {
    name: 'cancel',
    btn: cancelBtn,
  },
  {
    name: 'reset',
    btn: resetBtn,
  },
]);

// Submit form
if (form && id) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    confirmDialog(
      'Confirm changes',
      'Confirm changes and move to next stage?',
      undefined,
      async () => {
        const data = new FormData(this);

        btnStates.disableBtns('next');

        try {
          await axios({
            method: 'PATCH',
            url: `/api/v1/orders/${id}/next`,
            data,
          });

          clearFlashMessages();

          addFlashMessage(
            'success',
            `Successfully moved the order to next stage. Reloading...`
          );

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          handleError(err);
          btnStates.enableBtns();
        }
      }
    );
  });
}
