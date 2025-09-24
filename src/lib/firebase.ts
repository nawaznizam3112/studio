
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "qrengage-dmaq4",
  "appId": "1:294329022005:web:a812047046ec1fe3f8637c",
  "storageBucket": "qrengage-dmaq4.appspot.com",
  "apiKey": "AIzaSyC5RhyLnSwaZMsmaNwzHPf_0YC_E282beg",
  "authDomain": "qrengage-dmaq4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "294329022005"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
