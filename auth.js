import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js'; // Importa do ficheiro centralizado

// A lógica principal só é executada depois de o HTML estar completamente carregado.
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
            
            // NÃO FAÇA O REDIRECIONAMENTO AQUI.
            // O listener onAuthStateChanged abaixo cuidará disso.
            // window.location.href = 'index.html'; // LINHA REMOVIDA

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

    // Este listener agora se torna a ÚNICA fonte de redirecionamento.
    // Ele dispara quando o usuário já está logado OU quando o login via popup tem sucesso.
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Se o utilizador está logado (seja de uma sessão anterior ou de um novo login),
            // ele deve ser redirecionado para a página principal.
            if (window.location.pathname.endsWith('login.html')) {
                window.location.href = 'index.html';
            }
        }
    });

    // Adiciona o listener ao botão de login, agora com a certeza de que ele existe.
    if(loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        console.log("Botão de login configurado com sucesso."); // Mensagem de confirmação
    } else {
        console.error("ERRO CRÍTICO: O botão de login não foi encontrado na página.");
    }
});
