import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from './firebase-config.js';

const protectPage = () => {
    onAuthStateChanged(auth, (user) => {
        // Dá um pequeno tempo para o getRedirectResult() do auth.js ser processado.
        setTimeout(() => {
            if (!user && !window.location.pathname.endsWith('login.html')) {
                console.log("Auth Guard: Utilizador não encontrado. A redirecionar para o login.");
                window.location.href = 'login.html';
            }
        }, 500); // Meio segundo de espera
    });
};

protectPage();
