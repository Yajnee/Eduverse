// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup as _signInWithPopup, signInWithEmailAndPassword as _signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmAOTwqruatVcrec1NSSNbLC1Y_Vj01JU",
  authDomain: "eduverse-28083.firebaseapp.com",
  projectId: "eduverse-28083",
  storageBucket: "eduverse-28083.firebasestorage.app",
  messagingSenderId: "278362797107",
  appId: "1:278362797107:web:a5fe0b55b8f321a8d71f46",
  measurementId: "G-980QYBLNZB"

};

// initialize firebase
const app = initializeApp(firebaseConfig);

// auth objects
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// re-export the commonly used functions to match previous imports
export {
  auth,
  googleProvider,
  _signInWithPopup as signInWithPopup,
  _signInWithEmailAndPassword as signInWithEmailAndPassword,
};

export default { auth, googleProvider };
