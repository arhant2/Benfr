/* eslint-disable global-require */
module.exports = {
  ...require('./signup-M'),
  ...require('./login'),
  ...require('./logout'),
  ...require('./protect'),
  ...require('./restrictTo'),
  ...require('./forgotPassword-M'),
  ...require('./updateMyPassword'),
  ...require('./changeMyEmail-M'),
};
