import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos Elementos da Página
    const routineContentEl = document.getElementById('routine-content');
    const loaderEl = document.getElementById('routine-loader');
    const emptyStateEl = document.getElementById('empty-state');
    
    // Referências ao Modal da Sessão
    const sessionModal = document.getElementById('session-modal');
    const sessionTitle = document.getElementById('session-exercise-title');
    const sessionSets = document.getElementById('session-exercise-sets');
    const setsContainer = document.getElementById('sets-container');
    const sessionNextBtn = document.getElementById('session-next-btn');
    const sessionCloseBtn = document.getElementById('session-close-btn');

    // Referências ao Modal do Timer
    const timerModal = document.getElementById('timer-modal');
    const timerDisplay = document.getElementById('timer-display');
    const timerCloseBtn = document.getElementById('timer-close-btn');

    // Variáveis de Estado da Sessão de Treino
    let workoutExercises = [];
    let currentExerciseIndex = 0;
    let restTimerInterval;

    /**
     * Inicia a sessão de treino para um grupo de exercícios de um dia específico.
     * @param {HTMLElement} dayGroupElement - O elemento div que contém os exercícios do dia.
     */
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

    /**
     * Exibe o exercício atual no modal da sessão, gerando os checkboxes para as séries.
     */
    function showCurrentExercise() {
        const exerciseText = workoutExercises[currentExerciseIndex];
        const nameMatch = exerciseText.match(/^\s*[\*\-\d\.]+\s*(?<name>[^0-9]+)/);
        const setsMatch = exerciseText.match(/(?<sets>\d+)\s*x\s*(?<reps>[\d\-]+)/);
        
        const name = nameMatch ? nameMatch.groups.name.trim() : 'Exercício';
        const setsInfo = setsMatch ? `${setsMatch.groups.sets} séries de ${setsMatch.groups.reps} repetições` : 'Verifique as séries e repetições';
        const numSets = setsMatch ? parseInt(setsMatch.groups.sets, 10) : 0;

        sessionTitle.textContent = name;
        sessionSets.textContent = setsInfo;
        
        // Gera os checkboxes para cada série
        setsContainer.innerHTML = '';
        for (let i = 1; i <= numSets; i++) {
            const setHtml = `
                <label class="flex items-center bg-gray-800 p-3 rounded-lg cursor-pointer transition-opacity">
                    <input type="checkbox" class="set-checkbox h-6 w-6 rounded-md bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500">
                    <span class="ml-4 text-lg">Concluir Série ${i}</span>
                </label>`;
            setsContainer.innerHTML += setHtml;
        }

        // Adiciona o listener para o timer de descanso ao marcar uma série
        document.querySelectorAll('.set-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    e.target.disabled = true;
                    e.target.parentElement.classList.add('opacity-50');
                    startRestTimer(60); // Inicia descanso de 60 segundos
                }
            });
        });

        // Atualiza o texto do botão principal do modal
        if (currentExerciseIndex >= workoutExercises.length - 1) {
            sessionNextBtn.textContent = window.getTranslation('workoutCompleteTitle') || 'Concluir Treino';
        } else {
            sessionNextBtn.textContent = window.getTranslation('nextExerciseBtn') || 'Próximo Exercício';
        }
    }
    
    /**
     * Inicia o timer de descanso e exibe o modal correspondente.
     * @param {number} duration - A duração do descanso em segundos.
     */
    function startRestTimer(duration) {
        let timer = duration;
        timerDisplay.textContent = timer;
        timerModal.classList.remove('hidden');

        // Limpa qualquer timer anterior para evitar múltiplos intervalos
        clearInterval(restTimerInterval);

        restTimerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = timer;
            if (timer <= 0) {
                clearInterval(restTimerInterval);
                timerModal.classList.add('hidden');
                // Opcional: Toca um som para notificar o fim do descanso
                new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg').play().catch(e => console.error("Erro ao tocar som:", e));
            }
        }, 1000);
    }
    
    /**
     * Finaliza o treino, atualiza a data do último treino e a sequência (streak) no Firestore.
     */
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
            
            // Zera horas, minutos, segundos e milissegundos para comparar apenas as datas
            today.setHours(0, 0, 0, 0);
            if(lastWorkoutDate) lastWorkoutDate.setHours(0, 0, 0, 0);

            let newStreak = userData.streakCount || 0;
            
            // Só processa a lógica de streak se o último treino não foi hoje
            if (!lastWorkoutDate || lastWorkoutDate.getTime() !== today.getTime()) {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                // Se o último treino foi ontem, incrementa a sequência. Senão, reseta para 1.
                if(lastWorkoutDate && lastWorkoutDate.getTime() === yesterday.getTime()) {
                    newStreak++;
                } else {
                    newStreak = 1;
                }

                await updateDoc(userRef, {
                    lastWorkoutDate: new Date().toISOString(),
                    streakCount: newStreak // ou increment(1) se a lógica for apenas incrementar
                });
                alert(window.getTranslation('updateStreakMsg'));
            } else {
                 console.log("Treino já registrado hoje. Sequência não atualizada.");
            }
        } catch (error) {
            console.error("Erro ao atualizar a sequência de treino:", error);
            alert("Ocorreu um erro ao salvar seu progresso.");
        }
    }

    // --- Listeners de Eventos dos Modais ---

    sessionNextBtn.addEventListener('click', () => {
        if (currentExerciseIndex < workoutExercises.length - 1) {
            currentExerciseIndex++;
            showCurrentExercise();
        } else {
            sessionModal.classList.add('hidden');
            completeWorkout();
        }
    });

    sessionCloseBtn.addEventListener('click', () => {
        sessionModal.classList.add('hidden');
        clearInterval(restTimerInterval);
    });

    timerCloseBtn.addEventListener('click', () => {
        clearInterval(restTimerInterval);
        timerModal.classList.add('hidden');
    });

    // --- LÓGICA PRINCIPAL DE CARREGAMENTO DA PÁGINA ---

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const routineRef = doc(db, "users", user.uid, "routine", "active");
                const docSnap = await getDoc(routineRef);

                if (docSnap.exists() && docSnap.data().rawText) {
                    const rawText = docSnap.data().rawText;
                    routineContentEl.innerHTML = processWorkoutTextToHtml(rawText);
                    routineContentEl.classList.remove('hidden');
                    
                    // Adiciona listeners aos botões "Iniciar Treino" após serem renderizados
                    document.querySelectorAll('.start-workout-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const dayGroup = e.target.closest('.day-workout-group');
                            startWorkoutSession(dayGroup);
                        });
                    });
                } else {
                    emptyStateEl.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Erro ao carregar rotina:", error);
                routineContentEl.innerHTML = `<p class="text-red-400">Ocorreu um erro ao carregar sua rotina. Tente novamente mais tarde.</p>`;
                routineContentEl.classList.remove('hidden');
            } finally {
                loaderEl.classList.add('hidden');
            }
        } else {
            window.location.href = 'login.html';
        }
    });
});
