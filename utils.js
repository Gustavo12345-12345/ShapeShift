// utils.js

/**
 * Ícone de interrogação em formato SVG.
 */
const helpIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
</svg>
`;

/**
 * Processa o texto bruto do treino, identifica os exercícios e adiciona um link de ajuda.
 * @param {string} text - O texto bruto gerado pela IA.
 * @returns {string} - Uma string HTML formatada.
 */
export function processWorkoutTextToHtml(text) {
    if (!text) return '';

    const lines = text.split('\n');
    let html = '';

    lines.forEach(line => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            html += '<br>';
            return;
        }

        // Tenta identificar se a linha é um título de dia (ex: "Dia A", "Segunda-feira")
        if (trimmedLine.match(/^(dia [A-Z0-9]+|segunda|terça|quarta|quinta|sexta|sábado|domingo)/i) && trimmedLine.endsWith(':')) {
            html += `<h3>${trimmedLine}</h3>`;
            return;
        }

        // Tenta identificar se a linha é um exercício
        const exerciseMatch = trimmedLine.match(/^\s*[\*\-\d\.]+\s*(?<name>.+?)(?=\s+\d+x\d+|\s+-\s+\d+|\s+\d+\s+s[eé]ries|\s+\d+\s+rep)/i);
        
        if (exerciseMatch && exerciseMatch.groups.name) {
            const exerciseName = exerciseMatch.groups.name.trim();
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(exerciseName + ' exercício como fazer')}`;
            
            // CORRIGIDO: Usa uma div com flexbox para alinhar o texto e o ícone na mesma linha.
            const lineWithIcon = `
                <div class="exercise-line">
                    <span>${trimmedLine}</span>
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

    return html;
}
