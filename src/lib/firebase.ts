import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOu78zJoLPDNfNyKjX4tIaOiN_lb3H10Q",
  authDomain: "mailsweep-c663e.firebaseapp.com",
  databaseURL: "https://mailsweep-c663e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mailsweep-c663e",
  storageBucket: "mailsweep-c663e.firebasestorage.app",
  messagingSenderId: "516439091078",
  appId: "1:516439091078:web:b58b030c852323a620ee07",
  measurementId: "G-8ZZH7GFD32"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();