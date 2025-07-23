import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const auth = getAuth();
const db = window.db;

/**
 * Analisa o texto da rotina e renderiza cartões de escolha para cada dia de treino.
 * @param {string} rawText - O texto completo da rotina guardado no Firestore.
 */
function renderWorkoutChoices(rawText) {
    const container = document.getElementById('workout-choices-container');
    const lines = rawText.split('\n');
    const workoutBlocks = [];
    let currentBlock = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const dayMatch = trimmedLine.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);

        if (dayMatch) {
            if (currentBlock) {
                workoutBlocks.push(currentBlock);
            }
            // Inicia um novo bloco de treino, limpando o título de forma consistente.
            currentBlock = {
                title: dayMatch[1].replace(/[:*]/g, '').trim(),
                exercises: []
            };
        } else if (currentBlock && trimmedLine.startsWith('*')) {
            currentBlock.exercises.push(trimmedLine);
        }
    }
    if (currentBlock && currentBlock.exercises.length > 0) {
        workoutBlocks.push(currentBlock);
    }

    if (workoutBlocks.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400">Não foram encontrados treinos válidos na sua rotina. Tente gerar e guardar uma nova.</p>';
        return;
    }

    const html = workoutBlocks.map(block => {
        const cleanTitle = block.title.trim();
        console.log(`A criar link com o título: "'${cleanTitle}'"`); // Log de diagnóstico
        const workoutId = encodeURIComponent(cleanTitle);
        return `
            <a href="start-workout.html?workoutId=${workoutId}" class="workout-choice-card">
                <div class="flex-grow">
                    <span class="font-bold text-lg text-amber-400">${block.title}</span>
                    <span class="block text-sm text-gray-300 mt-1">${block.exercises.length} exercícios</span>
                </div>
                <span class="text-2xl arrow-icon">&rarr;</span>
            </a>
        `;
    }).join('');

    container.innerHTML = `<div class="space-y-4">${html}</div>`;
}

/**
 * Função principal que carrega a rotina do utilizador.
 */
async function showRoutine() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const loader = document.getElementById('routine-loader');
        const emptyState = document.getElementById('empty-state');
        const choicesContainer = document.getElementById('workout-choices-container');
        
        loader.classList.remove('hidden');
        emptyState.classList.add('hidden');
        choicesContainer.innerHTML = '';

        try {
            const routineRef = doc(db, "users", user.uid, "routine", "active");
            const routineSnap = await getDoc(routineRef);

            if (routineSnap.exists() && routineSnap.data().rawText) {
                renderWorkoutChoices(routineSnap.data().rawText);
            } else {
                emptyState.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Erro ao carregar rotina:", error);
            choicesContainer.innerHTML = `<p class="text-center text-red-400">Ocorreu um erro ao carregar a sua rotina.</p>`;
        } finally {
            loader.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', showRoutine);
