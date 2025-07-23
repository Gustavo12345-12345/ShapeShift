document.addEventListener('DOMContentLoaded', () => {
    /**
     * Objeto que contém todas as strings de texto para cada idioma suportado.
     */
    const translations = {
        'pt': {
            navHome: 'Gerador',
            navRoutine: 'Minha Rotina',
            subtitle: 'Sua jornada de fitness personalizada começa aqui.',
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
            daysLabel: 'Dias de Treino por Semana',
            equipmentLabel: 'Equipamento Disponível',
            equipOpt1: 'Acesso Total à Academia',
            equipOpt2: 'Halteres e Barras',
            equipOpt3: 'Apenas Halteres',
            equipOpt4: 'Apenas Peso Corporal',
            notesLabel: 'Observações Específicas (Opcional)',
            notesPlaceholder: "ex: 'Foco nas pernas', 'Evitar exercícios de salto'",
            generateBtn: 'Gerar Meu Plano',
            generatingBtn: 'Gerando...',
            saveBtn: 'Salvar Rotina e Iniciar',
            loaderText: 'Gerando seu plano personalizado...',
            errorPrefix: 'Ocorreu um erro: ',
            errorSuffix: '. Por favor, tente novamente.',
            invalidApiResp: 'Resposta inválida da API.',
            routineTitle: 'Minha Rotina de Treino',
            routineLoader: 'Carregando sua rotina...',
            emptyState: 'Você ainda não salvou uma rotina.',
            emptyStateBtn: 'Gerar uma agora',
            timerTitle: 'Tempo de Descanso',
            timerStart: 'Iniciar',
            timerClose: 'Fechar'
        },
        'en': {
            navHome: 'Generator',
            navRoutine: 'My Routine',
            subtitle: 'Your personalized fitness journey starts here.',
            goalLabel: 'Primary Goal',
            goalOpt1: 'Build Muscle',
            goalOpt2: 'Lose Fat',
            goalOpt3: 'Improve Endurance',
            goalOpt4: 'Increase Strength',
            goalOpt5: 'General Fitness',
            levelLabel: 'Fitness Level',
            levelOpt1: 'Beginner',
            levelOpt2: 'Intermediate',
            levelOpt3: 'Advanced',
            daysLabel: 'Workout Days per Week',
            equipmentLabel: 'Available Equipment',
            equipOpt1: 'Full Gym Access',
            equipOpt2: 'Dumbbells & Barbells',
            equipOpt3: 'Dumbbells Only',
            equipOpt4: 'Bodyweight Only',
            notesLabel: 'Specific Notes (Optional)',
            notesPlaceholder: "e.g., 'Focus on legs', 'Avoid jumping exercises'",
            generateBtn: 'Generate My Plan',
            generatingBtn: 'Generating...',
            saveBtn: 'Save Routine and Start',
            loaderText: 'Generating your personalized plan...',
            errorPrefix: 'An error occurred: ',
            errorSuffix: '. Please try again.',
            invalidApiResp: 'Invalid response structure from the API.',
            routineTitle: 'My Workout Routine',
            routineLoader: 'Loading your routine...',
            emptyState: 'You haven\'t saved a routine yet.',
            emptyStateBtn: 'Generate one now',
            timerTitle: 'Rest Timer',
            timerStart: 'Start',
            timerClose: 'Close'
        }
    };

    const langPtBtn = document.getElementById('lang-pt');
    const langEnBtn = document.getElementById('lang-en');
    const langSwitcher = document.getElementById('lang-switcher');

    // Função global para obter uma string de tradução.
    window.getTranslation = (key) => {
        const lang = localStorage.getItem('workoutPlannerLang') || 'pt';
        return translations[lang]?.[key] || key;
    };

    // Define o idioma da página.
    const setLanguage = (lang) => {
        if (!translations[lang]) return;

        localStorage.setItem('workoutPlannerLang', lang);
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

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

    // CORRIGIDO: Adiciona uma verificação para garantir que os botões existem antes de adicionar o listener.
    if (langPtBtn && langEnBtn) {
        langPtBtn.addEventListener('click', () => setLanguage('pt'));
        langEnBtn.addEventListener('click', () => setLanguage('en'));
    }

    if (langSwitcher) {
        langSwitcher.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    // Define o idioma inicial ao carregar a página.
    const savedLang = localStorage.getItem('workoutPlannerLang') || 'pt';
    setLanguage(savedLang);
});
