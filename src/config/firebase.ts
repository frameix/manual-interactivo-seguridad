import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBcTuylp4fqGDPdNHM-pEtQiYFIyPTojpQ",
  authDomain: "manual-seguridad.firebaseapp.com",
  projectId: "manual-seguridad",
  databaseURL: "https://manual-seguridad-default-rtdb.firebaseio.com",
  storageBucket: "manual-seguridad.firebasestorage.app",
  messagingSenderId: "493158409661",
  appId: "1:493158409661:web:f03c46e60c6b2dce099ed4",
  measurementId: "G-CQXZQKKPC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
