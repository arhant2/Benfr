import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

const form = document.getElementById('update-my-password-form');
const btn = document.getElementById('update-my-password-form-btn');

if (form) {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {
      currentPassword: formData.get('currentPassword'),
      password: formData.get('password'),
      passwordConfirm: formData.get('passwordConfirm'),
    };

    if (btn) {
      btn.setAttribute('disabled', 'disabled');
    }

    try {
      if (data.password !== data.passwordConfirm) {
        handleError('Password and confirm password are not same');

        if (btn) {
          btn.removeAttribute('disabled');
        }

        return;
      }

      const res = await axios({
        method: 'PATCH',
        url: '/api/v1/users/updateMyPassword',
        data,
      });

      [
        document.getElementById('currentPassword'),
        document.getElementById('password'),
        document.getElementById('passwordConfirm'),
      ].forEach((el) => {
        if (el) {
          el.value = '';
        }
      });

      clearFlashMessages();
      addFlashMessage('success', 'Password changed sucessfully!');

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
