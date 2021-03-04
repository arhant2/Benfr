import 'regenerator-runtime/runtime';
import axios from 'axios';

import handleError from '../utils/handleError';

import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

const form = document.getElementById('change-my-email-form');
const btn = document.getElementById('change-my-email-form-btn');

const resendOtpOldBtn = document.getElementById('resend-otp-old-btn');
const resendOtpNewBtn = document.getElementById('resend-otp-new-btn');

const formVerify = document.getElementById('change-my-email-verify-form');
const btnVerify = document.getElementById('change-my-email-verify-form-btn');

const verifySection = document.getElementById('change-my-email-verify-section');

const disableVerifyFormBtns = () => {
  if (btnVerify) {
    btnVerify.setAttribute('disabled', 'disabled');
  }
  if (resendOtpOldBtn) {
    resendOtpOldBtn.setAttribute('disabled', 'disabled');
  }
  if (resendOtpNewBtn) {
    resendOtpNewBtn.setAttribute('disabled', 'disabled');
  }
};

const enableVerifyFormBtns = () => {
  if (btnVerify) {
    btnVerify.removeAttribute('disabled');
  }
  if (resendOtpOldBtn) {
    resendOtpOldBtn.removeAttribute('disabled');
  }
  if (resendOtpNewBtn) {
    resendOtpNewBtn.removeAttribute('disabled');
  }
};

const resendOtp = (type) => {
  const currentBtn = type == 'old' ? resendOtpOldBtn : resendOtpNewBtn;
  if (!currentBtn) {
    return;
  }

  currentBtn.addEventListener('click', async function (event) {
    disableVerifyFormBtns();

    try {
      const res = await axios({
        method: 'PATCH',
        url: `/api/v1/users/changeMyEmail/resendOtp/${type}`,
      });

      clearFlashMessages();
      addFlashMessage('success', `Resent otp to your ${type} email`);
      enableVerifyFormBtns();
    } catch (err) {
      handleError(err);
      enableVerifyFormBtns();
    }
  });
};

if (
  form &&
  formVerify &&
  verifySection &&
  verifySection.dataset.displayNoneClass
) {
  // Form with email only
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {
      email: formData.get('email'),
    };
    if (btn) {
      btn.setAttribute('disabled', 'disabled');
    }
    try {
      const res = await axios({
        method: 'PATCH',
        url: '/api/v1/users/changeMyEmail',
        data,
      });
      clearFlashMessages();
      addFlashMessage('success', 'Otps send to your emails for verification');
      if (btn.dataset.loadClass) {
        btn.classList.remove(btn.dataset.loadClass);
      }
      verifySection.classList.remove(verifySection.dataset.displayNoneClass);
    } catch (err) {
      handleError(err);
      if (btn) {
        btn.removeAttribute('disabled');
      }
    }
  });

  // Verify email form
  resendOtp('old');
  resendOtp('new');

  formVerify.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {
      newEmailOtp: formData.get('newEmailOtp'),
      oldEmailOtp: formData.get('oldEmailOtp'),
    };
    disableVerifyFormBtns();
    try {
      const res = await axios({
        method: 'PATCH',
        url: '/api/v1/users/changeMyEmail/verify',
        data,
      });
      clearFlashMessages();
      addFlashMessage('success', 'Email changed successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      handleError(err);
      enableVerifyFormBtns();
    }
  });
}
