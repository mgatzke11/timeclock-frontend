import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8OxgonBToSaHrZaFAVXsdl-0Kpf6tJ2s",
  authDomain: "cug-manufacturing-hub.firebaseapp.com",
  projectId: "cug-manufacturing-hub",
  storageBucket: "cug-manufacturing-hub.firebasestorage.app",
  messagingSenderId: "1038909551804",
  appId: "1:1038909551804:web:dc653edd4ce74dff240cb9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
