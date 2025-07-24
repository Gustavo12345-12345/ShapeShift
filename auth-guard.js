import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from './firebase-config.js';

/**
 * Esta função verifica o estado de autenticação e protege a página.
 * Ela espera um momento para dar tempo ao Firebase de carregar o estado de login,
 * evitando o redirecionamento incorreto.
 */
const protectPage = () => {
    onAuthStateChanged(auth, (user) => {
        // Se depois de verificar, não houver utilizador, e não estivermos na página de login,
        // então redireciona para o login.
        if (!user && !window.location.pathname.endsWith('login.html')) {
            console.log("Auth Guard: Utilizador não encontrado. A redirecionar para o login.");
            window.location.href = 'login.html';
        }
    });
};

// Executa a proteção da página
protectPage();
