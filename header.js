/**
 * header.js
 * Este script injeta dinamicamente o cabeçalho de navegação em todas as páginas.
 * Inclui um logo inteligente que direciona o usuário com base na existência de uma rotina.
 */
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) {
        console.error("Elemento '#header-placeholder' não encontrado.");
        return;
    }

    const currentPage = window.location.pathname;

    // HTML do cabeçalho agora inclui o placeholder para o logo
    const headerHTML = `
        <div id="main-navigation-container">
            <!-- O logo será inserido aqui -->
            <a href="/index.html" id="header-logo">
                <h1>Shape<span class="text-amber-400">Shift</span></h1>
            </a>
            <nav>
                <a href="/index.html" class="${(currentPage === '/' || currentPage.endsWith('/index.html')) ? 'text-amber-400' : ''}">Gerador</a>
                <a href="/minha-rotina.html" class="${currentPage.endsWith('/minha-rotina.html') ? 'text-amber-400' : ''}">Minha Rotina</a>
                <a href="/planos.html" class="${currentPage.endsWith('/planos.html') ? 'text-amber-400' : ''}">Planos</a>
            </nav>
            <div class="nav-right-items">
                <div id="streak-counter-nav" class="hidden">
                    <span>🔥</span>
                    <span id="streak-count-nav">0</span>
                </div>
                <button id="logout-btn" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/><path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/></svg>
                </button>
            </div>
        </div>
    `;
    
    headerPlaceholder.innerHTML = headerHTML;

    // Lógica do Logo Inteligente
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const logoLink = document.getElementById('header-logo');
            if (logoLink) {
                try {
                    const routineRef = doc(db, "users", user.uid, "routine", "active");
                    const routineSnap = await getDoc(routineRef);
                    
                    // Se a rotina existir, o logo aponta para "Minha Rotina".
                    if (routineSnap.exists()) {
                        logoLink.href = '/minha-rotina.html';
                    } else {
                        // Caso contrário, aponta para a página inicial (Gerador).
                        logoLink.href = '/index.html';
                    }
                } catch (error) {
                    console.error("Erro ao verificar rotina para o link do logo:", error);
                    logoLink.href = '/index.html'; // Garante um fallback
                }
            }
        }
    });
});
