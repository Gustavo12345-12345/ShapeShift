import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';
import { exerciseDB, normalizeName } from './exercise-db.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. DECLARAÇÃO DE TODAS AS VARIÁVEIS DE ELEMENTOS
    const routineContentEl = document.getElementById('routine-content');
    const loaderEl = document.getElementById('routine-loader');
    const emptyStateEl = document.getElementById('empty-state');
    
    const sessionModal = document.getElementById('session-modal');
    const sessionTitle = document.getElementById('session-exercise-title');
    const exerciseImageContainer = document.getElementById('exercise-image-container');
    const sessionExerciseImg = document.getElementById('session-exercise-img');
    const noImageText = document.getElementById('no-image-text');
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

    // 2. DEFINIÇÃO DE TODAS AS FUNÇÕES
    function findImageForExercise(exerciseName) {
        const normalizedName = normalizeName(exerciseName);
        let bestMatch = null;
        for (const key in exerciseDB) {
            if (normalizedName.includes(key)) {
                if (!bestMatch || key.length > bestMatch.length) {
                    bestMatch = key;
                }
            }
        }
        return bestMatch ? exerciseDB[bestMatch] : null;
    }

    function showCurrentExercise() {
        const exerciseText = workoutExercises[currentExerciseIndex];

        const exerciseMatch = exerciseText.match(/^(?<name>.+?)(?:\s+(?<sets>\d+)\s*[xX]\s*(?<reps>[\d\-]+))?\s*$/);
        const name = exerciseMatch ? exerciseMatch.groups.name.trim().replace(/^[*\-–\d\.]*\s*/, '') : exerciseText;
        const setsInfo = (exerciseMatch && exerciseMatch.groups.sets) ? `${exerciseMatch.groups.sets} séries de ${exerciseMatch.groups.reps} repetições` : '';
        const numSets = (exerciseMatch && exerciseMatch.groups.sets) ? parseInt(exerciseMatch.groups.sets, 10) : 3;

        sessionTitle.textContent = name;
        sessionSets.textContent = setsInfo;

        // =============================================================
        // INÍCIO DA MUDANÇA: DEPURAÇÃO NA TELA
        // =============================================================
        const imageUrl = findImageForExercise(name);
        
        if (imageUrl) {
            sessionExerciseImg.src = imageUrl;
            sessionExerciseImg.classList.remove('hidden');
            noImageText.classList.add('hidden');
        } else {
            // Se a imagem não for encontrada, mostramos o termo que falhou.
            const normalizedNameToSearch = normalizeName(name);
            sessionExerciseImg.classList.add('hidden');
            noImageText.classList.remove('hidden');
            noImageText.innerHTML = `Imagem não disponível.<br><small class="text-xs text-gray-600">Debug: Termo procurado: '${normalizedNameToSearch}'</small>`;
        }
        // =============================================================
        // FIM DA MUDANÇA
        // =============================================================
        
        setsContainer.innerHTML = '';
        for (let i = 1; i <= numSets; i++) {
            setsContainer.innerHTML += `<label class="flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer"><input type="checkbox" class="set-checkbox h-6 w-6 rounded-md bg-gray-700 text-amber-500"><span class="ml-4 text-lg">Concluir Série ${i}</span></label>`;
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
        if (workoutExercises.length === 0) {
            alert('Não foram encontrados exercícios para este dia. O formato do plano pode ser inválido.');
            return;
        }
        currentExerciseIndex = 0;
        showCurrentExercise();
        if (sessionModal) sessionModal.classList.remove('hidden');
    }

    function startRestTimer(duration) {
        let timer = duration;
        timerDisplay.textContent = timer;
        if(timerModal) timerModal.classList.remove('hidden');
        clearInterval(restTimerInterval);
        restTimerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;
            if (timer <= 0) {
                clearInterval(restTimerInterval);
                if(timerModal) timerModal.classList.add('hidden');
                new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg').play().catch(()=>{});
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
                alert('Sequência atualizada!');
            }
        } catch (error) { console.error("Erro ao atualizar a sequência:", error); }
    }

    // 3. ANEXANDO OS EVENTOS DE CLIQUE AOS BOTÕES
    if (sessionNextBtn) sessionNextBtn.addEventListener('click', () => {
        if (currentExerciseIndex < workoutExercises.length - 1) {
            currentExerciseIndex++;
            showCurrentExercise();
        } else {
            if(sessionModal) sessionModal.classList.add('hidden');
            completeWorkout();
        }
    });
    if (sessionCloseBtn) sessionCloseBtn.addEventListener('click', () => {
        if(sessionModal) sessionModal.classList.add('hidden');
        clearInterval(restTimerInterval);
    });
    if (timerCloseBtn) timerCloseBtn.addEventListener('click', () => {
        if(timerModal) timerModal.classList.add('hidden');
        clearInterval(restTimerInterval);
    });

    // 4. LÓGICA PRINCIPAL QUE EXECUTA QUANDO A PÁGINA CARREGA
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            if(loaderEl) loaderEl.classList.remove('hidden');
            try {
                const routineRef = doc(db, "users", user.uid, "routine", "active");
                const docSnap = await getDoc(routineRef);
                if (docSnap.exists() && docSnap.data().rawText) {
                    routineContentEl.innerHTML = processWorkoutTextToHtml(docSnap.data().rawText, { showStartButton: true });
                    routineContentEl.classList.remove('hidden');
                    document.querySelectorAll('.start-workout-btn').forEach(btn => btn.addEventListener('click', (e) => {
                        const dayGroup = e.target.closest('.day-workout-group');
                        if (dayGroup) startWorkoutSession(dayGroup);
                    }));
                } else {
                    if(emptyStateEl) emptyStateEl.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Erro ao carregar rotina:", error);
            } finally {
                if(loaderEl) loaderEl.classList.add('hidden');
            }
        } else {
            window.location.href = 'login.html';
        }
    });
});
