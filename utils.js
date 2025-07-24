/**
 * Ícone de interrogação em formato SVG.
 * Esta variável precisa existir neste arquivo para ser usada pela função abaixo.
 */
const helpIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
</svg>
`;

/**
 * Processa o texto bruto do treino, identifica os exercícios, adiciona um link de ajuda
 * e um botão para iniciar o treino de cada dia.
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

        // Tenta identificar se a linha é um título de dia
        const dayMatch = trimmedLine.match(/^(dia [A-Z0-9]+|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|domingo)/i);
        
        if (dayMatch) {
            if (inDayBlock) {
                html += '</div>'; // Fecha a div do dia anterior se houver
            }
            const dayTitle = dayMatch[0].replace(/:$/, '').trim();
            const startButtonText = window.getTranslation ? window.getTranslation('startWorkoutBtn') : 'Iniciar Treino';

            html += `<div class="day-workout-group border-t border-gray-700 pt-4 mt-4">`;
            html += `<div class="flex justify-between items-center mb-4">`;
            html +=    `<h3 class="text-2xl font-bold text-amber-400">${trimmedLine}</h3>`;
            html +=    `<button class="start-workout-btn bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg" data-day-title="${dayTitle}">${startButtonText}</button>`;
            html += `</div>`;
            inDayBlock = true;
            return;
        }

        // Tenta identificar se a linha é um exercício
        const exerciseMatch = trimmedLine.match(/^\s*[\*\-\d\.]+\s*(?<name>.+?)(?=\s+\d+x\d+|\s+-\s+\d+|\s+\d+\s+s[eé]ries|\s+\d+\s+rep)/i);
        
        if (exerciseMatch && exerciseMatch.groups.name) {
            const exerciseName = exerciseMatch.groups.name.trim();
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
            
            // A variável `helpIconSvg` é usada aqui
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
