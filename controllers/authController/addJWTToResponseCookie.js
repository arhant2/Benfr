const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const signJWTToken = async (id) => {
  return await promisify(jwt.sign)({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = async (req, res, userId) => {
  res.clearCookie('changeEmailJwt');
  const token = await signJWTToken(userId);
  console.log('Added jwt');
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + ms(process.env.JWT_EXPIRES_IN)),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
};
