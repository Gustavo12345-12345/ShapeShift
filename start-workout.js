import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

const helpIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
</svg>
`;

document.addEventListener('DOMContentLoaded', () => {
    const workoutDayTitle = document.getElementById('workout-day-title');
    const exerciseListContainer = document.getElementById('exercise-list');
    const finishWorkoutBtn = document.getElementById('finish-workout-btn');
    const loader = document.getElementById('workout-loader');
    
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
                exercisesForSelectedWorkout.push(trimmedLine.substring(1).trim());
            }
        }

        if (exercisesForSelectedWorkout.length > 0) {
            const workoutHtml = exercisesForSelectedWorkout.map(exerciseLine => {
                const exerciseName = exerciseLine.match(/^(.*?)(?=\s+\d|séries|rep)/i)?.[1]?.trim() || exerciseLine;
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
                
                return `
                <div class="exercise-item">
                    <input type="checkbox" class="exercise-checkbox">
                    <label class="flex-grow">${exerciseLine}</label>
                    <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName}'">${helpIconSvg}</a>
                </div>`;
            }).join('');
            exerciseListContainer.innerHTML = workoutHtml;
        } else {
            exerciseListContainer.innerHTML = `<p class="text-center text-red-400">Não foi possível encontrar os exercícios para este treino.</p>`;
            finishWorkoutBtn.classList.add('hidden');
        }
    }

    async function updateStreak(user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const today = new Date().toISOString().split('T')[0];
        
        // Se já treinou hoje, não faz nada
        if (userData.lastWorkoutDate === today) return;

        // CORREÇÃO: A lógica de reset foi removida. O streak agora apenas incrementa.
        const newStreak = (userData.streakCount || 0) + 1;
        await updateDoc(userRef, { streakCount: newStreak, lastWorkoutDate: today });
    }

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "/login.html";
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const workoutId = urlParams.get('workoutId');

        if (!workoutId) {
            workoutDayTitle.textContent = "Nenhum treino selecionado";
            return;
        }

        loader.classList.remove('hidden');
        try {
            const routineRef = doc(db, "users", user.uid, "routine", "active");
            const routineSnap = await getDoc(routineRef);

            if (routineSnap.exists()) {
                renderSelectedWorkout(routineSnap.data().rawText, workoutId);
            } else {
                workoutDayTitle.textContent = "Nenhuma rotina encontrada!";
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
