const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFeildsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  // console.log(value);

  const message = `Repeated field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data.\n ${errors.join('.\n ')}.\n`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('You are not logged in! Login to get access', 401);

const handleJWTExpiredError = () =>
  new AppError('You are not logged in! Login to get access', 401);

const sendErrorDev = (err, req, res) => {
  // ======================
  // REMOVE THIS
  // ======================

  // console.log(err);

  // return res.status(err.statusCode).json({
  //   status: err.status,
  //   error: err,
  //   message: err.message,
  //   stack: err.stack,
  // });

  // ======================
  // ======================

  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE
    // res.status(err.statusCode).render('error', {
    //   title: 'Something went wrong!',
    //   msg: err.message,
    // });
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trsusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log the error
      console.error('ERROR 💥', err);

      // 2) Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    // Operational, trusted error: send message to client
    // eslint-disable-next-line no-lonely-if
    if (err.isOperational) {
      // res.status(err.statusCode).render('error', {
      //   title: 'Something went wrong!',
      //   msg: err.message,
      // });

      res.status(err.statusCode).json({
        status: 'error',
        msg: 'Please try again later',
      });

      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log the error
      console.error('ERROR 💥', err);
      // 2) Send generic message
      // res.status(err.statusCode).render('error', {
      //   title: 'Something went wrong!',
      //   msg: 'Please try again later!',
      // });

      res.status(err.statusCode).json({
        status: 'error',
        msg: 'Please try again later',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err);
  if (typeof err !== 'object') {
    err = {};
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Clear cookie for JWT error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    console.log('JwT Error! Clearing cookie....');
    res.clearCookie('jwt');
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    //necessary to use err while checking
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFeildsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
