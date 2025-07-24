// Lógica da página routine.html: carrega a rotina salva e gerencia a sessão de treino interativa.
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const routineContentEl = document.getElementById('routine-content');
    const loaderEl = document.getElementById('routine-loader');
    const emptyStateEl = document.getElementById('empty-state');
    
    const sessionModal = document.getElementById('session-modal');
    const sessionTitle = document.getElementById('session-exercise-title');
    const sessionSets = document.getElementById('session-exercise-sets');
    const setsContainer = document.getElementById('sets-container');
    const sessionNextBtn = document.getElementById('session-next-btn');
    const sessionCloseBtn = document.getElementById('session-close-btn');

    const timerModal = document.getElementById('timer-modal');
    const timerDisplay = document.getElementById('timer-display');
    const timerCloseBtn = document.getElementById('timer-close-btn');

    let workoutExercises = [];
    let currentExerciseIndex = 0;
    let restTimerInterval;

    function startWorkoutSession(dayGroupElement) {
        workoutExercises = Array.from(dayGroupElement.querySelectorAll('.exercise-text')).map(el => el.textContent);
        if (workoutExercises.length === 0) {
            alert('Não foram encontrados exercícios para este dia.');
            return;
        }
        currentExerciseIndex = 0;
        showCurrentExercise();
        sessionModal.classList.remove('hidden');
    }

    function showCurrentExercise() {
        const exerciseText = workoutExercises[currentExerciseIndex];
        const nameMatch = exerciseText.match(/^\s*[\*\-\d\.]*\s*(?<name>[^0-9]+)/);
        const setsMatch = exerciseText.match(/(?<sets>\d+)\s*x\s*(?<reps>[\d\-]+)/);
        
        const name = nameMatch ? nameMatch.groups.name.trim() : 'Exercício';
        const setsInfo = setsMatch ? `${setsMatch.groups.sets} séries de ${setsMatch.groups.reps} repetições` : '';
        const numSets = setsMatch ? parseInt(setsMatch.groups.sets, 10) : 3; // Padrão de 3 séries

        sessionTitle.textContent = name;
        sessionSets.textContent = setsInfo;
        
        setsContainer.innerHTML = '';
        for (let i = 1; i <= numSets; i++) {
            const setHtml = `<label class="flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer transition-opacity"><input type="checkbox" class="set-checkbox h-6 w-6 rounded-md bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"><span class="ml-4 text-lg">Concluir Série ${i}</span></label>`;
            setsContainer.innerHTML += setHtml;
        }

        document.querySelectorAll('.set-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    e.target.disabled = true;
                    e.target.parentElement.classList.add('opacity-50');
                    startRestTimer(60);
                }
            });
        });

        if (currentExerciseIndex >= workoutExercises.length - 1) {
            sessionNextBtn.textContent = (window.getTranslation && window.getTranslation('workoutCompleteTitle')) || 'Concluir Treino';
        } else {
            sessionNextBtn.textContent = (window.getTranslation && window.getTranslation('nextExerciseBtn')) || 'Próximo Exercício';
        }
    }
    
    function startRestTimer(duration) {
        let timer = duration;
        timerDisplay.textContent = timer;
        timerModal.classList.remove('hidden');
        clearInterval(restTimerInterval);
        restTimerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;
            if (timer <= 0) {
                clearInterval(restTimerInterval);
                timerModal.classList.add('hidden');
                new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg').play().catch(e => console.error("Erro ao tocar som:", e));
            }
        }, 1000);
    }
    
    async function completeWorkout() {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) return;
            const userData = userDoc.data();
            const lastWorkoutDate = userData.lastWorkoutDate ? new Date(userData.lastWorkoutDate) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if(lastWorkoutDate) lastWorkoutDate.setHours(0, 0, 0, 0);
            if (!lastWorkoutDate || lastWorkoutDate.getTime() !== today.getTime()) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const newStreak = (lastWorkoutDate && lastWorkoutDate.getTime() === yesterday.getTime()) ? (userData.streakCount || 0) + 1 : 1;
                await updateDoc(userRef, {
                    lastWorkoutDate: new Date().toISOString(),
                    streakCount: newStreak
                });
                alert((window.getTranslation && window.getTranslation('updateStreakMsg')) || 'Sequência atualizada!');
            }
        } catch (error) {
            console.error("Erro ao atualizar a sequência de treino:", error);
        }
    }

    if (sessionNextBtn) sessionNextBtn.addEventListener('click', () => {
        if (currentExerciseIndex < workoutExercises.length - 1) {
            currentExerciseIndex++;
            showCurrentExercise();
        } else {
            sessionModal.classList.add('hidden');
            completeWorkout();
        }
    });
    if (sessionCloseBtn) sessionCloseBtn.addEventListener('click', () => {
        sessionModal.classList.add('hidden');
        clearInterval(restTimerInterval);
    });
    if (timerCloseBtn) timerCloseBtn.addEventListener('click', () => {
        clearInterval(restTimerInterval);
        timerModal.classList.add('hidden');
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const routineRef = doc(db, "users", user.uid, "routine", "active");
                const docSnap = await getDoc(routineRef);
                if (docSnap.exists() && docSnap.data().rawText) {
                    const rawText = docSnap.data().rawText;
                    routineContentEl.innerHTML = processWorkoutTextToHtml(rawText, { showStartButton: true });
                    routineContentEl.classList.remove('hidden');
                    document.querySelectorAll('.start-workout-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const dayGroup = e.target.closest('.day-workout-group');
                            if (dayGroup) startWorkoutSession(dayGroup);
                        });
                    });
                } else {
                    emptyStateEl.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Erro ao carregar rotina:", error);
            } finally {
                if (loaderEl) loaderEl.classList.add('hidden');
            }
        } else {
            window.location.href = 'login.html';
        }
    });
});
