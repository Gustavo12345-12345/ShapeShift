// Este é o nosso "banco de dados" de imagens.
// A chave é o nome do exercício normalizado (sem espaços, acentos ou maiúsculas).
// O valor é a URL do GIF animado.
// Fonte dos GIFs: https://github.com/yuhonas/free-exercise-db (um recurso público e gratuito)

export const exerciseDB = {
    // Peito
    supinoreto: "https://www.yuhonas.com/free-exercise-db/images/barbell-bench-press-1.gif",
    supinoinclinado: "https://www.yuhonas.com/free-exercise-db/images/barbell-incline-bench-press-1.gif",
    supinodeclinado: "https://www.yuhonas.com/free-exercise-db/images/barbell-decline-bench-press-1.gif",
    crucifixo: "https://www.yuhonas.com/free-exercise-db/images/dumbbell-fly-1.gif",
    flexao: "https://www.yuhonas.com/free-exercise-db/images/push-up-1.gif",
    
    // Costas
    puxadafrontal: "https://www.yuhonas.com/free-exercise-db/images/lat-pulldown-1.gif",
    remadacurvada: "https://www.yuhonas.com/free-exercise-db/images/bent-over-row-1.gif",
    barrafixa: "https://www.yuhonas.com/free-exercise-db/images/pull-up-1.gif",

    // Pernas
    agachamento: "https://www.yuhonas.com/free-exercise-db/images/barbell-squat-1.gif",
    legpress: "https://www.yuhonas.com/free-exercise-db/images/leg-press-1.gif",
    extensaodepernas: "https://www.yuhonas.com/free-exercise-db/images/leg-extension-1.gif",
    levantamentoterra: "https://www.yuhonas.com/free-exercise-db/images/barbell-deadlift-1.gif",

    // Ombros
    desenvolvimentomilitar: "https://www.yuhonas.com/free-exercise-db/images/barbell-overhead-press-1.gif",
    elevacaolateral: "https://www.yuhonas.com/free-exercise-db/images/lateral-raise-1.gif",

    // Braços
    roscadireta: "https://www.yuhonas.com/free-exercise-db/images/barbell-curl-1.gif",
    roscaalternada: "https://www.yuhonas.com/free-exercise-db/images/dumbbell-curl-1.gif",
    tricepstesta: "https://www.yuhonas.com/free-exercise-db/images/skull-crusher-1.gif",
    tricepscorda: "https://www.yuhonas.com/free-exercise-db/images/triceps-pushdown-1.gif",
};

/**
 * Normaliza o nome de um exercício para criar uma chave de busca.
 * Ex: "Supino Reto com Halteres" -> "supinoretocomhalteres"
 * @param {string} name - O nome do exercício.
 * @returns {string} - O nome normalizado.
 */
export function normalizeName(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize("NFD") // Separa acentos das letras
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
        .replace(/[^a-z0-9]/g, ''); // Remove tudo que não for letra ou número
}
