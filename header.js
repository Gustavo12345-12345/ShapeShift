document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    const currentPage = window.location.pathname;

    const headerHTML = `
        <div id="main-navigation-container" class="fixed-header">
            <nav>
                <a href="index.html" class="${currentPage.includes('index.html') || currentPage === '/' ? 'text-amber-400' : ''}">Gerador</a>
                <a href="minha-rotina.html" class="${currentPage.includes('minha-rotina.html') ? 'text-amber-400' : ''}">Minha Rotina</a>
                <a href="planos.html" class="${currentPage.includes('planos.html') ? 'text-amber-400' : ''}">Planos</a>
            </nav>
            <div class="nav-right-items">
                <div id="streak-counter-nav">
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

    // Adiciona o listener de logout ao botão recém-criado
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // Precisa importar o signOut e o auth para este escopo, ou passar a lógica para um arquivo principal
        // Por simplicidade aqui, vamos assumir que uma função global `performLogout` existe
        // A melhor abordagem seria centralizar a lógica de auth.
    }
});
