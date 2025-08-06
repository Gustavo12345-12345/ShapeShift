import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

const helpIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
</svg>
`;

document.addEventListener('DOMContentLoaded', () => {
    const workoutDayTitle = document.getElementById('workout-day-title');
    const exerciseList = document.getElementById('exercise-list');
    const finishWorkoutBtn = document.getElementById('finish-workout-btn');
    const loader = document.getElementById('workout-loader');
    const streakCountEl = document.getElementById('streak-count');
    const timerModal = document.getElementById('timer-modal');
    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start-btn');
    const timerCloseBtn = document.getElementById('timer-close-btn');
    const increaseTimeBtn = document.getElementById('increase-time-btn');
    const decreaseTimeBtn = document.getElementById('decrease-time-btn');
    
    let timerInterval;
    let totalSeconds = 60;
    const TIME_STEP = 30;
    const MIN_TIME = 15;

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(totalSeconds);
        decreaseTimeBtn.disabled = totalSeconds <= MIN_TIME;
    }
    function increaseTime() {
        totalSeconds += TIME_STEP;
        updateTimerDisplay();
    }
    function decreaseTime() {
        if (totalSeconds > MIN_TIME) {
            totalSeconds -= TIME_STEP;
        }
        updateTimerDisplay();
    }
    function startTimer() {
        clearInterval(timerInterval);
        timerStartBtn.disabled = true;
        decreaseTimeBtn.disabled = true;
        increaseTimeBtn.disabled = true;
        timerInterval = setInterval(() => {
            totalSeconds--;
            updateTimerDisplay();
            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+Array(300).join('123')).play();
                closeTimerModal();
            }
        }, 1000);
    }
    function openTimerModal() {
        totalSeconds = 60;
        updateTimerDisplay();
        timerStartBtn.disabled = false;
        increaseTimeBtn.disabled = false;
        timerModal.classList.remove('hidden');
    }
    function closeTimerModal() {
        clearInterval(timerInterval);
        timerModal.classList.add('hidden');
    }
    timerStartBtn.addEventListener('click', startTimer);
    timerCloseBtn.addEventListener('click', closeTimerModal);
    increaseTimeBtn.addEventListener('click', increaseTime);
    decreaseTimeBtn.addEventListener('click', decreaseTime);

    function checkAllExercisesDone() {
        const checkboxes = exerciseList.querySelectorAll('.exercise-checkbox');
        if (checkboxes.length === 0) return;
        const allChecked = [...checkboxes].every(checkbox => checkbox.checked);
        finishWorkoutBtn.disabled = !allChecked;
        finishWorkoutBtn.classList.toggle('opacity-50', !allChecked);
        finishWorkoutBtn.classList.toggle('cursor-not-allowed', !allChecked);
    }

    function renderSelectedWorkout(rawText, workoutId) {
        const decodedWorkoutId = decodeURIComponent(workoutId).trim();
        workoutDayTitle.textContent = decodedWorkoutId;

        const lines = rawText.split('\n');
        let exercisesForSelectedWorkout = [];
        let captureExercises = false;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const dayMatch = trimmedLine.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);

            if (dayMatch) {
                const currentTitle = dayMatch[1].replace(/[:*]/g, '').trim();
                captureExercises = (currentTitle === decodedWorkoutId);
            } else if (captureExercises && trimmedLine.startsWith('*')) {
                exercisesForSelectedWorkout.push(trimmedLine);
            }
        }

        if (exercisesForSelectedWorkout.length > 0) {
            const workoutHtml = exercisesForSelectedWorkout.map(exerciseLine => {
                const fullText = exerciseLine.substring(1).trim();
                let searchLink = '';
                const exerciseMatch = fullText.match(/^(?<name>.+?)(?=\s+\d+x\d+|\s+-\s+\d+|\s+\d+\s+s[eé]ries|\s+\d+\s+rep)/i);
                if (exerciseMatch && exerciseMatch.groups.name) {
                    const exerciseName = exerciseMatch.groups.name.trim();
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
                    searchLink = `<a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName}' no Google">${helpIconSvg}</a>`;
                }
                return `<div class="exercise-item bg-gray-900 bg-opacity-50 p-4 rounded-lg flex items-center justify-between gap-4"><div class="flex items-center flex-grow"><input type="checkbox" class="exercise-checkbox h-6 w-6 rounded text-amber-500 focus:ring-amber-500 border-gray-600 bg-gray-700"><label class="ml-4 text-lg text-gray-200">${fullText}</label>${searchLink}</div><button class="rest-btn bg-amber-500 hover:bg-amber-600 text-black font-bold py-1 px-4 rounded-full text-sm flex-shrink-0">Descansar</button></div>`;
            }).join('');
            exerciseList.innerHTML = workoutHtml;
            exerciseList.querySelectorAll('.rest-btn').forEach(btn => btn.addEventListener('click', openTimerModal));
            exerciseList.querySelectorAll('.exercise-checkbox').forEach(box => box.addEventListener('change', checkAllExercisesDone));
        } else {
            exerciseList.innerHTML = `<p class="text-center text-red-400">Não foi possível encontrar os exercícios para este treino.</p>`;
            finishWorkoutBtn.classList.add('hidden');
        }
    }

    async function updateStreak(user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const today = new Date().toISOString().split('T')[0];
        if (userData.lastWorkoutDate === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const newStreak = (userData.lastWorkoutDate === yesterdayStr) ? (userData.streakCount || 0) + 1 : 1;
        await updateDoc(userRef, { streakCount: newStreak, lastWorkoutDate: today });
    }

    onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('workoutId');

        if (!workoutId) {
            workoutDayTitle.textContent = "Nenhum treino selecionado";
            exerciseList.innerHTML = `<p class="text-center">Por favor, volte e selecione um treino.</p>`;
            finishWorkoutBtn.classList.add('hidden');
            return;
        }

        loader.classList.remove('hidden');
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                streakCountEl.textContent = userSnap.data().streakCount || 0;
            }

            const routineRef = doc(db, "users", user.uid, "routine", "active");
            const routineSnap = await getDoc(routineRef);
            if (routineSnap.exists()) {
                renderSelectedWorkout(routineSnap.data().rawText, workoutId);
            } else {
                workoutDayTitle.textContent = "Nenhuma rotina encontrada!";
                finishWorkoutBtn.classList.add('hidden');
            }
        } catch (error) {
            console.error("Erro ao carregar treino:", error);
            workoutDayTitle.textContent = "Erro ao Carregar";
        } finally {
            loader.classList.add('hidden');
        }
    });

    finishWorkoutBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (user) {
            finishWorkoutBtn.disabled = true;
            finishWorkoutBtn.textContent = "A guardar...";
            await updateStreak(user);
            alert("Parabéns! Treino finalizado e foguinho atualizado!");
            window.location.href = '/minha-rotina.html';
        }
    });
});
