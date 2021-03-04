import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

const form = document.getElementById('update-me-form');
const btn = document.getElementById('update-me-form-btn');

if (form) {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    const data = {
      name: formData.get('name'),
      mobile: formData.get('mobile'),
    };

    if (btn) {
      btn.setAttribute('disabled', 'disabled');
    }

    try {
      const res = await axios({
        method: 'PATCH',
        url: `/api/v1/users/updateMe`,
        data,
      });

      clearFlashMessages();
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
  });
}
