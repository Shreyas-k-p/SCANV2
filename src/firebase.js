import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChh60RN1rHtU4m34K0ritAeizBKfnc6gA",
  authDomain: "scan4serve-v2.firebaseapp.com",
  projectId: "scan4serve-v2",
  storageBucket: "scan4serve-v2.firebasestorage.app",
  messagingSenderId: "266510887170",
  appId: "1:266510887170:web:caa8c0d753d98b8e99ba1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
