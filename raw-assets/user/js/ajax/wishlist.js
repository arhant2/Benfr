import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

Array.from(
  document.getElementsByClassName('js--ajax--wishlist-each__remove-btn')
).forEach((btn) => {
  btn.addEventListener('click', async function (e) {
    const { product } = this.dataset;

    const item = this.closest('.js--ajax--wishlist-each');

    if (!product || !item) {
      throw 'Cannot remove product, please try again later!';
    }

    this.setAttribute('disabled', 'disabled');

    try {
      await axios({
        method: 'DELETE',
        url: `/api/v1/wishlist/remove/${product}`,
      });

      item.remove();
    } catch (err) {
      handleError(err, true);
      this.removeAttribute('disabled');
    }
  });
});
