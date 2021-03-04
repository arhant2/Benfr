import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

const form = document.getElementById('signup-form');
const btn = document.getElementById('signup-form-btn');

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
        url: '/api/v1/users/signup',
        data: {
          email,
        },
      });

      window.location = '/signup/success';
    } catch (err) {
      handleError(err);
      if (btn) {
        btn.removeAttribute('disabled');
      }
    }
  });
}
