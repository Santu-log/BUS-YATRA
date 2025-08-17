// firebase-config.js (Corrected)

const firebaseConfig = {
    apiKey: "AIzaSyD5gmtBqbSIG4AZel87uiXAPwLso8Ac3RQ",
    authDomain: "bus-yatra-e66f7.firebaseapp.com",
    projectId: "bus-yatra-e66f7",
    storageBucket: "bus-yatra-e66f7.appspot.com",
    messagingSenderId: "360038656949",
    appId: "1:360038656949:web:defd9dd42f3323534e47fc",
    measurementId: "G-00ECX1VTLH"
  };

// CHANGED: Use the compat library's initialization syntax.
// This creates the global 'firebase' object that your other scripts need.
firebase.initializeApp(firebaseConfig);

// ADDED: Define auth and db so your other scripts (app.js, auth.js) can use them.
const auth = firebase.auth();
const db = firebase.firestore();