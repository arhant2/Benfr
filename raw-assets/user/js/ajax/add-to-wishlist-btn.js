import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  clearFlashMessages,
  addFlashMessage,
} from '../component-functions/flash-messages';

import popup from '../component-functions/popup';

Array.from(
  document.getElementsByClassName('js--ajax--add-wishlist-btn')
).forEach((btn) => {
  btn.addEventListener('click', async function (e) {
    const { product } = this.dataset;

    if (!product) {
      throw 'Cannot add product, please try again later!';
    }

    this.setAttribute('disabled', 'disabled');

    try {
      await axios({
        method: 'POST',
        url: `/api/v1/wishlist/add/${product}`,
      });

      clearFlashMessages();
      addFlashMessage('success', 'Added product to wishlist successfully!');

      this.removeAttribute('disabled');
    } catch (err) {
      handleError(err);
      this.removeAttribute('disabled');
    }
  });
});
