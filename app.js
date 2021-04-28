const path = require('path');

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const timeSince = require('./utils/timeSince');
const AppError = require('./utils/AppError');
const dateFormator = require('./utils/dateFormator');
const errorContoller = require('./controllers/errorController');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const brandRouter = require('./routes/brandRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const addressRouter = require('./routes/addressRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const wishlistRouter = require('./routes/wishlistRoutes');
const statsRouter = require('./routes/statsRoutes');
const userViewRouter = require('./routes/userViewRoutes');
const adminViewRouter = require('./routes/adminViewRoutes');

// START A SERVER
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression());

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", 'kit.fontawesome.com', 'ka-f.fontawesome.com'],
        'connect-src': ["'self'", 'https://ka-f.fontawesome.com'],
        'img-src': ["'self'", 'data:', 'res.cloudinary.com'],
      },
    },
  })
);
app.use(
  rateLimit({
    max: 100,
    windowMs: 1000,
    message: 'Too many request, please try again later',
  })
);
app.use(
  hpp({
    whitelist: ['status.name'], // for getting active orders in admin
  })
);
app.use(
  mongoSanitize({
    replaceWith: '__SANITIZED_FOR_QUERY__', // for using ApiFeatures filtering
  })
);
app.use(xss());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Middleware to add an empty object so that customs can be added later
app.use((req, res, next) => {
  req.customs = {};
  next();
});

app.use((req, res, next) => {
  res.locals.helpers = {
    dateFormator,
    timeSince,
    // qs,
  };
  next();
});

// Middleware to set various urls
// req.customs && res.locals -> encodedUrl and path
app.use((req, res, next) => {
  res.locals.encodedUrl = encodeURIComponent(req.originalUrl);
  req.customs.encodedUrl = res.locals.encodedUrl;
  res.locals.path = req.path;

  if (req.path.substr(-1) === '/' && req.path.length > 1) {
    res.locals.path = req.path.slice(0, -1);
  }
  req.customs.path = res.locals.path;
  next();
});

// ROUTES
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/brands', brandRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/a', adminViewRouter);
app.use('/', userViewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorContoller);

module.exports = app;
