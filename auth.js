import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const provider = new GoogleAuthProvider();
    const loginBtn = document.getElementById('login-btn');
    const errorContainer = document.getElementById('auth-error');

    async function handleLogin() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // Se o documento do usuário não existe, crie-o com os campos do paywall.
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: user.email,
                    plan: "free", // 'free' ou 'pro'
                    createdAt: new Date().toISOString(),
                    generationCount: 0, // Contador de gerações
                    streakCount: 0,
                    lastWorkoutDate: null,
                });
            }
            
            window.location.href = '/'; 

        } catch (error) {
            console.error("Erro durante o login:", error.code, error.message);
            if (error.code === 'auth/popup-closed-by-user') {
                errorContainer.textContent = "O login foi cancelado.";
            } else {
                errorContainer.textContent = `Erro no login: ${error.message}`;
            }
            errorContainer.classList.remove('hidden');
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (user && window.location.pathname === '/login.html') { 
            window.location.href = '/';
        }
    });

    if(loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
});
