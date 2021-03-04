import {
  addFlashMessage,
  clearFlashMessages,
} from '../component-functions/flash-messages';

export default function (err) {
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

  addFlashMessage(type, message);
}
