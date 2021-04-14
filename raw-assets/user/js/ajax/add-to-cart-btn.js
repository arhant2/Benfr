import 'regenerator-runtime/runtime';
import axios from 'axios';

import popup from '../component-functions/popup/index';

import handleError from '../utils/handleError';

Array.from(document.getElementsByClassName('js--ajax--add-cart-btn')).forEach(
  (btn) => {
    btn.addEventListener('click', async function (e) {
      const { product } = this.dataset;

      if (!product) {
        return popup.alert(
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

        popup.confirm(
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
