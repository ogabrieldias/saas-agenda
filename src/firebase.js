// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // importa Firestore

const firebaseConfig = {
  apiKey: "AIzaSyD8Vkg4Zi3_zch0hgnKiWb8qqPjo7tUmZE",
  authDomain: "agenda-app-2026.firebaseapp.com",
  projectId: "agenda-app-2026",
  storageBucket: "agenda-app-2026.appspot.com",
  messagingSenderId: "99198430278",
  appId: "1:99198430278:web:69dbf63aca367794faee47"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Instâncias
const auth = getAuth(app);
const db = getFirestore(app); // banco de dados

// Exporta para usar em outros arquivos
export { auth, db };