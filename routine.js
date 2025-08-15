import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, onSnapshot, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const routineContent = document.getElementById('routine-content');
    const emptyState = document.getElementById('empty-state');
    const deleteBtn = document.getElementById('delete-routine-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const timerModal = document.getElementById('timer-modal');
    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start-btn');
    const timerCloseBtn = document.getElementById('timer-close-btn');
    const increaseTimeBtn = document.getElementById('increase-time-btn');
    const decreaseTimeBtn = document.getElementById('decrease-time-btn');

    let routineDocRef;
    let timerInterval;
    let totalSeconds = 60;
    const TIME_STEP = 15;
    const MIN_TIME = 15;

    // --- LÓGICA DO CRONÓMETRO ---
    const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    const updateTimerDisplay = () => {
        timerDisplay.textContent = formatTime(totalSeconds);
        decreaseTimeBtn.disabled = totalSeconds <= MIN_TIME;
    };
    const openTimerModal = () => { totalSeconds = 60; updateTimerDisplay(); timerStartBtn.disabled = false; timerStartBtn.textContent = "Iniciar"; increaseTimeBtn.disabled = false; timerModal.classList.remove('hidden'); };
    const closeTimerModal = () => { clearInterval(timerInterval); timerModal.classList.add('hidden'); };
    const startTimer = () => {
        clearInterval(timerInterval);
        timerStartBtn.disabled = true;
        timerStartBtn.textContent = "A contar...";
        decreaseTimeBtn.disabled = true;
        increaseTimeBtn.disabled = true;
        timerInterval = setInterval(() => {
            totalSeconds--;
            updateTimerDisplay();
            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                closeTimerModal();
            }
        }, 1000);
    };

    // --- LÓGICA DA ROTINA ---
    const updateStreak = async (user) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;
        const userData = userSnap.data();
        const today = new Date().toISOString().split('T')[0];
        if (userData.lastWorkoutDate === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const newStreak = (userData.lastWorkoutDate === yesterdayStr) ? (userData.streakCount || 0) + 1 : 1;
        await updateDoc(userRef, { streakCount: newStreak, lastWorkoutDate: today });
        alert("Parabéns! Treino finalizado e foguinho atualizado!");
    };

    const addEventListenersToRoutine = () => {
        routineContent.querySelectorAll('.workout-day').forEach(dayContainer => {
            const checkboxes = dayContainer.querySelectorAll('.exercise-checkbox');
            const finishButton = dayContainer.querySelector('.finish-workout-button');
            const restButtons = dayContainer.querySelectorAll('.rest-button');

            const checkCompletion = () => {
                const allChecked = [...checkboxes].every(box => box.checked);
                finishButton.disabled = !allChecked;
            };

            checkboxes.forEach(box => box.addEventListener('change', checkCompletion));
            
            restButtons.forEach(button => button.addEventListener('click', openTimerModal));

            finishButton.addEventListener('click', async () => {
                const user = auth.currentUser;
                if (user) {
                    finishButton.disabled = true;
                    finishButton.textContent = "Guardado!";
                    await updateStreak(user);
                }
            });
        });
    };

    onAuthStateChanged(auth, (user) => {
        if (!user) { window.location.href = '/login.html'; return; }
        routineDocRef = doc(db, "users", user.uid, "routine", "active");
        onSnapshot(routineDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const routineHtml = processWorkoutTextToHtml(docSnap.data().rawText);
                routineContent.innerHTML = routineHtml;
                addEventListenersToRoutine();
                routineContent.classList.remove('hidden');
                deleteBtn.classList.remove('hidden');
                emptyState.classList.add('hidden');
            } else {
                routineContent.classList.add('hidden');
                deleteBtn.classList.add('hidden');
                emptyState.classList.remove('hidden');
            }
        });
    });

    async function handleDeleteRoutine() {
        if (!routineDocRef || !confirm("Tem a certeza de que quer apagar a sua rotina atual?")) return;
        deleteBtn.disabled = true;
        deleteBtn.textContent = "A apagar...";
        try { await deleteDoc(routineDocRef); }
        catch (error) { console.error("Erro ao apagar a rotina: ", error); }
        finally { deleteBtn.disabled = false; deleteBtn.textContent = "Remover Rotina Atual"; }
    }

    // --- EVENTOS GERAIS ---
    if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteRoutine);
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));
    if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
    if (timerCloseBtn) timerCloseBtn.addEventListener('click', closeTimerModal);
    if (increaseTimeBtn) increaseTimeBtn.addEventListener('click', () => { totalSeconds += TIME_STEP; updateTimerDisplay(); });
    if (decreaseTimeBtn) decreaseTimeBtn.addEventListener('click', () => { if (totalSeconds > MIN_TIME) { totalSeconds -= TIME_STEP; updateTimerDisplay(); } });
});
