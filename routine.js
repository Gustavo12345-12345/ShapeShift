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
    let rawRoutineText = '';
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

    const openTimerModal = () => {
        clearInterval(timerInterval); // Garante que qualquer timer anterior seja limpo
        totalSeconds = 60;
        updateTimerDisplay();
        timerStartBtn.disabled = false;
        timerStartBtn.textContent = "Iniciar";
        decreaseTimeBtn.disabled = false;
        increaseTimeBtn.disabled = false;
        timerModal.classList.remove('hidden');
    };

    const closeTimerModal = () => {
        clearInterval(timerInterval);
        timerModal.classList.add('hidden');
    };

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
                setTimeout(closeTimerModal, 500);
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
        if (userData.lastWorkoutDate === today) {
            alert("Você já completou um treino hoje! Foguinho mantido!");
            return;
        };

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const newStreak = (userData.lastWorkoutDate === yesterdayStr) ? (userData.streakCount || 0) + 1 : 1;
        await updateDoc(userRef, { streakCount: newStreak, lastWorkoutDate: today });
        alert("Parabéns! Treino finalizado e foguinho atualizado!");
    };

    const createInteractiveWorkoutView = (dayTitle) => {
        const lines = rawRoutineText.split('\n');
        let exercisesForDay = [];
        let capture = false;
        const helpIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg>`;

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

        const exercisesHtml = exercisesForDay.map(exercise => {
            const exerciseName = exercise.match(/^(.*?)(?=\s+\d|séries|rep)/i)?.[1]?.trim() || exercise;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
            return `
                <li class="interactive-exercise-item">
                    <input type="checkbox" class="exercise-checkbox" id="ex-${Math.random()}">
                    <label for="ex-${Math.random()}" class="exercise-label">${exercise}</label>
                    <div class="exercise-actions">
                        <button class="rest-button">Descansar</button>
                        <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName}'">${helpIconSvg}</a>
                    </div>
                </li>`;
        }).join('');

        return `<ul class="interactive-exercise-list">${exercisesHtml}</ul>
                <div class="form-button-container">
                    <button class="finish-workout-button generate-button" disabled>Finalizar Treino</button>
                </div>`;
    };

    const handleStartWorkout = (e) => {
        const button = e.target;
        const dayTitle = button.dataset.dayTitle;
        const dayContainer = button.closest('.workout-day');

        document.querySelectorAll('.start-workout-button').forEach(btn => {
            if(btn !== button) {
                btn.disabled = true;
                btn.textContent = "Outro treino em andamento";
            }
        });

        const interactiveViewHtml = createInteractiveWorkoutView(dayTitle);
        
        const staticList = dayContainer.querySelector('.exercise-list-static');
        const startButtonContainer = dayContainer.querySelector('.form-button-container');
        if(staticList) staticList.remove();
        if(startButtonContainer) startButtonContainer.remove();

        dayContainer.classList.add('workout-day--active');
        dayContainer.insertAdjacentHTML('beforeend', interactiveViewHtml);

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
                window.location.reload(); 
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

        const userRef = doc(db, "users", user.uid);
        onSnapshot(userRef, (userSnap) => {
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const streakCounterNav = document.getElementById('streak-counter-nav');
                const streakCountNav = document.getElementById('streak-count-nav');
                if (streakCounterNav && streakCountNav) {
                    streakCountNav.textContent = userData.streakCount || 0;
                }
            }
        });
    });

    async function handleDeleteRoutine() {
        if (!routineDocRef || !confirm("Tem a certeza de que quer apagar a sua rotina atual?")) return;
        deleteBtn.disabled = true;
        deleteBtn.textContent = "A apagar...";
        try { 
            await deleteDoc(routineDocRef);
        }
        catch (error) { 
            console.error("Erro ao apagar a rotina: ", error); 
            alert("Ocorreu um erro ao apagar a rotina.");
        }
        finally { 
            deleteBtn.disabled = false; 
            deleteBtn.textContent = "Remover Rotina Atual"; 
        }
    }

    if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteRoutine);
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));
    if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
    if (timerCloseBtn) timerCloseBtn.addEventListener('click', closeTimerModal);
    if (increaseTimeBtn) increaseTimeBtn.addEventListener('click', () => { totalSeconds += TIME_STEP; updateTimerDisplay(); });
    if (decreaseTimeBtn) decreaseTimeBtn.addEventListener('click', () => { if (totalSeconds > MIN_TIME) { totalSeconds -= TIME_STEP; updateTimerDisplay(); } });
});
