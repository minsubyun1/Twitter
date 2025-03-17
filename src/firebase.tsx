import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvX5jaSL7KpWPRGAJyskoSysCdXyohiwo",
  authDomain: "nwitter-reloaded-18cd7.firebaseapp.com",
  projectId: "nwitter-reloaded-18cd7",
  storageBucket: "nwitter-reloaded-18cd7.firebasestorage.app",
  messagingSenderId: "620865491796",
  appId: "1:620865491796:web:8908198224dd3af38baec1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
