import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../components-function/flash-messages';

import popup from '../components-function/popup/index';
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

// Submit form(Move to next stage)
if (form && id) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    popup.confirm(
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

// Cancel order
if (cancelBtn && id) {
  cancelBtn.addEventListener('click', function (e) {
    e.preventDefault();

    const cancelOrder = async (reason) => {
      if (!reason) {
        return;
      }
      btnStates.disableBtns('cancel');

      try {
        const res = await axios({
          method: 'DELETE',
          url: `/api/v1/orders/${id}/cancel`,
          data: {
            reason,
          },
        });

        addFlashMessage(
          'success',
          'Cancelled order successfully! Reloading...'
        );
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (err) {
        handleError(err);
        btnStates.enableBtns();
      }
    };

    popup.prompt(
      'Cancel order',
      'Please enter a reason for order cancellation',
      cancelOrder,
      'Cannot fulfill order',
      4,
      200
    );
  });
}
