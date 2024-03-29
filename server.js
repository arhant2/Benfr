const path = require('path');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  console.log('Error stack: ', err.stack);
  process.exit(1);
});

dotenv.config({ path: path.join(__dirname, './config.env') });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
).replace('<USER>', process.env.DATABASE_USER);

mongoose
  .connect(DB)
  .then(() => console.log('🤞 DATABASE connection successful!'));

const PORT = process.env.PORT || 3000;

const app = require('./app');

const server = app.listen(PORT, () => {
  console.log(`👍 App listening on ${PORT}...`);
});

process.on('unhandledRejection', (err, p) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  console.log('Error stack: ', err.stack);
  console.log('Rejected promise: ', p);
  server.close(() => {
    process.exit(1);
  });
});
