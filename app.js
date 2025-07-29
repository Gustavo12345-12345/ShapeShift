import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js'; 
import { processWorkoutTextToHtml } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('workout-form');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-routine-btn');
    const workoutPlanOutput = document.getElementById('workout-plan-output');
    const workoutPlanContent = document.getElementById('workout-plan-content');
    const loader = document.getElementById('loader');
    const errorMessageContainer = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');
    const streakCounterNav = document.getElementById('streak-counter-nav');
    const streakCountNav = document.getElementById('streak-count-nav');

    let generatedPlanText = null;

    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        
        const userRef = doc(db, "users", user.uid);
        onSnapshot(userRef, (userSnap) => {
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (streakCounterNav && streakCountNav) {
                    const streakCount = userData.streakCount || 0;
                    // *** LÓGICA CORRIGIDA ***
                    // Remove a classe 'hidden' para garantir que o contador seja sempre visível.
                    streakCounterNav.classList.remove('hidden');
                    streakCountNav.textContent = streakCount;
                }
            }
        });
    });

    async function handleGeneratePlan(e) {
        e.preventDefault();
        workoutPlanOutput.classList.add('hidden');
        errorMessageContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.textContent = "A gerar...";

        const formData = new FormData(form);
        const prompt = `Crie um plano de treino semanal detalhado para um utilizador com as seguintes características: Idade: ${formData.get('age') || 'Não informado'}, Peso: ${formData.get('weight') || 'Não informado'} kg, Altura: ${formData.get('height') || 'Não informado'} cm. O objetivo do treino é ${formData.get('goal')}, com um nível de fitness ${formData.get('level')}, para treinar ${formData.get('days')} dias por semana, com o seguinte equipamento disponível: ${formData.get('equipment')}. Observações adicionais: ${formData.get('notes') || 'Nenhuma'}. Formate como texto simples, com cada dia e exercício claramente definidos. Exemplo: Dia A: Peito e Tríceps * Supino Reto 4x10`;

        try {
            const apiKey = "AIzaSyCeknOilCeptvVH6zL2GF45k1e_R5jXa9k";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("A requisição para a IA demorou demais (timeout).")), 20000));
            const fetchPromise = fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Erro da API ${response.status}: ${errorBody.error.message}`);
            }
            
            const result = await response.json();
            const candidate = result.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;

            if (!candidate || (candidate.finishReason && candidate.finishReason !== "STOP") || !text || text.trim() === "") {
                 throw new Error(`A IA não gerou um treino válido. Motivo: ${candidate?.finishReason || 'Resposta em branco'}.`);
            }

            generatedPlanText = text;
            workoutPlanContent.innerHTML = processWorkoutTextToHtml(text, { showStartButton: false });
            workoutPlanOutput.classList.remove('hidden');
        } catch (error) {
            errorMessageContainer.textContent = `Ocorreu um erro: ${error.message}`;
            errorMessageContainer.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
            generateBtn.textContent = "Gerar Meu Plano";
            generateBtn.disabled = false;
        }
    }

    async function handleSaveRoutine() {
        if (!generatedPlanText || !auth.currentUser) return;
        saveBtn.disabled = true;
        saveBtn.textContent = "A guardar...";
        try {
            const userId = auth.currentUser.uid;
            await setDoc(doc(db, "users", userId, "routine", "active"), { 
                createdAt: new Date().toISOString(), 
                rawText: generatedPlanText 
            });
            window.location.href = '/minha-rotina';
        } catch (error) {
            alert(`Falha ao guardar a rotina: ${error.message}`);
            saveBtn.disabled = false;
            saveBtn.textContent = "Guardar Rotina e Começar";
        }
    }

    if (generateBtn) generateBtn.addEventListener('click', handleGeneratePlan);
    if (saveBtn) saveBtn.addEventListener('click', handleSaveRoutine);
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth).catch(console.error));
});