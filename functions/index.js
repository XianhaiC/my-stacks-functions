const functions = require('firebase-functions');
const firebase = require('firebase');
const app = require('express')();

const { db } = require('./util/admin');
const auth = require('./util/auth');

const {
  userGet,
  userUpdate,
  userSignup,
  userLogin,
} = require('./handlers/users');

const {
  stackBlocksGet,
  stackBlocksDelete,
  stackCreate,
  stackUpdate,
  stackDelete,
} = require('./handlers/stacks');

const {
  blockCreate,
  blockUpdate,
  blockDelete,
} = require('./handlers/blocks');

// ----- user routes
app.get('/users/', auth, userGet);
app.patch('/users/', auth, userUpdate);
app.post('/signup', userSignup);
app.post('/login', userLogin);

// ----- stack routes
app.get('/stacks/:stackId/blocks', auth, stackBlocksGet);
app.delete('/stacks/:stackId/blocks', auth, stackBlocksDelete);
app.post('/stacks', auth, stackCreate);
app.patch('/stacks/:stackId', auth, stackUpdate);
app.delete('/stacks/:stackId', auth, stackDelete);

// ----- block routes
app.post('/blocks', auth, blockCreate);
app.patch('/blocks/:blockId', auth, blockUpdate);
app.delete('/blocks/:blockId', auth, blockDelete);

exports.api = functions.https.onRequest(app);
