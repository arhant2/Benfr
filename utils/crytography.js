const crypto = require('crypto');

exports.createRandomString = (bytesCount) =>
  crypto.randomBytes(bytesCount).toString('hex');

exports.createHash = (unhashedVal) =>
  crypto.createHash('sha256').update(unhashedVal).digest('hex');
