const admin = require('firebase-admin');
const config = require('./config');

const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://my-stacks.firebaseio.com',
  storageBucket: config.storageBucket,
});

const db = admin.firestore();

module.exports = { admin, db }
