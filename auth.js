import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// As instâncias do auth e db são obtidas da janela (window) onde foram inicializadas no HTML.
const auth = window.auth;
const db = window.db;
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

        // Se o utilizador não existir na base de dados, cria um novo documento para ele.
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                plan: "free",
                createdAt: new Date().toISOString(),
                // Campos para o sistema de "foguinho" (streak)
                streakCount: 0,
                lastWorkoutDate: null,
                streakRestores: 5 
            });
        }
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Erro durante o login:", error.code, error.message);
        
        // Trata especificamente o erro de pop-up fechado pelo utilizador.
        if (error.code === 'auth/popup-closed-by-user') {
            errorContainer.textContent = "O login foi cancelado. Por favor, tente novamente.";
        } else {
            errorContainer.textContent = `Erro no login: ${error.message}`;
        }
        errorContainer.classList.remove('hidden');
    }
}

/**
 * Observador que redireciona o utilizador se ele já estiver logado.
 */
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith('login.html')) {
        window.location.href = 'index.html';
    }
});

// Adiciona o listener ao botão de login.
if(loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
}
