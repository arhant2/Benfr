module.exports.logout = (req, res, next) => {
  res.clearCookie('changeEmailJwt');
  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
  });
};
