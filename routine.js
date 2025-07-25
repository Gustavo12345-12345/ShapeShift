import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referências (note que a ref para loaderEl não é mais necessária, mas podemos manter)
    const routineContentEl = document.getElementById('routine-content');
    const loaderEl = document.getElementById('routine-loader');
    const emptyStateEl = document.getElementById('empty-state');
    const sessionModal = document.getElementById('session-modal');
    // ...outras referências...

    // A lógica de treino permanece a mesma
    let workoutExercises = [];
    let currentExerciseIndex = 0;
    // ... (funções showCurrentExercise, startWorkoutSession, etc.)

    // LÓGICA PRINCIPAL DE CARREGAMENTO (MODIFICADA)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // A LINHA QUE MOSTRAVA O LOADER FOI REMOVIDA
            try {
                const routineRef = doc(db, "users", user.uid, "routine", "active");
                const docSnap = await getDoc(routineRef); // A busca ainda acontece

                if (docSnap.exists() && docSnap.data().rawText) {
                    routineContentEl.innerHTML = processWorkoutTextToHtml(docSnap.data().rawText, { showStartButton: true });
                    routineContentEl.classList.remove('hidden');
                    
                    document.querySelectorAll('.start-workout-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const dayGroup = e.target.closest('.day-workout-group');
                            if (typeof startWorkoutSession === 'function') {
                                if (dayGroup) startWorkoutSession(dayGroup);
                            }
                        });
                    });
                } else {
                    if(emptyStateEl) emptyStateEl.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Erro ao carregar rotina:", error);
                routineContentEl.innerHTML = `<p class="text-red-400 font-bold">Ocorreu um erro ao carregar sua rotina: ${error.message}</p>`;
                routineContentEl.classList.remove('hidden');
            }
            // A LINHA NO "finally" QUE ESCONDIA O LOADER FOI REMOVIDA
        } else {
            window.location.href = 'login.html';
        }
    });

    // =========================================================================
    // COLE AQUI O RESTO DAS SUAS FUNÇÕES DE TREINO (showCurrentExercise, etc.)
    // Elas não mudam, apenas a lógica de carregamento acima.
    // =========================================================================
    
    // Funções de Treino (sem alterações)
    let restTimerInterval;
    function showCurrentExercise() {
        const exerciseText = workoutExercises[currentExerciseIndex];
        const exerciseMatch = exerciseText.match(/^(?<name>.+?)(?:\s+(?<sets>\d+)\s*[xX]\s*(?<reps>[\d\-]+))?\s*$/);
        const name = exerciseMatch ? exerciseMatch.groups.name.trim().replace(/^[*\-–\d\.]*\s*/, '') : exerciseText;
        const setsInfo = (exerciseMatch && exerciseMatch.groups.sets) ? `${exerciseMatch.groups.sets}s de ${exerciseMatch.groups.reps}` : '';
        const numSets = (exerciseMatch && exerciseMatch.groups.sets) ? parseInt(exerciseMatch.groups.sets, 10) : 3;
        const sessionTitle = document.getElementById('session-exercise-title');
        const sessionSets = document.getElementById('session-exercise-sets');
        const setsContainer = document.getElementById('sets-container');
        const sessionNextBtn = document.getElementById('session-next-btn');
        sessionTitle.textContent = name;
        sessionSets.textContent = setsInfo;
        setsContainer.innerHTML = '';
        for (let i = 1; i <= numSets; i++) {
            setsContainer.innerHTML += `<label class="flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer"><input type="checkbox" class="set-checkbox h-6 w-6 rounded-md"><span class="ml-4 text-lg">Concluir Série ${i}</span></label>`;
        }
        setsContainer.querySelectorAll('.set-checkbox').forEach(cb => cb.addEventListener('change', e => {
            if (e.target.checked) {
                e.target.disabled = true;
                e.target.parentElement.classList.add('opacity-50');
                startRestTimer(60);
            }
        }));
        sessionNextBtn.textContent = currentExerciseIndex >= workoutExercises.length - 1 ? 'Concluir Treino' : 'Próximo Exercício';
    }
    function startWorkoutSession(dayGroupElement) {
       workoutExercises = Array.from(dayGroupElement.querySelectorAll('.exercise-text')).map(el => el.textContent);
       if (workoutExercises.length === 0) { alert('Não foram encontrados exercícios para este dia.'); return; }
       currentExerciseIndex = 0;
       showCurrentExercise();
       sessionModal?.classList.remove('hidden');
    }
    function startRestTimer(duration) {
        const timerModal = document.getElementById('timer-modal');
        const timerDisplay = document.getElementById('timer-display');
        let timer = duration;
        timerDisplay.textContent = timer;
        timerModal?.classList.remove('hidden');
        clearInterval(restTimerInterval);
        restTimerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;
            if (timer <= 0) {
                clearInterval(restTimerInterval);
                timerModal?.classList.add('hidden');
                new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg').play().catch(()=>{});
            }
        }, 1000);
    }
    async function completeWorkout() {
        const { currentUser } = auth;
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) return;
            const userData = userDoc.data();
            const lastWorkoutDate = userData.lastWorkoutDate ? new Date(userData.lastWorkoutDate) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (lastWorkoutDate) lastWorkoutDate.setHours(0, 0, 0, 0);
            if (!lastWorkoutDate || lastWorkoutDate.getTime() !== today.getTime()) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const newStreak = (lastWorkoutDate && lastWorkoutDate.getTime() === yesterday.getTime()) ? (userData.streakCount || 0) + 1 : 1;
                await updateDoc(userRef, { lastWorkoutDate: new Date().toISOString(), streakCount: newStreak });
                alert('Sequência atualizada!');
            }
        } catch (error) { console.error("Erro ao atualizar a sequência:", error); }
    }
    const sessionNextBtn = document.getElementById('session-next-btn');
    const sessionCloseBtn = document.getElementById('session-close-btn');
    const timerCloseBtn = document.getElementById('timer-close-btn');
    if (sessionNextBtn) sessionNextBtn.addEventListener('click', () => {
        if (currentExerciseIndex < workoutExercises.length - 1) {
            currentExerciseIndex++;
            showCurrentExercise();
        } else {
            sessionModal?.classList.add('hidden');
            completeWorkout();
        }
    });
    if (sessionCloseBtn) sessionCloseBtn.addEventListener('click', () => {
        sessionModal?.classList.add('hidden');
        clearInterval(restTimerInterval);
    });
    if (timerCloseBtn) timerCloseBtn.addEventListener('click', () => {
        timerModal?.classList.add('hidden');
        clearInterval(restTimerInterval);
    });
});
