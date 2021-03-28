import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

import alertDialog from '../component-functions/alert-dialog';

const form = document.getElementById('review-form');
const btn = document.getElementById('review-form-btn');

if (form) {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    const data = {
      star: formData.get('star'),
      title: formData.get('title'),
      description: formData.get('description') || '',
    };

    const productId = formData.get('productId');
    const reviewId = formData.get('reviewId');

    if (!productId) {
      handleError('Cannot post/update comment, please try again later!');
      return;
    }

    if (btn) {
      btn.setAttribute('disabled', 'disabled');
    }

    try {
      const res = await axios({
        method: reviewId ? 'PATCH' : 'POST',
        url: `/api/v1/products/${productId}/reviews/${reviewId || ''}`,
        data,
      });

      alertDialog(
        'Success',
        `${
          reviewId ? 'Updated your' : 'Posted your'
        } comment successfully! Relod the page to see changes...`,
        () => {
          window.location.reload();
        }
      );
    } catch (err) {
      handleError(err, true);
      if (btn) {
        btn.removeAttribute('disabled');
      }
    }
  });
}
