import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../components-function/flash-messages';

import popup from '../components-function/popup/index';

////////////////////////////////
// Making user inactive
////////////////////////////////

document
  .getElementsByClassName('js--ajax--review-each__make-inactive')[0]
  ?.addEventListener('click', function (e) {
    const { userId } = this.dataset;

    if (!userId) {
      return;
    }

    const makeUserInactive = async (reason) => {
      if (!reason) {
        return;
      }

      try {
        this.setAttribute('disabled', 'disabled');

        await axios({
          method: 'PATCH',
          url: `/api/v1/users/${userId}/makeInactive`,
          data: {
            inActiveReason: reason,
          },
        });

        clearFlashMessages();
        addFlashMessage(
          'success',
          'Made user inactive succesfully! Redirecting...'
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        handleError(error, true);
        this.removeAttribute('disabled');
      }
    };

    popup.prompt(
      'Make user inactive',
      'Enter reason for making user inactive',
      makeUserInactive,
      undefined,
      5,
      120
    );
  });

////////////////////////////////
// Making user active
////////////////////////////////

document
  .getElementsByClassName('js--ajax--review-each__make-active')[0]
  ?.addEventListener('click', function (e) {
    const { userId } = this.dataset;

    if (!userId) {
      return;
    }

    const makeUserActive = async () => {
      try {
        this.setAttribute('disabled', 'disabled');

        await axios({
          method: 'PATCH',
          url: `/api/v1/users/${userId}/makeActive`,
        });

        clearFlashMessages();
        addFlashMessage(
          'success',
          'Made user active succesfully! Redirecting...'
        );

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        handleError(error, true);
        this.removeAttribute('disabled');
      }
    };

    popup.confirm(
      'Make user active',
      'Re-grant user access to Benfr?',
      undefined,
      makeUserActive
    );
  });
