/**
 * utils.js
 * Este ficheiro contém funções de utilidade partilhadas, como a formatação
 * do texto do treino em HTML.
 */

/**
 * Processa o texto bruto do plano de treino e converte-o em HTML.
 * @param {string} rawText - O texto completo do plano de treino.
 * @param {object} options - Opções de formatação.
 * @param {boolean} options.showStartButton - Se deve mostrar o botão "Iniciar Treino".
 * @returns {string} - A representação HTML do plano de treino.
 */
export function processWorkoutTextToHtml(rawText, options = {}) {
    if (!rawText) {
        return '';
    }

    const lines = rawText.split('\n');
    let htmlResult = '';
    let isListOpen = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const dayMatch = trimmedLine.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);
        if (dayMatch) {
            if (isListOpen) {
                htmlResult += '</ul></div>';
            }
            
            const dayTitle = dayMatch[1].replace(/[*:]/g, '').trim();
            
            htmlResult += `<div class="workout-day"><h3>${dayTitle}</h3>`;

            // CORREÇÃO: Garante que o link aponta para o ficheiro .html correto.
            if (options.showStartButton) {
                htmlResult += `<a href="/iniciar-rotina.html?workoutId=${encodeURIComponent(dayTitle)}" class="generate-button">Iniciar Treino</a>`;
            }
            
            htmlResult += '<ul class="exercise-list">';
            isListOpen = true;

        } else if (trimmedLine.startsWith('*')) {
            const exerciseText = trimmedLine.substring(1).trim();
            htmlResult += `<li class="exercise-item"><label>${exerciseText}</label></li>`;
        }
    });

    if (isListOpen) {
        htmlResult += '</ul></div>';
    }

    return htmlResult;
}
