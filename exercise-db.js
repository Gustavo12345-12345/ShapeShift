// Banco de dados de imagens usando o CDN jsDelivr para servir os arquivos do GitHub.
// Isso evita problemas de bloqueio (CORB) e a necessidade de baixar os arquivos localmente.

export const exerciseDB = {
    // ================== PEITO (CHEST) ==================
    supinoreto: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/barbell-bench-press.gif",
    supinoinclinado: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/incline-bench-press.gif",
    supinoretocomhalteres: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-bench-press.gif",
    supinoinclinadocomhalteres: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-incline-bench-press.gif",
    flexao: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/push-up.gif",
    flexaodebraco: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/push-up.gif",
    crucifixo: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-flat-fly.gif",
    crossover: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/cable-crossover.gif",
    mergulhoemparalelas: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dips-chest-version.gif",
    pullovercomhalter: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-pullover.gif",

    // ================== COSTAS (BACK) ==================
    barrafixa: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/pull-up.gif",
    chinup: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/chin-up.gif",
    remadacurvada: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/barbell-row.gif",
    remadacavalinho: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/t-bar-row.gif",
    remadaunilateral: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/one-arm-dumbbell-row.gif",
    serrote: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/one-arm-dumbbell-row.gif",
    puxadafrontal: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/lat-pulldown.gif",
    puxadafrente: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/lat-pulldown.gif",
    remadasentada: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/seated-cable-row.gif",
    levantamentoterra: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/deadlift.gif",
    deadlift: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/deadlift.gif",

    // ================== PERNAS (LEGS) ==================
    agachamento: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/barbell-squat.gif",
    agachamentolivre: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/barbell-squat.gif",
    legpress: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/leg-press.gif",
    afundo: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-lunges.gif",
    passada: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-lunges.gif",
    stiff: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/romanian-deadlift.gif",
    cadeiraextensora: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/leg-extension.gif",
    mesaflexora: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/leg-curl.gif",
    flexaodepernas: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/leg-curl.gif",
    agachamentobulgaro: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/bulgarian-split-squat.gif",
    elevacaopelvica: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/hip-thrust.gif",
    hipthrust: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/hip-thrust.gif",
    panturrilhasentado: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/seated-calf-raise.gif",

    // ================== OMBROS (SHOULDERS) ==================
    desenvolvimentomilitar: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/overhead-press.gif",
    desenvolvimentocomhalteres: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-shoulder-press.gif",
    desenvolvimentoarnold: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/arnold-press.gif",
    elevacaolateral: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-lateral-raise.gif",
    elevacaofrontal: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-front-raise.gif",
    facepull: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/face-pull.gif",

    // ================== BÍCEPS ==================
    roscadireta: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/barbell-curl.gif",
    roscaalternada: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/dumbbell-alternate-bicep-curl.gif",
    roscamartelo: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/hammer-curl.gif",
    roscascott: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/preacher-curl.gif",

    // ================== TRÍCEPS ==================
    tricepstesta: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/barbell-skull-crusher.gif",
    tricepscorda: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/tricep-rope-pushdown.gif",
    mergulhonobanco: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/tricep-dips.gif",
    supinofechado: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/close-grip-bench-press.gif",

    // ================== ABDÔMEN (ABS) ==================
    abdominal: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/crunches.gif",
    prancha: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/plank.gif",
    elevacaodepernas: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/leg-raise.gif",
    elevacaodepernasnabarra: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/hanging-leg-raise.gif",
    girorusso: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/russian-twist.gif",
    
    // ================== CARDIO / CORPO INTEIRO ==================
    burpee: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/burpee.gif",
    polichinelo: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/jumping-jacks.gif",
    alpinista: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/mountain-climbers.gif",
    kettlebellswing: "https://cdn.jsdelivr.net/gh/kenmorph/workout-gifs@main/assets/kettlebell-swing.gif"
};

/**
 * Normaliza o nome de um exercício para criar uma chave de busca.
 * @param {string} name - O nome do exercício.
 * @returns {string} - O nome normalizado.
 */
export function normalizeName(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-g]/g, '');
}
