import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js'; // Importa do ficheiro centralizado

const provider = new GoogleAuthProvider();
const loginBtn = document.getElementById('login-btn');
const errorContainer = document.getElementById('auth-error');

async function handleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                plan: "free",
                createdAt: new Date().toISOString(),
                streakCount: 0,
                lastWorkoutDate: null,
                streakRestores: 5 
            });
        }
        window.location.href = 'index.html';

    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
            errorContainer.textContent = "O login foi cancelado.";
        } else {
            errorContainer.textContent = `Erro no login: ${error.message}`;
        }
        errorContainer.classList.remove('hidden');
    }
}

// Redireciona se o utilizador já estiver logado
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'index.html';
    }
});

if(loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
}
