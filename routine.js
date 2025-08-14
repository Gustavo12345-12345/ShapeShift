import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const routineContent = document.getElementById('routine-content');
    const emptyState = document.getElementById('empty-state');
    const deleteBtn = document.getElementById('delete-routine-btn');
    const logoutBtn = document.getElementById('logout-btn');

    let routineDocRef; // Guardará a referência ao documento da rotina

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Se o utilizador está logado, define a referência ao documento da sua rotina
            routineDocRef = doc(db, "users", user.uid, "routine", "active");

            // Ouve por alterações no documento da rotina em tempo real
            onSnapshot(routineDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    // Se o documento existe, a rotina foi encontrada
                    const routineData = docSnap.data();
                    const rawText = routineData.rawText;

                    // Processa o texto da rotina para HTML, mostrando os botões "Iniciar Treino"
                    const routineHtml = processWorkoutTextToHtml(rawText, { showStartButton: true });
                    
                    // Exibe o conteúdo da rotina e o botão de apagar
                    routineContent.innerHTML = routineHtml;
                    routineContent.classList.remove('hidden');
                    deleteBtn.classList.remove('hidden');
                    emptyState.classList.add('hidden');

                } else {
                    // Se o documento não existe, mostra a mensagem de "nenhuma rotina"
                    routineContent.classList.add('hidden');
                    deleteBtn.classList.add('hidden');
                    emptyState.classList.remove('hidden');
                }
            }, (error) => {
                console.error("Erro ao carregar a rotina:", error);
                alert("Não foi possível carregar a sua rotina. Tente novamente.");
            });

        } else {
            // Se o utilizador não está logado, redireciona para a página de login
            window.location.href = '/login.html';
        }
    });

    // Função para apagar a rotina
    async function handleDeleteRoutine() {
        if (!routineDocRef) return;

        // Pede confirmação ao utilizador antes de apagar
        const wantsToDelete = confirm("Tem a certeza de que quer apagar a sua rotina atual? Esta ação não pode ser desfeita.");
        
        if (wantsToDelete) {
            deleteBtn.disabled = true;
            deleteBtn.textContent = "A apagar...";
            try {
                // Apaga o documento do Firestore
                await deleteDoc(routineDocRef);
                // O onSnapshot tratará de atualizar a UI automaticamente
                alert("Rotina apagada com sucesso!");
            } catch (error) {
                console.error("Erro ao apagar a rotina: ", error);
                alert("Ocorreu um erro ao apagar a rotina.");
            } finally {
                deleteBtn.disabled = false;
                deleteBtn.textContent = "Remover Rotina Atual";
            }
        }
    }

    // Adiciona os eventos aos botões
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteRoutine);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).catch(console.error);
        });
    }
});
