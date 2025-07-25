// Funções de ajuda compartilhadas, como o processador de texto da IA.
const helpIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 5.422a.64.64 0 0 1-.642.642.64.64 0 0 1-.642-.642.64.64 0 0 1 .642-.642.64.64 0 0 1 .642.642z"/></svg>`;

export function processWorkoutTextToHtml(text, options = {}) {
    const { showStartButton = false } = options;
    if (!text || text.trim() === '') return '';

    const cleanedText = text.replace(/\*\*/g, ''); 
    const lines = cleanedText.split('\n');
    let html = '';
    let inDayBlock = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const dayMatch = trimmedLine.match(/^(dia \d+|dia [a-z]|segunda|terça|quarta|quinta|sexta|sábado|domingo)/i);
        
        if (dayMatch) {
            if (inDayBlock) html += '</div>';
            const dayTitle = trimmedLine.replace(/:$/, '').trim();
            html += `<div class="day-workout-group border-t border-gray-700 pt-4 mt-4"><div class="flex justify-between items-center mb-4"><h3 class="text-2xl font-bold text-amber-400">${dayTitle}</h3>`;
            if (showStartButton) {
                html += `<button class="start-workout-btn bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg">Iniciar Treino</button>`;
            }
            html += `</div>`;
            inDayBlock = true;
            return; 
        }

        // LÓGICA QUE ADICIONA A INTERROGAÇÃO
        if (inDayBlock) {
            const exerciseName = trimmedLine.split(/ \d+x/)[0].replace(/^[*\-–\d\.]*\s*/, '').trim();
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
            
            html += `<div class="exercise-line">
                        <span class="exercise-text">${trimmedLine}</span>
                        <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName} no Google'">
                            ${helpIconSvg}
                        </a>
                    </div>`;
        }
    });

    if (inDayBlock) html += '</div>';
    return html;
}
