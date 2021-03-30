import 'regenerator-runtime/runtime';
import axios from 'axios';

import alertDialog from '../component-functions/alert-dialog';
import confirmDialog from '../component-functions/confirm-dialog';

import handleError from '../utils/handleError';

Array.from(document.getElementsByClassName('js--ajax--add-cart-btn')).forEach(
  (btn) => {
    btn.addEventListener('click', async function (e) {
      const { product } = this.dataset;

      if (!product) {
        return alertDialog(
          'Error',
          'Cannot add product, please try again later!'
        );
      }

      this.setAttribute('disabled', 'disabled');

      try {
        await axios({
          method: 'PATCH',
          url: '/api/v1/cart/add',
          data: {
            product,
          },
        });

        this.removeAttribute('disabled');

        confirmDialog(
          'Redirect to cart',
          'Product added to cart successfully. Go to cart page?',
          undefined,
          () => {
            window.location.href = '/cart';
          }
        );
      } catch (err) {
        handleError(err, true);
        this.removeAttribute('disabled');
      }
    });
  }
);
