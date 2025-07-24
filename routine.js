import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';
// INÍCIO DA ALTERAÇÃO: Importa o banco de dados e a função de normalização
import { exerciseDB, normalizeName } from './exercise-db.js';
// FIM DA ALTERAÇÃO

document.addEventListener('DOMContentLoaded', () => {
    // ... (outras referências de elementos)
    const sessionModal = document.getElementById('session-modal');
    const sessionTitle = document.getElementById('session-exercise-title');
    // INÍCIO DA ALTERAÇÃO: Novas referências de elementos da imagem
    const exerciseImageContainer = document.getElementById('exercise-image-container');
    const sessionExerciseImg = document.getElementById('session-exercise-img');
    const noImageText = document.getElementById('no-image-text');
    // FIM DA ALTERAÇÃO
    const sessionSets = document.getElementById('session-exercise-sets');
    // ... (resto das referências)

    // ... (função startWorkoutSession continua a mesma)

    /**
     * Tenta encontrar uma imagem para o exercício no banco de dados.
     * Usa uma busca "fuzzy" para encontrar correspondências parciais.
     * @param {string} exerciseName - O nome do exercício vindo do plano.
     * @returns {string|null} - A URL da imagem ou null se não encontrada.
     */
    function findImageForExercise(exerciseName) {
        const normalizedName = normalizeName(exerciseName);
        
        // Tenta encontrar a chave mais longa que corresponde ao início do nome normalizado
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
        const nameMatch = exerciseText.match(/^\s*[\*\-\d\.]*\s*(?<name>[^0-9]+)/);
        const setsMatch = exerciseText.match(/(?<sets>\d+)\s*x\s*(?<reps>[\d\-]+)/);
        
        const name = nameMatch ? nameMatch.groups.name.trim() : exerciseText;
        const setsInfo = setsMatch ? `${setsMatch.groups.sets} séries de ${setsMatch.groups.reps} repetições` : '';
        const numSets = setsMatch ? parseInt(setsMatch.groups.sets, 10) : 3;

        sessionTitle.textContent = name;
        sessionSets.textContent = setsInfo;

        // INÍCIO DA ALTERAÇÃO: Lógica para carregar a imagem
        const imageUrl = findImageForExercise(name);
        if (imageUrl) {
            sessionExerciseImg.src = imageUrl;
            sessionExerciseImg.classList.remove('hidden');
            noImageText.classList.add('hidden');
        } else {
            sessionExerciseImg.classList.add('hidden');
            noImageText.classList.remove('hidden');
        }
        // FIM DA ALTERAÇÃO
        
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
    
    // ... (o resto do arquivo routine.js continua o mesmo)
    // startRestTimer, completeWorkout, listeners de botões e onAuthStateChanged
    // não precisam de alterações. Apenas cole o código completo que você já tem
    // a partir daqui, ou use a versão completa abaixo.
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
        }
    });
});
