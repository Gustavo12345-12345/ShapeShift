/**
 * firebase-config.js
 * Este ficheiro inicializa a conexão com o Firebase.
 *
 * IMPORTANTE: Substitua o objeto 'firebaseConfig' pelos dados
 * do seu próprio projeto no painel do Firebase.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// TODO: Substitua o objeto abaixo pelas credenciais do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAEsQXShcDO-IP4C0mLFBevckA6ccoFry4",
  authDomain: "workoutplaner-3930e.firebaseapp.com",
  projectId: "workoutplaner-3930e",
  storageBucket: "workoutplaner-3930e.firebasestorage.app",
  messagingSenderId: "197140468893",
  appId: "1:197140468893:web:1e43c4072bddb0a4ec3074"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços para serem usadas em outros ficheiros
export const auth = getAuth(app);
export const db = getFirestore(app);
