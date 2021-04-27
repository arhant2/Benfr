import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

import popup from '../component-functions/popup/index';

const form = document.getElementById('cart-form');
const saveBtn = document.getElementById('cart-save-btn');
const deleteBtn = document.getElementById('cart-delete-btn');
const discardBtn = document.getElementById('cart-discard-btn');

const disableBtns = (loadingBtn) => {
  const helper = (btn, name) => {
    if (btn) {
      btn.setAttribute('disabled', 'disabled');
      if (name === loadingBtn && btn.dataset.loadClass) {
        btn.classList.add(btn.dataset.loadClass);
      }
    }
  };
  helper(saveBtn, 'save');
  helper(deleteBtn, 'delete');
  helper(discardBtn, 'discard');
};

const enableBtns = () => {
  const helper = (btn, name) => {
    if (btn) {
      btn.removeAttribute('disabled');
      if (btn.dataset.loadClass) {
        btn.classList.remove(btn.dataset.loadClass);
      }
    }
  };
  helper(saveBtn, 'save');
  helper(deleteBtn, 'delete');
  helper(discardBtn, 'discard');
};

//////////////////////// Form
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearFlashMessages();

    const currentForm = this;

    popup.confirm(
      'Confirm changes',
      'Are you sure, you want to save the changes?',
      undefined,
      async () => {
        const data = new FormData(currentForm);

        disableBtns('save');

        try {
          const res = await axios({
            method: 'PUT',
            url: '/api/v1/cart',
            data,
          });

          addFlashMessage('success', `Successfully updated cart. Reloading...`);

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          handleError(err);
          enableBtns();
        }
      }
    );
  });
}

///////////////// Clear Cart
if (deleteBtn) {
  deleteBtn.addEventListener('click', function (e) {
    clearFlashMessages();

    popup.confirm(
      'Clear Cart',
      `Are you sure, you want to clear the cart? Please note that this cannot be undone!`,
      undefined,
      async () => {
        disableBtns('delete');

        try {
          const res = await axios({
            method: 'DELETE',
            url: `/api/v1/cart`,
          });

          addFlashMessage('success', `Clear cart succesful! Reloading...`);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          handleError(err);
          enableBtns();
        }
      }
    );
  });
}

///////////////// Show no products text
const showNoProductsText = () => {
  if (document.getElementsByClassName('js--ajax--cart-each')[0]) {
    return;
  }

  const element = document.getElementsByClassName(
    'js--ajax--cart-each--none'
  )[0];

  if (!element) {
    return;
  }

  const { noneClass } = element.dataset;

  if (!noneClass) {
    return;
  }

  element.classList.remove(noneClass);
};

///////////////// Remove btn
Array.from(
  document.getElementsByClassName('js--ajax--cart-each__remove-btn')
).forEach((btn) => {
  btn.addEventListener('click', function () {
    const item = this.closest('.js--ajax--cart-each');

    if (!item) {
      handleError('Cannot remove product');
    }

    item.remove();
    showNoProductsText();
  });
});
