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
  DEFAULT_INBOX_NAME,
  DEFAULT_GRACE,
} = require('../util/constants');


exports.userGet = async (req, res) => {
  const userRequest = db.doc(`/users/${req.user.uid}`);
  var stacksData = { stacks: {} };

  try {
    const userDoc = await userRequest.get();

    // validate access
    if (!userDoc.exists) {
      console.error('[ERROR]', 'Document not found');
      return res.status(404).json({ error: 'Document not found' });
    }

    // retrieve all stacks under the user
    const stacksSnapshot = await db.collection('stacks')
      .where('userId', '==', req.user.uid)
      .get();

    stacksSnapshot.forEach((stackDoc) => {
      const stackData = stackDoc.data();
      stackData.id = stackDoc.id;
      stacksData.stacks[stackDoc.id] = stackData;
    });

    stacksData.user = userDoc.data();

    return res.status(200).json(stacksData);
  }
  catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: err.code });
  }
}

exports.userUpdate = (req, res) => {
  res.json('ok');
}

/* [GET] /signup
 *
 * creates a user associated with the email if one doesn't already exist
 *
 * returns the user's authentication token upon success
 */
exports.userSignup = async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  }

  // validate body data
  const { errors, valid } = validateUserSignup(newUser);
  if (!valid) {
    console.error('[ERROR] Invalid body params');

    return res.status(400).json(errors);
  }

  let userToken, userId;

  try {
    const userDoc = await db.doc(`/users/${newUser.email}`).get();

    if (userDoc.exists) {
      console.error('[ERROR] User with email already exists')
      return res.status(400).json({ handle: 'this handle is already taken' });
    }

    // create the authentication entry for the user
    console.log('[INFO] Creating new user', newUser);

    const authData = await firebase.auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)

    // parse the user's token
    userId = authData.user.uid;
    const token = await authData.user.getIdToken();

    userToken = token;

    // create the user document
    const userData = {
      userId: userId,
      email: newUser.email,
      theme: DEFAULT_THEME,
      createdAt: new Date().toISOString(),
    }

    await db.doc(`/users/${userId}`).set(userData);

    // create new inbox stack
    const newInbox = {
      name: DEFAULT_INBOX_NAME,
      isRoutine: false,
      isInbox: true,
      backgroundColor: 'default',
      durationGrace: DEFAULT_GRACE,
      order: [],
      userId: userId,
      createdAt: new Date().toISOString(),
    };

    await db.collection('stacks').add(newInbox)

    // success, return the token to the requester
    return res.status(201).json({ token });
  }
  catch (err) {
    console.error('[ERROR]', err);
    return res.status(500).json({ error: err.code });
  }
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
  if (!valid) {
    console.error('[ERROR] Invalid body params');

    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)

    .then(data => {
      // create the authentication entry for the user
      console.log('[INFO] Logged in user', user.email);

      return data.user.getIdToken();
    })

    .then(token => {
      // success, return the token to the requester
      return res.status(200).json({ token });
    })

    .catch((err) => {
      console.error('[ERROR]', err);

      if (err.code === 'auth/wrong-password'
        || err.code === 'auth/user-not-found') {
        return res.status(403)
          .json({ general: 'Wrong credentials, please try again' });
      }
      else return res.status(500).json({ error: err.code });
    });
}
