import 'regenerator-runtime/runtime';
import axios from 'axios';

import alertDialog from '../component-functions/alert-dialog';
import handleError from '../utils/handleError';
import { clearFlashMessages } from '../component-functions/flash-messages';

// Show order confirmation
const showOrderConfirmation = (url) => {
  const orderConfirmation = document.getElementById('orderConfirmation');
  const orderConfirmationBtn = document.getElementById('orderConfirmationBtn');
  const noneClass = orderConfirmation?.dataset?.noneClass;

  const fnToCall = () => {
    window.location.replace(url);
  };

  // If orderConfirmation section is not there show alert instead
  if (!noneClass || !orderConfirmationBtn) {
    alertDialog(
      'Sucessful',
      'Your order has been placed. You will be receiving a confirmation email with order details',
      fnToCall
    );
    return;
  }

  orderConfirmation.classList.remove(noneClass);
  orderConfirmationBtn.addEventListener('click', function (e) {
    e.preventDefault();
    fnToCall();
  });
};

const form = document.getElementById('checkout-form');
const btn = document.getElementById('checkout-form-btn');

if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = new FormData(this);

    if (btn) {
      btn.setAttribute('disabled', 'disabled');
    }

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/orders/checkout',
        data,
      });

      clearFlashMessages();

      showOrderConfirmation(`/orders/${res.data.data.order.id}`);
    } catch (err) {
      handleError(err);
      if (btn) {
        btn.removeAttribute('disabled');
      }
    }
  });
}
