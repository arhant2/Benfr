import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

import alertDialog from '../component-functions/alert-dialog';

export default function (err, alert = false) {
  clearFlashMessages();
  let message = 'Something went wrong!',
    type = 'error';

  if (typeof err === 'string') {
    message = err;
  } else if (err.response && err.response.data) {
    if (err.response.data.message) {
      message = err.response.data.message;
    }
    // if (err.response.data.status) {
    //   type = err.response.data.status;
    // }
  }

  if (alert) {
    alertDialog('Error', message);
    return;
  }

  addFlashMessage(type, message);
}
