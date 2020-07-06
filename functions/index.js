const functions = require('firebase-functions');
const firebase = require('firebase');
const app = require('express')();

const { db } = require('./util/admin');

const FBAuth = require('./util/fbAuth');


// ----- scream routes
//app.get('/screams', getAllScreams);


// ----- users routes
//app.post('/signup', signup);
app.get('/', (req, res) => res.status(200).json({ response: "Hello, world!" }));

exports.api = functions.https.onRequest(app);
