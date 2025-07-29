document.addEventListener('DOMContentLoaded', () => {
    /**
     * Objeto que contém todas as strings de texto para cada idioma suportado.
     */
    const translations = {
        'pt': {
            // GERAL
            navHome: 'Gerador',
            navRoutine: 'Minha Rotina',
            subtitle: 'Sua jornada de fitness personalizada começa aqui.',
            
            // PÁGINA DE LOGIN (CHAVES ADICIONADAS)
            loginTitle: 'Bem-vindo de volta! Faça login para continuar.',
            loginBtn: 'Entrar com Google',

            // FORMULÁRIO GERADOR
            goalLabel: 'Objetivo Principal',
            goalOpt1: 'Construir Músculo',
            goalOpt2: 'Perder Gordura',
            goalOpt3: 'Melhorar Resistência',
            goalOpt4: 'Aumentar Força',
            goalOpt5: 'Fitness Geral',
            levelLabel: 'Nível de Fitness',
            levelOpt1: 'Iniciante',
            levelOpt2: 'Intermediário',
            levelOpt3: 'Avançado',
            daysLabel: 'Divisão do Treino', // Alterado de 'Dias de Treino por Semana' para 'Divisão do Treino'
            equipmentLabel: 'Equipamento Disponível',
            equipOpt1: 'Acesso Total à Academia',
            equipOpt2: 'Halteres e Barras',
            equipOpt3: 'Apenas Halteres',
            equipOpt4: 'Apenas Peso Corporal',
            notesLabel: 'Observações Específicas (Opcional)',
            notesPlaceholder: 'ex: Foco em pernas, evitar exercícios de ombro.',
            generateBtn: 'Gerar Meu Plano',
            loaderText: 'Gerando seu plano personalizado...',
            saveBtn: 'Guardar Rotina e Começar',
            
            // PÁGINA MINHA ROTINA
            routineSubtitle: 'Seu plano de treino atual e histórico.',
            deleteRoutineBtn: 'Remover Rotina Atual',
            noRoutine: 'Você ainda não tem uma rotina de treino salva.',

            // PÁGINA DE PLANOS
            plansTitle: 'Explore Nossos Planos',
            plansSubtitle: 'Escolha o plano perfeito para você e comece sua jornada.',
            freePlanTitle: 'Plano Gratuito',
            freePlanDesc: 'Acesso ao gerador de treinos personalizado e salvamento de uma rotina.',
            premiumPlanTitle: 'Plano Premium',
            premiumPlanDesc: 'Tudo do plano gratuito, mais histórico de treinos, planos avançados e suporte prioritário.',
            currentPlan: 'Seu Plano Atual',
            upgradeBtn: 'Fazer Upgrade',
            backToApp: 'Voltar para a App',

            // GERAL - BOTÕES
            startWorkoutBtn: 'Iniciar Treino',
            restBtn: 'Descansar',
            nextExerciseBtn: 'Próximo Exercício',
            closeBtn: 'Fechar',
            finishWorkoutBtn: 'Finalizar Treino',

            // STREAK
            streakRestoreBtn: 'Restaurar Foguinho',
            streakRestoreConfirm: 'Tem certeza que deseja usar uma restauração de foguinho? Você tem {{restores}} restantes.',
            streakRestoreSuccess: 'Foguinho restaurado com sucesso!',
            streakRestoreFail: 'Falha ao restaurar o foguinho: ',
            noRestores: 'Você não tem restaurações de foguinho restantes.',
            
            // ERROS
            errorLoadingRoutine: 'Ocorreu um erro ao carregar sua rotina:',
            errorGeneratingPlan: 'Ocorreu um erro ao gerar seu plano:',
            errorSavingRoutine: 'Falha ao guardar a rotina:',
            errorAuth: 'Erro no login:',
            popupClosed: 'O login foi cancelado.',
            noValidPlan: 'A IA não gerou um treino válido. Motivo: ',
            timeoutError: 'A requisição para a IA demorou demais (timeout).',
            noWorkoutSelected: 'Nenhum treino selecionado',
            selectWorkoutPrompt: 'Por favor, volte e selecione um treino.',
            noRoutineFound: 'Nenhuma rotina encontrada!',
            errorLoadingWorkout: 'Erro ao Carregar',
            noExerciseFound: 'Não foi possível encontrar os exercícios para este treino.',
            workoutFinishedSuccess: 'Parabéns! Treino finalizado e foguinho atualizado!',
            
            // Outros
            exerciseHowTo: 'exercício como fazer' // Para pesquisa no Google
        },
        'en': {
            // GENERAL
            navHome: 'Generator',
            navRoutine: 'My Routine',
            subtitle: 'Your personalized fitness journey starts here.',

            // LOGIN PAGE
            loginTitle: 'Welcome back! Log in to continue.',
            loginBtn: 'Sign in with Google',

            // GENERATOR FORM
            goalLabel: 'Main Goal',
            goalOpt1: 'Build Muscle',
            goalOpt2: 'Lose Fat',
            goalOpt3: 'Improve Endurance',
            goalOpt4: 'Increase Strength',
            goalOpt5: 'General Fitness',
            levelLabel: 'Fitness Level',
            levelOpt1: 'Beginner',
            levelOpt2: 'Intermediate',
            levelOpt3: 'Advanced',
            daysLabel: 'Workout Split', // Changed from 'Workout Days per Week' to 'Workout Split'
            equipmentLabel: 'Available Equipment',
            equipOpt1: 'Full Gym Access',
            equipOpt2: 'Dumbbells & Barbells',
            equipOpt3: 'Dumbbells Only',
            equipOpt4: 'Bodyweight Only',
            notesLabel: 'Specific Notes (Optional)',
            notesPlaceholder: 'e.g., Focus on legs, avoid shoulder exercises.',
            generateBtn: 'Generate My Plan',
            loaderText: 'Generating your personalized plan...',
            saveBtn: 'Save Routine and Start',

            // MY ROUTINE PAGE
            routineSubtitle: 'Your current workout plan and history.',
            deleteRoutineBtn: 'Delete Current Routine',
            noRoutine: 'You don\'t have a saved workout routine yet.',

            // PLANS PAGE
            plansTitle: 'Explore Our Plans',
            plansSubtitle: 'Choose the perfect plan for you and start your journey.',
            freePlanTitle: 'Free Plan',
            freePlanDesc: 'Access to personalized workout generator and one routine save.',
            premiumPlanTitle: 'Premium Plan',
            premiumPlanDesc: 'Everything in the Free Plan, plus workout history, advanced plans, and priority support.',
            currentPlan: 'Your Current Plan',
            upgradeBtn: 'Upgrade Now',
            backToApp: 'Back to App',

            // GENERAL - BUTTONS
            startWorkoutBtn: 'Start Workout',
            restBtn: 'Rest',
            nextExerciseBtn: 'Next Exercise',
            closeBtn: 'Close',
            finishWorkoutBtn: 'Finish Workout',

            // STREAK
            streakRestoreBtn: 'Restore Streak',
            streakRestoreConfirm: 'Are you sure you want to use a streak restore? You have {{restores}} remaining.',
            streakRestoreSuccess: 'Streak restored successfully!',
            streakRestoreFail: 'Failed to restore streak: ',
            noRestores: 'You have no streak restores remaining.',

            // ERRORS
            errorLoadingRoutine: 'An error occurred while loading your routine:',
            errorGeneratingPlan: 'An error occurred while generating your plan:',
            errorSavingRoutine: 'Failed to save routine:',
            errorAuth: 'Login error:',
            popupClosed: 'Login was cancelled.',
            noValidPlan: 'AI did not generate a valid workout. Reason: ',
            timeoutError: 'AI request timed out.',
            noWorkoutSelected: 'No workout selected',
            selectWorkoutPrompt: 'Please go back and select a workout.',
            noRoutineFound: 'No routine found!',
            errorLoadingWorkout: 'Error Loading',
            noExerciseFound: 'Could not find exercises for this workout.',
            workoutFinishedSuccess: 'Congratulations! Workout finished and streak updated!',

            // Other
            exerciseHowTo: 'exercise how to' // For Google search
        }
    };

    let currentLang = localStorage.getItem('lang') || 'pt'; // Default to Portuguese
    const langPtBtn = document.getElementById('lang-pt');
    const langEnBtn = document.getElementById('lang-en');
    const langSwitcher = document.getElementById('lang-switcher'); // For select dropdown

    /**
     * Retorna a tradução para a chave fornecida no idioma atual.
     * @param {string} key - A chave da string a ser traduzida.
     * @returns {string} A string traduzida.
     */
    window.getTranslation = (key) => {
        return translations[currentLang][key] || key; // Fallback to key if translation not found
    };

    /**
     * Define o idioma e atualiza o texto na página.
     * @param {string} lang - O código do idioma ('pt' ou 'en').
     */
    const setLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            el.textContent = window.getTranslation(key);
        });

        document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-placeholder');
            el.placeholder = window.getTranslation(key);
        });

        // Apenas tenta modificar os botões se eles existirem
        if (langPtBtn && langEnBtn) {
            langPtBtn.classList.toggle('opacity-50', lang !== 'pt');
            langPtBtn.classList.toggle('opacity-100', lang === 'pt');
            langEnBtn.classList.toggle('opacity-50', lang !== 'en');
            langEnBtn.classList.toggle('opacity-100', lang === 'en');
        }
        
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn && !generateBtn.disabled) {
             generateBtn.textContent = window.getTranslation('generateBtn');
        }
    };

    // Adiciona uma verificação para garantir que os botões existem antes de adicionar o listener.
    if (langPtBtn && langEnBtn) {
        langPtBtn.addEventListener('click', () => setLanguage('pt'));
        langEnBtn.addEventListener('click', () => setLanguage('en'));
    }

    if (langSwitcher) {
        langSwitcher.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    // Define o idioma inicial ao carregar a página
    setLanguage(currentLang);
});
