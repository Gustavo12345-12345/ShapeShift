import { doc, onSnapshot, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; // Importa do ficheiro centralizado
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos do DOM ---
    // Estas referências são para elementos que SÓ existem em index.html
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

    // Estas referências podem existir noutras páginas
    const logoutBtn = document.getElementById('logout-btn');
    const streakCounterNav = document.getElementById('streak-counter-nav');
    const streakCountNav = document.getElementById('streak-count-nav');

    // Variáveis de estado
    let generatedPlanText = null;
    let currentUserData = null;

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- Funções ---

    function checkFormValidity() {
        // Esta função só deve ser executada se os elementos do formulário existirem
        if (!goalSelect || !levelSelect || !daysSelect || !equipmentSelect) return;

        if (goalSelect.value && levelSelect.value && daysSelect.value && equipmentSelect.value) {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            generateBtn.disabled = true;
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
        if (!form) return; // Segurança extra

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

            let response;
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.status === 503 && attempt < maxRetries) {
                    await wait(Math.pow(2, attempt) * 1000);
                } else {
                    break;
                }
            }

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Status ${response.status}. Detalhes: ${errorBody}`);
            }
            
            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Resposta inválida da API.");

            generatedPlanText = text;
            workoutPlanContent.innerHTML = processWorkoutTextToHtml(generatedPlanText);
            workoutPlanOutput.classList.remove('hidden');
            
        } catch (error) {
            errorMessageContainer.textContent = `Ocorreu um erro: ${error.message}. Por favor, tente novamente.`;
            errorMessageContainer.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
            checkFormValidity();
            generateBtn.textContent = "Gerar Meu Plano";
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
            
            await setDoc(routineRef, {
                createdAt: new Date().toISOString(),
                rawText: generatedPlanText
            });
            window.location.href = 'routine.html';
        } catch (error) {
            console.error("Erro ao guardar a rotina:", error);
            alert(`Falha ao guardar a rotina. Detalhes: ${error.message}`);
            saveBtn.disabled = false;
            saveBtn.textContent = "Guardar Rotina e Começar";
        }
    }

    // --- Lógica de Inicialização ---

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (userSnap) => {
                if (userSnap.exists()) {
                    currentUserData = userSnap.data();
                    updateUIAfterLogin();
                } else {
                    // Se o documento não existe, algo está errado, força o logout.
                    handleLogout();
                }
            });
        }
        // O auth-guard.js já trata o caso de não haver utilizador.
    });

    // CORRIGIDO: Adiciona os listeners APENAS se os elementos existirem na página.
    if (form) {
        form.addEventListener('change', checkFormValidity);
        checkFormValidity(); // Verificação inicial
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
