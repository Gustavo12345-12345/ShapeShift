// ... (código do helpIconSvg deve estar aqui em cima)

export function processWorkoutTextToHtml(text) {
    if (!text) return '';

    const lines = text.split('\n');
    let html = '';
    let inDayBlock = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            if (inDayBlock) {
                html += '</div>'; // Fecha a div do dia anterior
                inDayBlock = false;
            }
            html += '<br>';
            return;
        }

        // Tenta identificar se a linha é um título de dia
        const dayMatch = trimmedLine.match(/^(dia [A-Z0-9]+|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|domingo)/i);
        
        // =============================================================
        // INÍCIO DA VERIFICAÇÃO IMPORTANTE
        // =============================================================
        if (dayMatch) {
            if (inDayBlock) {
                html += '</div>';
            }
            const dayTitle = dayMatch[0].replace(/:$/, '').trim();
            const startButtonText = window.getTranslation ? window.getTranslation('startWorkoutBtn') : 'Iniciar Treino';

            // Este bloco cria o botão
            html += `<div class="day-workout-group border-t border-gray-700 pt-4 mt-4">`;
            html += `<div class="flex justify-between items-center mb-4">`;
            html +=    `<h3 class="text-2xl font-bold text-amber-400">${trimmedLine}</h3>`;
            html +=    `<button class="start-workout-btn bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg" data-day-title="${dayTitle}">${startButtonText}</button>`;
            html += `</div>`;
            inDayBlock = true;
            return;
        }
        // =============================================================
        // FIM DA VERIFICAÇÃO IMPORTANTE
        // =============================================================

        // ... (resto do código que processa os exercícios)
        const exerciseMatch = trimmedLine.match(/^\s*[\*\-\d\.]+\s*(?<name>.+?)(?=\s+\d+x\d+|\s+-\s+\d+|\s+\d+\s+s[eé]ries|\s+\d+\s+rep)/i);
        if (exerciseMatch && exerciseMatch.groups.name) {
            // ...
        } else {
           // ...
        }
    });

    if (inDayBlock) {
        html += '</div>';
    }

    return html;
}
