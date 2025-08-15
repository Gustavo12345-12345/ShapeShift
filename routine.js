import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, onSnapshot, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES ---
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
    let rawRoutineText = ''; // Armazena o texto da rotina
    let timerInterval;
    let totalSeconds = 60;

    // --- LÓGICA DO CRONÓMETRO ---
    const openTimerModal = () => { /* ... (código do cronómetro) ... */ };
    // (Toda a lógica do cronómetro permanece a mesma da versão anterior)

    // --- LÓGICA DA ROTINA ---
    const updateStreak = async (user) => { /* ... (código do streak) ... */ };

    const createInteractiveWorkoutView = (dayTitle) => {
        const lines = rawRoutineText.split('\n');
        let exercisesForDay = [];
        let capture = false;
        const helpIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg>`;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const dayMatch = trimmed.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);
            if (dayMatch) {
                const currentTitle = dayMatch[1].replace(/[*:]/g, '').trim();
                capture = (currentTitle === dayTitle);
            } else if (capture && trimmed.startsWith('*')) {
                exercisesForDay.push(trimmed.substring(1).trim());
            }
        }

        let interactiveHtml = '<ul class="exercise-list">';
        exercisesForDay.forEach(exercise => {
            const exerciseName = exercise.match(/^(.*?)(?=\s+\d|séries|rep)/i)?.[1]?.trim() || exercise;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
            interactiveHtml += `
                <li class="exercise-item">
                    <input type="checkbox" class="exercise-checkbox">
                    <label>${exercise}</label>
                    <button class="rest-button">Descansar</button>
                    <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName}'">${helpIconSvg}</a>
                </li>`;
        });
        interactiveHtml += '</ul><div class="form-button-container"><button class="finish-workout-button generate-button" disabled>Finalizar Treino</button></div>';
        return interactiveHtml;
    };

    const handleStartWorkout = (e) => {
        const button = e.target;
        const dayTitle = button.dataset.dayTitle;
        const dayContainer = button.closest('.workout-day');

        const interactiveView = createInteractiveWorkoutView(dayTitle);
        
        // Substitui a lista estática e o botão "Iniciar" pela vista interativa
        const staticList = dayContainer.querySelector('.exercise-list-static');
        const startButtonContainer = dayContainer.querySelector('.form-button-container');
        
        staticList.remove();
        startButtonContainer.remove();

        dayContainer.insertAdjacentHTML('beforeend', interactiveView);

        // Adiciona os event listeners para a nova vista
        const checkboxes = dayContainer.querySelectorAll('.exercise-checkbox');
        const finishButton = dayContainer.querySelector('.finish-workout-button');
        const restButtons = dayContainer.querySelectorAll('.rest-button');

        const checkCompletion = () => {
            const allChecked = [...checkboxes].every(box => box.checked);
            finishButton.disabled = !allChecked;
        };

        checkboxes.forEach(box => box.addEventListener('change', checkCompletion));
        restButtons.forEach(btn => btn.addEventListener('click', openTimerModal));
        finishButton.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (user) {
                finishButton.disabled = true;
                finishButton.textContent = "Guardado!";
                await updateStreak(user);
            }
        });
    };

    onAuthStateChanged(auth, (user) => {
        if (!user) { window.location.href = '/login.html'; return; }
        routineDocRef = doc(db, "users", user.uid, "routine", "active");
        onSnapshot(routineDocRef, (docSnap) => {
            if (docSnap.exists()) {
                rawRoutineText = docSnap.data().rawText;
                const routineHtml = processWorkoutTextToHtml(rawRoutineText);
                routineContent.innerHTML = routineHtml;
                routineContent.querySelectorAll('.start-workout-button').forEach(button => {
                    button.addEventListener('click', handleStartWorkout);
                });
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

    // (O resto do código, como handleDeleteRoutine e os eventos do cronómetro, permanece o mesmo)
});
