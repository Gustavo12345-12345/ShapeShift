import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from './firebase-config.js';

const protectPage = () => {
    onAuthStateChanged(auth, (user) => {
        // Esta função é chamada quando o estado de autenticação do usuário é resolvido.
        // O Firebase já lida com a persistência da sessão através da página.

        // Se não há usuário e a página atual NÃO é a de login, redireciona.
        if (!user && window.location.pathname !== '/login.html') {
            console.log("Auth Guard: Usuário não encontrado. Redirecionando para o login.");
            window.location.href = '/login.html';
        }
    });
};

// Chama a função para proteger as páginas
protectPage();
