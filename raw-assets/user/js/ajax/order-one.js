import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

import popup from '../component-functions/popup/index';

const cancelBtn = document.getElementById('order-one-cancel-btn');
const id = document.getElementById('id')?.value;

if (cancelBtn && id) {
  cancelBtn.addEventListener('click', function (e) {
    e.preventDefault();

    const cancelOrder = async (reason) => {
      if (!reason) {
        return;
      }
      cancelBtn.setAttribute('disabled', 'disabled');

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
        cancelBtn.removeAttribute('disabled');
      }
    };

    popup.prompt(
      'Cancel order',
      'Please enter a reason for order cancellation',
      cancelOrder,
      undefined,
      4,
      200
    );
  });
}
