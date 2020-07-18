const firebase = require('firebase');
const { admin, db } = require('../util/admin');
const config = require('../util/config');

// firebase API used to communicate with the authentication
// servers
firebase.initializeApp(config);

const {
  validateUserSignup,
  validateUserLogin,
} = require('../util/validators');

const {
  DEFAULT_THEME,
} = require('../util/constants');

exports.userGet = (req, res) => {
  res.json("ok");
}

exports.userUpdate = (req, res) => {
  res.json("ok");
}

/* [GET] /signup
 *
 * creates a user associated with the email if one doesn't already exist
 *
 * returns the user's authentication token upon success
 */
exports.userSignup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  }

  // validate body data
  const { errors, valid } = validateUserSignup(newUser);
  if (!valid) return res.status(400).json(errors);

  let userToken, userId;

  db.doc(`/users/${newUser.email}`).get()
    .then(doc => {
      // check if the user already exists
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      }

      // create the authentication entry for the user
      console.log("[INFO] Creating new user", newUser);

      return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
    })

    .then(authData => {
      // parse the user's token
      userId = authData.user.uid;
      return authData.user.getIdToken()
    })

    .then(token => {
      userToken = token;

      // create the user document
      const userData = {
        userId: userId,
        email: newUser.email,
        theme: DEFAULT_THEME,
        createdAt: new Date().toISOString(),
      }

      return db.doc(`/users/${userId}`).set(userData);
    })

    .then(() => {
      // success, return the token to the requester
      return res.status(201).json({ userToken });
    })

    .catch(err => {
      console.error("[ERROR]", err);

      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' });
      }
      else {
        return res.status(500).json({ general: 'Something went wrong, please try again' });
      }
    });
}

/* [GET] /login
 *
 * logs in the user if the credentials are valid and correct
 *
 * returns the user's authentication token upon success
 */
exports.userLogin = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  // validate body data
  const { errors, valid } = validateUserLogin(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)

    .then(data => {
      // create the authentication entry for the user
      console.log("[INFO] Logged in user", user.email);

      return data.user.getIdToken();
    })

    .then(token => {
      // success, return the token to the requester
      return res.status(200).json({ token });
    })

    .catch((err) => {
      console.error("[ERROR]", err);

      if (err.code === 'auth/wrong-password'
        || err.code === 'auth/user-not-found') {
        return res.status(403)
          .json({ general: 'Wrong credentials, please try again' });
      }
      else return res.status(500).json({ error: err.code });
    });
}
