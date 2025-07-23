import { doc, setDoc, getDoc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
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
    const generationsCounter = document.getElementById('generations-counter');
    const logoutBtn = document.getElementById('logout-btn');
    const streakCounterNav = document.getElementById('streak-counter-nav');
    const streakCountNav = document.getElementById('streak-count-nav');

    // Variáveis de estado
    let generatedPlanText = null;
    let currentUserData = null;

    // Instâncias do Firebase (inicializadas no HTML)
    const auth = window.auth;
    const db = window.db;

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Verifica se o formulário está preenchido para habilitar o botão de gerar.
     */
    function checkFormValidity() {
        const goal = document.getElementById('goal').value;
        const level = document.getElementById('level').value;
        const days = document.getElementById('days').value;
        const equipment = document.getElementById('equipment').value;

        if (goal && level && days && equipment) {
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            generateBtn.disabled = true;
            generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Atualiza a UI com os dados do utilizador.
     */
    function updateUIAfterLogin() {
        if (!currentUserData) return;

        // Lógica de gerações foi removida para modo de desenvolvimento
        generationsCounter.classList.add('hidden');

        if (currentUserData.streakCount > 0) {
            streakCountNav.textContent = currentUserData.streakCount;
            streakCounterNav.classList.remove('hidden');
        } else {
            streakCounterNav.classList.add('hidden');
        }
        checkFormValidity();
    }

    /**
     * Lida com a geração do plano de treino.
     */
    async function handleGeneratePlan() {
        workoutPlanOutput.classList.add('hidden');
        errorMessageContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.textContent = "A gerar...";

        const age = document.getElementById('age').value;
        const weight = document.getElementById('weight').value;
        const height = document.getElementById('height').value;
        const goal = document.getElementById('goal').value;
        const level = document.getElementById('level').value;
        const days = document.getElementById('days').value;
        const equipment = document.getElementById('equipment').value;
        const notes = document.getElementById('notes').value;
        
        let userProfile = '';
        if (age) userProfile += `Idade: ${age} anos, `;
        if (weight) userProfile += `Peso: ${weight} kg, `;
        if (height) userProfile += `Altura: ${height} cm. `;

        const prompt = `Crie um plano de treino semanal detalhado para um utilizador com as seguintes características: ${userProfile}O objetivo do treino é ${goal}, com um nível de fitness ${level}, para treinar ${days} dias por semana, com o seguinte equipamento disponível: ${equipment}. Observações adicionais: ${notes || 'Nenhuma'}. Formate como texto simples, com cada dia e exercício claramente definidos. Use asteriscos para listas de exercícios. Exemplo: Dia A: Peito e Tríceps * Supino Reto 4x10`;

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
                    const delay = Math.pow(2, attempt) * 1000;
                    await wait(delay);
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
            if (!text) {
                 throw new Error("Resposta inválida da API.");
            }

            generatedPlanText = text;
            workoutPlanContent.innerHTML = processWorkoutTextToHtml(generatedPlanText);
            workoutPlanOutput.classList.remove('hidden');
            
        } catch (error) {
            if (error.message.includes("status 503")) {
                 errorMessageContainer.textContent = "O servidor de IA parece estar sobrecarregado. Por favor, aguarde um minuto e tente novamente.";
            } else {
                 errorMessageContainer.textContent = `Ocorreu um erro: ${error.message}. Por favor, tente novamente.`;
            }
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

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (userSnap) => {
                if (userSnap.exists()) {
                    currentUserData = userSnap.data();
                    updateUIAfterLogin();
                } else {
                    handleLogout();
                }
            });
        } else {
            // Apenas redireciona se não estiver já na página de login
            if (!window.location.pathname.endsWith('login.html')) {
                window.location.href = 'login.html';
            }
        }
    });

    form.addEventListener('change', checkFormValidity);
    generateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleGeneratePlan();
    });
    saveBtn.addEventListener('click', handleSaveRoutine);
    logoutBtn.addEventListener('click', handleLogout);

    checkFormValidity();
});
