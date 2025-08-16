/**
 * utils.js
 * Transforma o texto da IA na visualização da rotina, com controle
 * sobre a exibição de elementos interativos como o botão "Iniciar Treino".
 */

// A função agora aceita um segundo argumento 'options' para customizar o HTML gerado.
export function processWorkoutTextToHtml(rawText, options = {}) {
    // Usamos desestruturação para pegar a opção 'showStartButton'.
    // O valor padrão é 'true', então se 'options' não for fornecido, o botão aparecerá.
    // Isso mantém o comportamento correto na página "Minha Rotina".
    const { showStartButton = true } = options;

    if (!rawText) return '';

    const lines = rawText.split('\n');
    let htmlResult = '';
    let exercisesForCurrentDay = [];
    let currentDayTitle = '';

    // Função interna para renderizar o HTML de um dia de treino completo.
    const flushDayHtml = (dayTitle) => {
        if (dayTitle && exercisesForCurrentDay.length > 0) {
            htmlResult += `<div class="workout-day" data-day-id="${dayTitle}">`;
            htmlResult += `<h3>${dayTitle}</h3>`;
            htmlResult += '<ul class="exercise-list-static">';
            exercisesForCurrentDay.forEach(exercise => {
                htmlResult += `<li>${exercise}</li>`;
            });
            htmlResult += '</ul>';

            // CORREÇÃO: O botão "Iniciar Treino" só é adicionado ao HTML
            // se a opção 'showStartButton' for explicitamente verdadeira.
            if (showStartButton) {
                htmlResult += `<div class="form-button-container">
                                   <button class="start-workout-button generate-button" data-day-title="${dayTitle}">Iniciar Treino</button>
                               </div>`;
            }
            htmlResult += '</div>';
        }
    };

    // Itera sobre cada linha do texto gerado pela IA.
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Procura por títulos de dias (ex: "Dia A: Peito")
        const dayMatch = trimmedLine.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);
        if (dayMatch) {
            flushDayHtml(currentDayTitle); // Renderiza o dia anterior antes de começar um novo.
            currentDayTitle = dayMatch[1].replace(/[*:]/g, '').trim();
            exercisesForCurrentDay = [];
        } else if (trimmedLine.startsWith('*') && /\d/.test(trimmedLine)) {
            // Adiciona linhas de exercício à lista do dia atual.
            exercisesForCurrentDay.push(trimmedLine.substring(1).trim());
        }
    });

    flushDayHtml(currentDayTitle); // Garante que o último dia de treino seja renderizado.

    return htmlResult;
}
