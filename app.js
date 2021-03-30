const path = require('path');

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/AppError');
const dateFormator = require('./utils/dateFormator');
const errorContoller = require('./controllers/errorController');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const brandRouter = require('./routes/brandRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const addressRouter = require('./routes/addressRoutes');
const cartRouter = require('./routes/cartRoutes');
const userViewRouter = require('./routes/userViewRoutes');
const adminViewRouter = require('./routes/adminViewRoutes');

// START A SERVER
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use('/a', adminViewRouter);
app.use('/', userViewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorContoller);

module.exports = app;
