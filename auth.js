import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js'; // Importa do ficheiro centralizado

document.addEventListener('DOMContentLoaded', () => {
    const provider = new GoogleAuthProvider();
    const loginBtn = document.getElementById('login-btn');
    const errorContainer = document.getElementById('auth-error');

    /**
     * Inicia o processo de login redirecionando para a página do Google.
     */
    async function handleLogin() {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Erro ao iniciar o redirecionamento de login:", error);
            errorContainer.textContent = `Erro: ${error.message}`;
            errorContainer.classList.remove('hidden');
        }
    }

    /**
     * Verifica o resultado do login após o utilizador ser redirecionado de volta do Google.
     */
    async function checkRedirectResult() {
        try {
            const result = await getRedirectResult(auth);
            
            // Se 'result' não for nulo, significa que o login foi bem-sucedido.
            if (result && result.user) {
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
                // Não é necessário redirecionar para 'index.html' aqui,
                // o auth-guard fará isso automaticamente.
            }
        } catch (error) {
            console.error("Erro ao obter o resultado do redirecionamento:", error.code, error.message);
            errorContainer.textContent = `Erro no login: ${error.message}`;
            errorContainer.classList.remove('hidden');
        }
    }

    // Verifica o resultado do redirecionamento assim que a página carrega.
    checkRedirectResult();

    // Redireciona se o utilizador já estiver logado (e não estiver a meio de um redirect)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (window.location.pathname.endsWith('login.html')) {
                window.location.href = 'index.html';
            }
        }
    });

    // Adiciona o listener ao botão de login.
    if(loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    } else {
        console.error("ERRO CRÍTICO: O botão de login não foi encontrado na página.");
    }
});
