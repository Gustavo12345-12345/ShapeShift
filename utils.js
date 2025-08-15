/**
 * utils.js
 * Contém a função que transforma o texto da IA em HTML interativo.
 */

const helpIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
</svg>
`;

export function processWorkoutTextToHtml(rawText) {
    if (!rawText) return '';

    const lines = rawText.split('\n');
    let htmlResult = '';
    let isListOpen = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const dayMatch = trimmedLine.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);
        if (dayMatch) {
            if (isListOpen) {
                htmlResult += `<div class="form-button-container"><button class="finish-workout-button generate-button" disabled>Finalizar Treino</button></div></ul></div>`;
            }
            
            const dayTitle = dayMatch[1].replace(/[*:]/g, '').trim();
            
            htmlResult += `<div class="workout-day" data-day-id="${dayTitle}"><h3>${dayTitle}</h3>`;
            htmlResult += '<ul class="exercise-list">';
            isListOpen = true;

        } else if (trimmedLine.startsWith('*')) {
            const exerciseText = trimmedLine.substring(1).trim();
            const exerciseName = exerciseText.match(/^(.*?)(?=\s+\d|séries|rep)/i)?.[1]?.trim() || exerciseText;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;

            htmlResult += `
                <li class="exercise-item">
                    <input type="checkbox" class="exercise-checkbox">
                    <label>${exerciseText}</label>
                    <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName}'">${helpIconSvg}</a>
                </li>`;
        }
    });

    if (isListOpen) {
        htmlResult += `<div class="form-button-container"><button class="finish-workout-button generate-button" disabled>Finalizar Treino</button></div></ul></div>`;
    }

    return htmlResult;
}
