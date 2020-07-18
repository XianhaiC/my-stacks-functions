const { admin, db } = require('./admin')

module.exports = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split('Bearer ')[1];
  }
  else {
    console.error('[WARN] Unauthorized request');

    return res.status(403).json({ error: 'Unauthorized' });
  }

  admin.auth().verifyIdToken(token)

    .then(decodedToken => {
      req.user = decodedToken;
      return next();
    })

    .catch(err => {
      console.error('[ERROR] Cannot verify token', err);
      return res.status(403).json(err);
    })

  return res.status(403);
}
