import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const form = document.getElementById('workout-form');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-routine-btn');
    const workoutPlanOutput = document.getElementById('workout-plan-output');
    const workoutPlanContent = document.getElementById('workout-plan-content');
    const loader = document.getElementById('loader');
    const errorMessageContainer = document.getElementById('error-message');
    const ageInput = document.getElementById('age');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const goalSelect = document.getElementById('goal');
    const levelSelect = document.getElementById('level');
    const daysSelect = document.getElementById('days');
    const equipmentSelect = document.getElementById('equipment');
    const notesTextarea = document.getElementById('notes');
    const logoutBtn = document.getElementById('logout-btn');
    const streakCounterNav = document.getElementById('streak-counter-nav');
    const streakCountNav = document.getElementById('streak-count-nav');

    let generatedPlanText = null;

    function checkFormValidity() {
        if (!generateBtn) return;
        const isFormValid = goalSelect.value && levelSelect.value && daysSelect.value && equipmentSelect.value;
        generateBtn.disabled = !isFormValid;
        generateBtn.classList.toggle('opacity-50', !isFormValid);
        generateBtn.classList.toggle('cursor-not-allowed', !isFormValid);
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (userSnap) => {
                if (userSnap.exists()) {
                    const currentUserData = userSnap.data();
                    if (streakCounterNav && streakCountNav) {
                        streakCounterNav.classList.toggle('hidden', !(currentUserData.streakCount > 0));
                        streakCountNav.textContent = currentUserData.streakCount || 0;
                    }
                }
            });
        }
    });

    async function handleGeneratePlan() {
        workoutPlanOutput.classList.add('hidden');
        errorMessageContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.textContent = "A gerar...";

        const prompt = `Crie um plano de treino semanal detalhado para um utilizador com as seguintes características: Idade: ${ageInput.value || 'Não informado'}, Peso: ${weightInput.value || 'Não informado'} kg, Altura: ${heightInput.value || 'Não informado'} cm. O objetivo do treino é ${goalSelect.value}, com um nível de fitness ${levelSelect.value}, para treinar ${daysSelect.value} dias por semana, com o seguinte equipamento disponível: ${equipmentSelect.value}. Observações adicionais: ${notesTextarea.value || 'Nenhuma'}. Formate como texto simples, com cada dia e exercício claramente definidos. Exemplo: Dia A: Peito e Tríceps * Supino Reto 4x10`;

        try {
            // =======================================================================
            // !!!!   CRÍTICO: COLE A NOVA CHAVE QUE VOCÊ GEROU NO AI STUDIO AQUI   !!!!
            const apiKey = "COLE_SUA_NOVA_CHAVE_DA_IA_AQUI";
            // =======================================================================
            
            if (apiKey.includes("COLE_SUA_NOVA_CHAVE")) {
                throw new Error("A chave de API do Google AI não foi configurada no arquivo app.js.");
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("A requisição para a IA demorou demais (timeout).")), 15000)
            );

            const fetchPromise = fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Erro da API ${response.status}: ${errorBody.error.message}`);
            }
            
            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (!candidate || (candidate.finishReason && candidate.finishReason !== "STOP")) {
                 throw new Error(`A IA não gerou o treino. Motivo: ${candidate?.finishReason || 'Desconhecido'}.`);
            }

            const text = candidate.content?.parts?.[0]?.text;
            if (!text || text.trim() === "") throw new Error("A IA retornou um texto em branco.");

            generatedPlanText = text;
            workoutPlanContent.innerHTML = processWorkoutTextToHtml(text, { showStartButton: false });
            workoutPlanOutput.classList.remove('hidden');

        } catch (error) {
            errorMessageContainer.textContent = `Ocorreu um erro: ${error.message}`;
            errorMessageContainer.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
            generateBtn.textContent = "Gerar Meu Plano";
            checkFormValidity();
        }
    }

    async function handleSaveRoutine() {
        if (!generatedPlanText || !auth.currentUser) return;
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
        try {
            const userId = auth.currentUser.uid;
            const routineRef = doc(db, "users", userId, "routine", "active");
            await setDoc(routineRef, { createdAt: new Date().toISOString(), rawText: generatedPlanText });
            window.location.href = 'routine.html';
        } catch (error) {
            alert(`Falha ao guardar a rotina: ${error.message}`);
            saveBtn.disabled = false;
            saveBtn.textContent = "Guardar Rotina e Começar";
        }
    }

    if (form) form.addEventListener('input', checkFormValidity);
    if (generateBtn) generateBtn.addEventListener('click', (e) => { e.preventDefault(); handleGeneratePlan(); });
    if (saveBtn) saveBtn.addEventListener('click', handleSaveRoutine);
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth).catch(err => console.error(err)));
    
    checkFormValidity();
});
