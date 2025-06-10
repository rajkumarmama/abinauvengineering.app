// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADOrE0oipAU6ove_l4_iaEjDYqxdzKy8I",
  authDomain: "abinauvengineering-a798d.firebaseapp.com",
  projectId: "abinauvengineering-a798d",
  storageBucket: "abinauvengineering-a798d.firebasestorage.app",
  messagingSenderId: "298434714028",
  appId: "1:298434714028:web:11b412f18c88bb6b840209",
  measurementId: "G-8CKCXM5DST"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
