import { doc, getDoc, updateDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const routineContentEl = document.getElementById('routine-content');
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
    const streakCounterNav = document.getElementById('streak-counter-nav');
    const streakCountNav = document.getElementById('streak-count-nav');
    const logoutBtn = document.getElementById('logout-btn');
    // Referência para o novo botão
    const deleteRoutineBtn = document.getElementById('delete-routine-btn');

    let workoutExercises = [];
    let currentExerciseIndex = 0;
    let restTimerInterval;

    // ... (funções showCurrentExercise, startWorkoutSession, startRestTimer, completeWorkout permanecem iguais)
    function showCurrentExercise() {
        if (currentExerciseIndex >= workoutExercises.length) return;
        const exerciseText = workoutExercises[currentExerciseIndex];
        const match = exerciseText.match(/^(?<name>.+?)(?:\s+(?<sets>\d+)\s*[xX]\s*(?<reps>[\d\-]+))?\s*$/);
        const name = match ? match.groups.name.trim().replace(/^[*\-–\d\.]*\s*/, '') : exerciseText;
        const setsInfo = (match && match.groups.sets) ? `${match.groups.sets}x de ${match.groups.reps}` : 'Séries e reps não especificadas';
        const numSets = (match && match.groups.sets) ? parseInt(match.groups.sets, 10) : 3;

        sessionTitle.textContent = name;
        sessionSets.textContent = setsInfo;
        setsContainer.innerHTML = '';
        for (let i = 1; i <= numSets; i++) {
            setsContainer.innerHTML += `<label class="flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer transition-opacity"><input type="checkbox" class="set-checkbox h-6 w-6 rounded-md bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"><span class="ml-4 text-lg">Concluir Série ${i}</span></label>`;
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

    /**
     * NOVA FUNÇÃO: Lida com a remoção da rotina ativa.
     */
    async function handleDeleteRoutine() {
        const { currentUser } = auth;
        if (!currentUser) return;

        // Idealmente, aqui haveria um modal de confirmação.
        // Para simplificar, vamos remover diretamente.
        
        deleteRoutineBtn.disabled = true;
        
        try {
            const routineRef = doc(db, "users", currentUser.uid, "routine", "active");
            await deleteDoc(routineRef);

            // Atualiza a interface para refletir a remoção
            routineContentEl.classList.add('hidden');
            emptyStateEl.classList.remove('hidden');
            deleteRoutineBtn.classList.add('hidden');
            
        } catch (error) {
            console.error("Erro ao remover a rotina:", error);
            alert(`Falha ao remover a rotina: ${error.message}`);
            deleteRoutineBtn.disabled = false; // Reabilita o botão em caso de erro
        }
    }

    if (sessionNextBtn) sessionNextBtn.addEventListener('click', () => {
        if (currentExerciseIndex < workoutExercises.length - 1) {
            currentExerciseIndex++;
            showCurrentExercise();
        } else {
            sessionModal?.classList.add('hidden');
            completeWorkout();
        }
    });
    if (sessionCloseBtn) sessionCloseBtn.addEventListener('click', () => sessionModal?.classList.add('hidden'));
    if (timerCloseBtn) timerCloseBtn.addEventListener('click', () => {
        clearInterval(restTimerInterval);
        timerModal?.classList.add('hidden');
    });

    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth).catch(console.error));
    // Adiciona o evento de clique ao novo botão
    if (deleteRoutineBtn) deleteRoutineBtn.addEventListener('click', handleDeleteRoutine);

    onAuthStateChanged(auth, (user) => {
        if (!user) { window.location.href = 'login.html'; return; }
        
        const userRef = doc(db, "users", user.uid);
        
        onSnapshot(userRef, (userSnap) => {
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (streakCounterNav && streakCountNav) {
                    const streakCount = userData.streakCount || 0;
                    streakCounterNav.classList.remove('hidden');
                    streakCountNav.textContent = streakCount;
                }
            }
        });

        const routineRef = doc(db, "users", user.uid, "routine", "active");
        getDoc(routineRef).then(docSnap => {
            if (docSnap.exists() && docSnap.data().rawText) {
                routineContentEl.innerHTML = processWorkoutTextToHtml(docSnap.data().rawText, { showStartButton: true });
                routineContentEl.classList.remove('hidden');
                emptyStateEl?.classList.add('hidden');
                // Mostra o botão de remover se a rotina existir
                deleteRoutineBtn.classList.remove('hidden');
                document.querySelectorAll('.start-workout-btn').forEach(btn => btn.addEventListener('click', e => {
                    startWorkoutSession(e.target.closest('.day-workout-group'));
                }));
            } else {
                emptyStateEl?.classList.remove('hidden');
                routineContentEl.classList.add('hidden');
                // Esconde o botão de remover se não houver rotina
                deleteRoutineBtn.classList.add('hidden');
            }
        }).catch(error => {
            console.error("Erro ao carregar a rotina:", error);
            routineContentEl.innerHTML = `<p class="text-red-400 font-bold">Ocorreu um erro ao carregar sua rotina: ${error.message}</p>`;
            routineContentEl.classList.remove('hidden');
        });
    });
});
