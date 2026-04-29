
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5QHXQGFWQ8wC8oPVbz2aBF3C92sa-_P8",
  authDomain: "todo-firebase-eca32.firebaseapp.com",
  projectId: "todo-firebase-eca32",
  storageBucket: "todo-firebase-eca32.firebasestorage.app",
  messagingSenderId: "949194071535",
  appId: "1:949194071535:web:35b50d101ab567ed316a1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);