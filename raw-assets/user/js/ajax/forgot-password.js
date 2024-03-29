import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

const form = document.getElementById('forgot-password-form');
const btn = document.getElementById('forgot-password-form-btn');

if (form) {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const email = formData.get('email');

    if (btn) {
      btn.setAttribute('disabled', 'disabled');
    }

    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/users/forgotPassword',
        data: {
          email,
        },
      });

      window.location = '/forgotPassword/success';
    } catch (err) {
      handleError(err);
      if (btn) {
        btn.removeAttribute('disabled');
      }
    }
  });
}
