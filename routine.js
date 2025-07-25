import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referências a todos os elementos do DOM necessários
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

    // Variáveis de estado para a sessão de treino
    let workoutExercises = [];
    let currentExerciseIndex = 0;
    let restTimerInterval;

    // Função que exibe o exercício atual no pop-up de treino
    function showCurrentExercise() {
        const exerciseText = workoutExercises[currentExerciseIndex];
        const exerciseMatch = exerciseText.match(/^(?<name>.+?)(?:\s+(?<sets>\d+)\s*[xX]\s*(?<reps>[\d\-]+))?\s*$/);
        
        const name = exerciseMatch ? exerciseMatch.groups.name.trim().replace(/^[*\-–\d\.]*\s*/, '') : exerciseText;
        const setsInfo = (exerciseMatch && exerciseMatch.groups.sets) ? `${exerciseMatch.groups.sets} séries de ${exerciseMatch.groups.reps} repetições` : '';
        const numSets = (exerciseMatch && exerciseMatch.groups.sets) ? parseInt(exerciseMatch.groups.sets, 10) : 3;

        sessionTitle.textContent = name;
        sessionSets.textContent = setsInfo;
        
        setsContainer.innerHTML = '';
        for (let i = 1; i <= numSets; i++) {
            setsContainer.innerHTML += `<label class="flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer"><input type="checkbox" class="set-checkbox h-6 w-6 rounded-md bg-gray-700 border-gray-600 text-amber-500"><span class="ml-4 text-lg">Concluir Série ${i}</span></label>`;
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
    
    // Função que inicia a sessão de treino
    function startWorkoutSession(dayGroupElement) {
        workoutExercises = Array.from(dayGroupElement.querySelectorAll('.exercise-text')).map(el => el.textContent);
        if (workoutExercises.length === 0) {
            alert('Não foram encontrados exercícios para este dia.');
            return;
        }
        currentExerciseIndex = 0;
        showCurrentExercise();
        if (sessionModal) sessionModal.classList.remove('hidden');
    }

    // Função que gerencia o timer de descanso
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
    
    // Função que atualiza a sequência (streak) ao completar um treino
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
        } catch (error) { 
            console.error("Erro ao atualizar a sequência:", error); 
        }
    }

    // Adiciona os listeners de clique aos botões do pop-up
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

    // LÓGICA PRINCIPAL DE CARREGAMENTO DA PÁGINA COM TIMEOUT
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário autenticado. Iniciando carregamento da rotina...");
            
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("O carregamento demorou demais (timeout). Verifique suas Regras do Firestore e a conexão.")), 10000)
            );

            try {
                console.log("Tentando buscar documento no Firestore...");
                const routineRef = doc(db, "users", user.uid, "routine", "active");
                const getDocPromise = getDoc(routineRef);

                const docSnap = await Promise.race([getDocPromise, timeoutPromise]);
                
                console.log("Busca no Firestore concluída.");

                if (docSnap.exists() && docSnap.data().rawText) {
                    console.log("Documento encontrado. Renderizando rotina.");
                    routineContentEl.innerHTML = processWorkoutTextToHtml(docSnap.data().rawText, { showStartButton: true });
                    routineContentEl.classList.remove('hidden');
                    
                    document.querySelectorAll('.start-workout-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const dayGroup = e.target.closest('.day-workout-group');
                            if (dayGroup) startWorkoutSession(dayGroup);
                        });
                    });

                } else {
                    console.log("Nenhum documento de rotina encontrado.");
                    if(emptyStateEl) emptyStateEl.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Erro final ao carregar rotina:", error);
                routineContentEl.innerHTML = `<p class="text-red-400 font-bold">Ocorreu um erro ao carregar sua rotina: ${error.message}</p>`;
                routineContentEl.classList.remove('hidden');
            } finally {
                console.log("Escondendo o loader.");
                if(loaderEl) loaderEl.classList.add('hidden');
            }
        } else {
            window.location.href = 'login.html';
        }
    });
});
