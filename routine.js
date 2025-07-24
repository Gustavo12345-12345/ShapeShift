import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; // Importa a configuração do Firebase
import { processWorkoutTextToHtml } from './utils.js'; // Importa a função de processamento de texto

document.addEventListener('DOMContentLoaded', () => {
    const routineContentEl = document.getElementById('routine-content');
    const loaderEl = document.getElementById('routine-loader');
    const emptyStateEl = document.getElementById('empty-state');

    // Escuta por mudanças no estado de autenticação para garantir que temos um usuário
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Se o usuário está logado, tenta carregar a rotina
            try {
                const userId = user.uid;
                // O caminho para o documento deve corresponder exatamente ao caminho usado para salvar em app.js
                const routineRef = doc(db, "users", userId, "routine", "active");

                const docSnap = await getDoc(routineRef);

                if (docSnap.exists()) {
                    // Se a rotina existe no banco de dados
                    const routineData = docSnap.data();
                    const rawText = routineData.rawText; // Pega o texto bruto da rotina

                    if (rawText) {
                        // Processa o texto para HTML e o exibe na página
                        routineContentEl.innerHTML = processWorkoutTextToHtml(rawText);
                        routineContentEl.classList.remove('hidden');
                    } else {
                        // Caso o documento exista mas não tenha texto
                        emptyStateEl.classList.remove('hidden');
                    }
                } else {
                    // Se nenhuma rotina foi encontrada para o usuário
                    console.log("Nenhum documento de rotina encontrado!");
                    emptyStateEl.classList.remove('hidden');
                }
            } catch (error) {
                // Trata quaisquer erros que ocorram durante o carregamento
                console.error("Erro ao carregar rotina:", error);
                routineContentEl.innerHTML = `<p class="text-red-400">Ocorreu um erro ao carregar sua rotina. Tente novamente mais tarde.</p>`;
                routineContentEl.classList.remove('hidden');
            } finally {
                // Esconde o loader após a tentativa de carregamento
                loaderEl.classList.add('hidden');
            }
        } else {
            // Se não há usuário logado, redireciona para a página de login
            window.location.href = 'login.html';
        }
    });
});
