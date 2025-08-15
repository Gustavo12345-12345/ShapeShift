/**
 * utils.js
 * Transforma o texto da IA na visualização inicial da rotina.
 */

export function processWorkoutTextToHtml(rawText) {
    if (!rawText) return '';

    const lines = rawText.split('\n');
    let htmlResult = '';
    let exercisesForCurrentDay = [];
    let currentDayTitle = '';

    const flushDayHtml = (dayTitle) => {
        if (dayTitle && exercisesForCurrentDay.length > 0) {
            htmlResult += `<div class="workout-day" data-day-id="${dayTitle}">`;
            htmlResult += `<h3>${dayTitle}</h3>`;
            htmlResult += '<ul class="exercise-list-static">';
            exercisesForCurrentDay.forEach(exercise => {
                htmlResult += `<li>${exercise}</li>`;
            });
            htmlResult += '</ul>';
            htmlResult += `<div class="form-button-container">
                               <button class="start-workout-button generate-button" data-day-title="${dayTitle}">Iniciar Treino</button>
                           </div>`;
            htmlResult += '</div>';
        }
    };

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const dayMatch = trimmedLine.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);
        if (dayMatch) {
            flushDayHtml(currentDayTitle); // Finaliza o dia anterior
            currentDayTitle = dayMatch[1].replace(/[*:]/g, '').trim();
            exercisesForCurrentDay = [];
        } else if (trimmedLine.startsWith('*') && /\d/.test(trimmedLine)) {
            // CONDIÇÃO ATUALIZADA: Só adiciona se a linha começar com '*' E contiver um número.
            exercisesForCurrentDay.push(trimmedLine.substring(1).trim());
        }
    });

    flushDayHtml(currentDayTitle); // Finaliza o último dia

    return htmlResult;
}
