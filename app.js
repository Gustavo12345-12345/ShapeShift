import { doc, onSnapshot, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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

    let generatedPlanText = null;
    let currentUserData = null;

    // Observa o estado do usuário para obter os dados do plano
    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        
        const userRef = doc(db, "users", user.uid);
        onSnapshot(userRef, (userSnap) => {
            if (userSnap.exists()) {
                currentUserData = userSnap.data();
            }
        });
    });

    async function handleGeneratePlan(e) {
        e.preventDefault();

        if (!currentUserData) {
            errorMessageContainer.textContent = "Não foi possível verificar os seus dados. Tente novamente.";
            errorMessageContainer.classList.remove('hidden');
            return;
        }

        // Lógica do Paywall
        if (currentUserData.plan === 'free' && currentUserData.generationCount >= 1) {
            errorMessageContainer.innerHTML = `Você já usou a sua geração gratuita. <a href="/planos.html" class="font-bold text-amber-400 hover:underline">Faça um upgrade para o plano Pro</a> para ter gerações ilimitadas.`;
            errorMessageContainer.classList.remove('hidden');
            return;
        }

        workoutPlanOutput.classList.add('hidden');
        errorMessageContainer.classList.add('hidden');
        loader.classList.remove('hidden');
        generateBtn.disabled = true;
        generateBtn.textContent = "A gerar...";

        const formData = new FormData(form);
        const prompt = `Crie um plano de treino semanal detalhado para um utilizador com as seguintes características:
- Idade: ${formData.get('age') || 'Não informado'}
- Peso: ${formData.get('weight') || 'Não informado'} kg
- Altura: ${formData.get('height') || 'Não informado'} cm
- Objetivo Principal: ${formData.get('goal')}
- Nível de Fitness: ${formData.get('level')}
- Frequência de Treino Desejada: ${formData.get('training_frequency')}
- Divisão do Treino (em fichas): ${formData.get('days')}
- Equipamento Disponível: ${formData.get('equipment')}
- Observações Adicionais: ${formData.get('notes') || 'Nenhuma'}

Instruções de Formato: Formate a resposta como texto simples, com cada dia e exercício claramente definidos. Exemplo: Dia A: Peito e Tríceps * Supino Reto 4x10`;

        try {
            const apiKey = "AIzaSyA8GweO3l6t_KObs0Zg1bHRmuIaQZKpDcw";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
            });
            
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Erro da API ${response.status}: ${errorBody.error.message}`);
            }
            
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text || text.trim() === "") {
                 throw new Error(`A IA não gerou um treino válido.`);
            }

            // Incrementa o contador de geração do usuário no Firestore
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                generationCount: increment(1)
            });

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
            window.location.href = '/minha-rotina.html';
        } catch (error) {
            alert(`Falha ao guardar a rotina: ${error.message}`);
            saveBtn.disabled = false;
            saveBtn.textContent = "Guardar Rotina e Começar";
        }
    }

    if (form) form.addEventListener('submit', handleGeneratePlan);
    if (saveBtn) saveBtn.addEventListener('click', handleSaveRoutine);
    if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth).catch(console.error));
});
