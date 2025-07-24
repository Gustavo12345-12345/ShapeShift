// ... início do arquivo

/**
 * Processa o texto bruto do treino, identifica os exercícios e adiciona um link de ajuda.
 * @param {string} text - O texto bruto gerado pela IA.
 * @returns {string} - Uma string HTML formatada.
 */
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

        // Tenta identificar se a linha é um título de dia (ex: "Dia A", "Segunda-feira")
        const dayMatch = trimmedLine.match(/^(dia [A-Z0-9]+|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|domingo)/i);
        
        if (dayMatch) {
            if (inDayBlock) {
                html += '</div>'; // Fecha a div do dia anterior se houver
            }
            // **INÍCIO DA ALTERAÇÃO**
            const dayTitle = dayMatch[0].replace(/:$/, '').trim(); // Remove dois pontos e espaços
            html += `<div class="day-workout-group border-t border-gray-700 pt-4 mt-4">`;
            html += `<div class="flex justify-between items-center mb-4">`;
            html +=    `<h3 class="text-2xl font-bold text-amber-400">${trimmedLine}</h3>`;
            html +=    `<button class="start-workout-btn bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg" data-day-title="${dayTitle}">${window.getTranslation('startWorkoutBtn')}</button>`;
            html += `</div>`;
            inDayBlock = true;
            // **FIM DA ALTERAÇÃO**
            return;
        }

        // Tenta identificar se a linha é um exercício
        const exerciseMatch = trimmedLine.match(/^\s*[\*\-\d\.]+\s*(?<name>.+?)(?=\s+\d+x\d+|\s+-\s+\d+|\s+\d+\s+s[eé]ries|\s+\d+\s+rep)/i);
        
        if (exerciseMatch && exerciseMatch.groups.name) {
            const exerciseName = exerciseMatch.groups.name.trim();
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
            
            const lineWithIcon = `
                <div class="exercise-line">
                    <span class="exercise-text">${trimmedLine}</span>
                    <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="exercise-info-link" title="Pesquisar '${exerciseName}' no Google">
                        ${helpIconSvg}
                    </a>
                </div>`;
            html += lineWithIcon;
        } else {
            // Se não for um exercício ou título, trata como um parágrafo normal
            html += `<p>${trimmedLine}</p>`;
        }
    });

    if (inDayBlock) {
        html += '</div>'; // Fecha a última div do dia
    }

    return html;
}
