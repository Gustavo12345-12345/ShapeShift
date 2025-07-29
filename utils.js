const helpIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34-.294.46-.545.46H6.5c-.5 0-.78-.42-.69-1.01l1.417-6.69a.68.68 0 0 1 .69-.58h.04l1.5 6.926c.012.052.09.12.285.12h.03c.195 0 .308-.04.295-.121l-1.4-6.786a.68.68 0 0 1 .68-.58z"/><circle cx="8" cy="13" r="1"/></svg>`;

export function processWorkoutTextToHtml(text, options = {}) {
    const { showStartButton = false } = options;
    if (!text || !text.trim()) return '';

    const lines = text.replace(/\*\*/g, '').split('\n');
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

        if (inDayBlock) {
            const exerciseName = trimmedLine.split(/ \d+x/)[0].replace(/^[*\-–\d\.]*\s*/, '').trim();
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
            html += `<div class="exercise-line"><span class="exercise-text">${trimmedLine}</span><a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName}' no Google">${helpIconSvg}</a></div>`;
        }
    });

    if (inDayBlock) html += '</div>';
    return html;
}