/**
 * utils.js
 * * Este ficheiro contém funções de utilidade partilhadas por várias partes da aplicação,
 * como a formatação do texto do treino em HTML.
 */

/**
 * Processa o texto bruto do plano de treino gerado pela IA e converte-o em HTML.
 * @param {string} rawText - O texto completo do plano de treino.
 * @param {object} options - Opções de formatação.
 * @param {boolean} options.showStartButton - Se deve ou não mostrar um botão "Iniciar Treino" para cada dia.
 * @returns {string} - A representação HTML do plano de treino.
 */
export function processWorkoutTextToHtml(rawText, options = {}) {
    // Se o texto for nulo ou vazio, retorna uma string vazia para evitar erros.
    if (!rawText) {
        return '';
    }

    const lines = rawText.split('\n');
    let htmlResult = '';
    let isListOpen = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Ignora linhas em branco
        if (!trimmedLine) {
            return;
        }

        // Verifica se a linha é um título de dia (ex: "Dia A: Peito e Tríceps")
        const dayMatch = trimmedLine.match(/^\**\s*(Dia\s+[A-Z0-9].*)/i);
        if (dayMatch) {
            // Se uma lista de exercícios de um dia anterior estava aberta, fecha-a.
            if (isListOpen) {
                htmlResult += '</ul></div>';
            }
            
            const dayTitle = dayMatch[1].replace(/[*:]/g, '').trim();
            
            // Cria o cabeçalho para o novo dia
            htmlResult += `<div class="workout-day"><h3>${dayTitle}</h3>`;

            // Adiciona o botão "Iniciar Treino" se a opção estiver ativa
            if (options.showStartButton) {
                htmlResult += `<a href="/iniciar-rotina.html?workoutId=${encodeURIComponent(dayTitle)}" class="generate-button" style="margin-top: 1rem; margin-bottom: 1.5rem;">Iniciar Treino</a>`;
            }
            
            // Abre uma nova lista para os exercícios deste dia
            htmlResult += '<ul class="exercise-list">';
            isListOpen = true;

        } else if (trimmedLine.startsWith('*')) {
            // Se a linha é um exercício (começa com *), adiciona-o como um item da lista.
            // A variável é definida localmente para evitar o erro "is not defined".
            const exerciseText = trimmedLine.substring(1).trim();
            htmlResult += `<li class="exercise-item">${exerciseText}</li>`;
        }
    });

    // Se a última linha do ficheiro deixou uma lista aberta, fecha-a.
    if (isListOpen) {
        htmlResult += '</ul></div>';
    }

    return htmlResult;
}
