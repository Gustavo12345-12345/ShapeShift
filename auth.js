import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEsQXShcDO-IP4C0mLFBevckA6ccoFry4",
  authDomain: "workoutplaner-3930e.firebaseapp.com",
  projectId: "workoutplaner-3930e",
  storageBucket: "workoutplaner-3930e.firebasestorage.app",
  messagingSenderId: "197140468893",
  appId: "1:197140468893:web:1e43c4072bddb0a4ec3074",
  measurementId: "G-W85Z68R4B9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('login-btn');
const errorContainer = document.getElementById('auth-error');

/**
 * Lida com o processo de login com o Google.
 */
async function handleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // Se o usuário não existir na base de dados, cria um novo documento para ele.
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                plan: "free",
                generations: 3,
                createdAt: new Date().toISOString(),
                // Campos para o sistema de "foguinho" (streak)
                streakCount: 0,
                lastWorkoutDate: null,
                streakRestores: 5 
            });
        }
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Erro durante o login:", error);
        errorContainer.textContent = `Erro no login: ${error.message}`;
        errorContainer.classList.remove('hidden');
    }
}

/**
 * Observador que redireciona o usuário se ele já estiver logado.
 */
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith('login.html')) {
        window.location.href = 'index.html';
    }
});

// Adiciona o listener ao botão de login.
if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
}
