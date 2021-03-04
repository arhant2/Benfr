exports.protectView = (req, res, next) => {
  if (req.customs.user) {
    return next();
  }
  res.redirect(`/login?redirect=${req.customs.encodedUrl}&continue=true`);
};
