import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js'; // Importa do ficheiro centralizado

document.addEventListener('DOMContentLoaded', () => {
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

            // Se o documento do usuário não existe, crie-o.
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
            
            // Redireciona para a página inicial após o login bem-sucedido
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

    // Redireciona se o utilizador JÁ ESTIVER logado ao visitar a página de login
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Verifica se a URL atual é a página de login
            // Usamos startsWith para cobrir tanto /login quanto /login/
            if (window.location.pathname.startsWith('/login')) { 
                console.log("Usuário já logado detectado, redirecionando para a página inicial...");
                window.location.href = '/'; // Redireciona para a página inicial
            }
        }
    });

    if(loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        console.log("Botão de login configurado com sucesso.");
    } else {
        console.error("ERRO CRÍTICO: O botão de login não foi encontrado na página.");
    }
});
