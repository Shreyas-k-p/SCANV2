import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQmCcOe_zMOXQapwuX_m2pCIjpd_1SZwE",
  authDomain: "scan4serve.firebaseapp.com",
  projectId: "scan4serve",
  storageBucket: "scan4serve.firebasestorage.app",
  messagingSenderId: "588220465690",
  appId: "1:588220465690:web:e05b066f084dbbd0fe87a3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
