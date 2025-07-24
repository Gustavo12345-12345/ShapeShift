import { doc, onSnapshot, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos do DOM ---
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

    // Variáveis de estado
    let generatedPlanText = null;
    let currentUserData = null;

    function checkFormValidity() {
        if (!generateBtn || !goalSelect || !levelSelect || !daysSelect || !equipmentSelect) return;
        
        const isFormValid = goalSelect.value && levelSelect.value && daysSelect.value && equipmentSelect.value;
        generateBtn.disabled = !isFormValid;
        
        if (isFormValid) {
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    function updateUIAfterLogin() {
        if (!currentUserData) return;
        
        if (streakCounterNav && streakCountNav) {
            if (currentUserData.streakCount > 0) {
                streakCountNav.textContent = currentUserData.streakCount;
                streakCounterNav.classList.remove('hidden');
            } else {
                streakCounterNav.classList.add('hidden');
            }
        }
        checkFormValidity();
    }

    async function handleGeneratePlan() {
        if (!form) return;
        workoutPlanOutput.classList.add('hidden');
        errorMessageContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.textContent = "A gerar...";

        const prompt = `Crie um plano de treino semanal detalhado para um utilizador com as seguintes características: Idade: ${ageInput.value || 'Não informado'}, Peso: ${weightInput.value || 'Não informado'} kg, Altura: ${heightInput.value || 'Não informado'} cm. O objetivo do treino é ${goalSelect.value}, com um nível de fitness ${levelSelect.value}, para treinar ${daysSelect.value} dias por semana, com o seguinte equipamento disponível: ${equipmentSelect.value}. Observações adicionais: ${notesTextarea.value || 'Nenhuma'}. Formate como texto simples, com cada dia e exercício claramente definidos. Use asteriscos para listas de exercícios. Exemplo: Dia A: Peito e Tríceps * Supino Reto 4x10`;

        try {
            const apiKey = "AIzaSyAEsQXShcDO-IP4C0mLFBevckA6ccoFry4";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Erro de rede ${response.status}. Detalhes: ${JSON.stringify(errorBody.error.message)}`);
            }
            
            const result = await response.json();
            console.log("Resposta completa da API:", result); 

            if (!result.candidates || result.candidates.length === 0) {
                throw new Error("A API retornou uma resposta vazia, sem candidatos.");
            }

            const candidate = result.candidates[0];

            if (candidate.finishReason && candidate.finishReason !== "STOP") {
                throw new Error(`A IA não gerou o treino. Motivo: ${candidate.finishReason}.`);
            }

            const text = candidate?.content?.parts?.[0]?.text;

            // ===================================================================
            // NOVA LINHA DE DIAGNÓSTICO
            console.log("Texto extraído da IA:", text);
            // ===================================================================

            if (!text || text.trim() === "") {
                throw new Error("A IA retornou um texto em branco, embora a chamada tenha sido bem-sucedida.");
            }

            generatedPlanText = text;
            workoutPlanContent.innerHTML = processWorkoutTextToHtml(generatedPlanText);
            workoutPlanOutput.classList.remove('hidden');

        } catch (error) {
            console.error("Falha ao gerar o plano:", error);
            errorMessageContainer.textContent = `Ocorreu um erro: ${error.message}`;
            errorMessageContainer.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
            generateBtn.textContent = "Gerar Meu Plano";
            checkFormValidity();
        }
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    }

    async function handleSaveRoutine() {
        if (!generatedPlanText || !auth.currentUser) {
            alert("Nenhum plano para guardar. Por favor, gere um primeiro.");
            return;
        }
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";

        try {
            const userId = auth.currentUser.uid;
            const routineRef = doc(db, "users", userId, "routine", "active");
            await setDoc(routineRef, { createdAt: new Date().toISOString(), rawText: generatedPlanText });
            window.location.href = 'routine.html';
        } catch (error) {
            console.error("Erro ao guardar a rotina:", error);
            alert(`Falha ao guardar a rotina. Detalhes: ${error.message}`);
            saveBtn.disabled = false;
            saveBtn.textContent = "Guardar Rotina e Começar";
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (userSnap) => {
                if (userSnap.exists()) {
                    currentUserData = userSnap.data();
                    updateUIAfterLogin();
                } else {
                    console.warn("Usuário autenticado, mas documento do Firestore ainda não encontrado. Aguardando...");
                }
            });
        }
    });

    if (form) {
        form.addEventListener('input', checkFormValidity);
        checkFormValidity();
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleGeneratePlan();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveRoutine);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});
