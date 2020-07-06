var config = {
  apiKey: "AIzaSyBkGZonwVMdftKjytFuran-EE-am1FKAOQ",
  authDomain: "mocha-test-7e825.firebaseapp.com",
  databaseURL: "https://mocha-test-7e825.firebaseio.com",
  projectId: "mocha-test-7e825",
  storageBucket: "mocha-test-7e825.appspot.com",
  messagingSenderId: "241867457695",
  appId: "1:241867457695:web:bc06c139f469a6e6bd0eaa",
  measurementId: "G-6EBHKSB7V5"
};
const test = require('firebase-functions-test')(config, './serviceAccountKeyTest.json');
