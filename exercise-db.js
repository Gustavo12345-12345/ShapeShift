// Este é o nosso "banco de dados" de imagens.
// Os valores agora são caminhos LOCAIS para as imagens na sua pasta /images.
// Isso resolve TODOS os problemas de bloqueio.

export const exerciseDB = {
    // ================== PEITO (CHEST) ==================
    supinoreto: "./images/barbell-bench-press-1.gif",
    supinoinclinado: "./images/barbell-incline-bench-press-1.gif",
    supinodeclinado: "./images/barbell-decline-bench-press-1.gif",
    supinoretocomhalteres: "./images/dumbbell-bench-press-1.gif",
    supinoinclinadocomhalteres: "./images/dumbbell-incline-bench-press-1.gif",
    crucifixo: "./images/dumbbell-fly-1.gif",
    crucifixoinclinado: "./images/incline-dumbbell-fly-1.gif",
    flexao: "./images/push-up-1.gif",
    flexaodebraco: "./images/push-up-1.gif",
    crossover: "./images/cable-crossover-1.gif",
    peckdeck: "./images/machine-fly-1.gif",
    pullovercomhalter: "./images/dumbbell-pullover-1.gif",

    // ================== COSTAS (BACK) ==================
    puxadafrontal: "./images/lat-pulldown-1.gif",
    puxadafrente: "./images/lat-pulldown-1.gif",
    puxadafechada: "./images/close-grip-lat-pulldown-1.gif",
    remadacurvada: "./images/bent-over-row-1.gif",
    remadacavalinho: "./images/t-bar-row-1.gif",
    remadasentada: "./images/seated-cable-row-1.gif",
    remadaunilateral: "./images/dumbbell-row-1.gif",
    serrote: "./images/dumbbell-row-1.gif",
    barrafixa: "./images/pull-up-1.gif",
    pulldown: "./images/straight-arm-pulldown-1.gif",
    hiperextensao: "./images/hyperextension-1.gif",

    // ================== PERNAS (LEGS) ==================
    agachamento: "./images/barbell-squat-1.gif",
    agachamentolivre: "./images/barbell-squat-1.gif",
    agachamentofrontal: "./images/barbell-front-squat-1.gif",
    agachamentogoblet: "./images/goblet-squat-1.gif",
    legpress: "./images/leg-press-1.gif",
    cadeiraextensora: "./images/leg-extension-1.gif",
    mesaflexora: "./images/lying-leg-curl-1.gif",
    levantamentoterra: "./images/barbell-deadlift-1.gif",
    deadlift: "./images/barbell-deadlift-1.gif",
    stiff: "./images/romanian-deadlift-1.gif",
    afundo: "./images/dumbbell-lunges-1.gif",
    passada: "./images/dumbbell-lunges-1.gif",
    agachamentobulgaro: "./images/bulgarian-split-squat-1.gif",
    panturrilha: "./images/calf-raise-1.gif",
    elevacaopelvica: "./images/hip-thrust-1.gif",
    hipthrust: "./images/hip-thrust-1.gif",

    // ================== OMBROS (SHOULDERS) ==================
    desenvolvimentomilitar: "./images/barbell-overhead-press-1.gif",
    desenvolvimentocomhalteres: "./images/dumbbell-shoulder-press-1.gif",
    desenvolvimentoarnold: "./images/arnold-press-1.gif",
    elevacaolateral: "./images/lateral-raise-1.gif",
    elevacaofrontal: "./images/front-raise-1.gif",
    remadaalta: "./images/upright-row-1.gif",
    facepull: "./images/face-pull-1.gif",

    // ================== BÍCEPS ==================
    roscadireta: "./images/barbell-curl-1.gif",
    roscaalternada: "./images/dumbbell-curl-1.gif",
    roscaconcentrada: "./images/concentration-curl-1.gif",
    roscascott: "./images/preacher-curl-1.gif",
    roscamartelo: "./images/hammer-curl-1.gif",
    chinup: "./images/chin-up-1.gif",

    // ================== TRÍCEPS ==================
    tricepstesta: "./images/skull-crusher-1.gif",
    tricepscorda: "./images/triceps-pushdown-1.gif",
    tricepspulley: "./images/triceps-pushdown-1.gif",
    tricepsfrances: "./images/dumbbell-overhead-triceps-extension-1.gif",
    mergulhonobanco: "./images/bench-dips-1.gif",
    supinofechado: "./images/close-grip-bench-press-1.gif",

    // ================== ABDÔMEN (ABS) ==================
    abdominal: "./images/crunch-1.gif",
    prancha: "./images/plank-1.gif",
    elevacaodepernas: "./images/leg-raise-1.gif",
    elevacaodepernasnabarra: "./images/hanging-leg-raise-1.gif",
    girocontronco: "./images/russian-twist-1.gif",

    // ================== CARDIO / CORPO INTEIRO ==================
    burpee: "./images/burpee-1.gif",
    polichinelo: "./images/jumping-jacks-1.gif",
    alpinista: "./images/mountain-climber-1.gif",
    kettlebellswing: "./images/kettlebell-swing-1.gif"
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
        .replace(/[^a-z0-9]/g, '');
}
