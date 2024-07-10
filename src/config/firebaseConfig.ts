// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const app = initializeApp({
  apiKey: "AIzaSyBov3LGp6m4JerjgJ_iUxMTErH3RFb70h8",
  authDomain: "guestbook-a9040.firebaseapp.com",
  projectId: "guestbook-a9040",
  storageBucket: "guestbook-a9040.appspot.com",
  messagingSenderId: "525199108441",
  appId: "1:525199108441:web:58491565341312239d8448",
});
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);
