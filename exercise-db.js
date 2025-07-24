// Banco de dados de imagens para a fonte "workout-gifs".
// Esta é uma versão expandida com mais exercícios e variações.

export const exerciseDB = {
    // ================== PEITO (CHEST) ==================
    supinoreto: "./images/barbell-bench-press.gif",
    supinoinclinado: "./images/incline-bench-press.gif",
    supinodeclinado: "./images/decline-barbell-bench-press.gif",
    supinoretocomhalteres: "./images/dumbbell-bench-press.gif",
    supinoinclinadocomhalteres: "./images/dumbbell-incline-bench-press.gif",
    flexao: "./images/push-up.gif",
    flexaodebraco: "./images/push-up.gif",
    flexaoinclinada: "./images/incline-push-up.gif",
    mergulhoemparalelas: "./images/dips-chest-version.gif",
    crucifixo: "./images/dumbbell-flat-fly.gif",
    crucifixoinclinado: "./images/incline-dumbbell-fly.gif",
    crossover: "./images/cable-crossover.gif",
    pullovercomhalter: "./images/dumbbell-pullover.gif",

    // ================== COSTAS (BACK) ==================
    barrafixa: "./images/pull-up.gif",
    chinup: "./images/chin-up.gif",
    remadacurvada: "./images/barbell-row.gif",
    remadacavalinho: "./images/t-bar-row.gif",
    remadaunilateral: "./images/one-arm-dumbbell-row.gif",
    serrote: "./images/one-arm-dumbbell-row.gif",
    puxadafrontal: "./images/lat-pulldown.gif",
    puxadafrente: "./images/lat-pulldown.gif",
    puxadafechada: "./images/close-grip-lat-pulldown.gif",
    remadasentada: "./images/seated-cable-row.gif",
    levantamentoterra: "./images/deadlift.gif",
    deadlift: "./images/deadlift.gif",
    hiperextensao: "./images/hyperextension.gif",

    // ================== PERNAS (LEGS) ==================
    agachamento: "./images/barbell-squat.gif",
    agachamentolivre: "./images/barbell-squat.gif",
    agachamentofrontal: "./images/front-squat.gif",
    agachamentogoblet: "./images/goblet-squat.gif",
    legpress: "./images/leg-press.gif",
    afundo: "./images/dumbbell-lunges.gif",
    passada: "./images/dumbbell-lunges.gif",
    stiff: "./images/romanian-deadlift.gif",
    cadeiraextensora: "./images/leg-extension.gif",
    mesaflexora: "./images/leg-curl.gif",
    flexaodepernas: "./images/leg-curl.gif",
    agachamentobulgaro: "./images/bulgarian-split-squat.gif",
    elevacaopelvica: "./images/hip-thrust.gif",
    hipthrust: "./images/hip-thrust.gif",
    panturrilhaempe: "./images/standing-calf-raise.gif",
    panturrilhasentado: "./images/seated-calf-raise.gif",
    goodmorning: "./images/good-morning.gif",

    // ================== OMBROS (SHOULDERS) ==================
    desenvolvimentomilitar: "./images/overhead-press.gif",
    desenvolvimentocomhalteres: "./images/dumbbell-shoulder-press.gif",
    desenvolvimentoarnold: "./images/arnold-press.gif",
    elevacaolateral: "./images/dumbbell-lateral-raise.gif",
    elevacaofrontal: "./images/dumbbell-front-raise.gif",
    remadaalta: "./images/upright-row.gif",
    facepull: "./images/face-pull.gif",
    encolhimento: "./images/dumbbell-shrug.gif",

    // ================== BÍCEPS ==================
    roscadireta: "./images/barbell-curl.gif",
    roscaalternada: "./images/dumbbell-alternate-bicep-curl.gif",
    roscamartelo: "./images/hammer-curl.gif",
    roscascott: "./images/preacher-curl.gif",
    roscaconcentrada: "./images/concentration-curl.gif",
    roscainversa: "./images/reverse-barbell-curl.gif",

    // ================== TRÍCEPS ==================
    tricepstesta: "./images/barbell-skull-crusher.gif",
    tricepscorda: "./images/tricep-rope-pushdown.gif",
    mergulhonobanco: "./images/tricep-dips.gif",
    supinofechado: "./images/close-grip-bench-press.gif",
    tricepsfrances: "./images/dumbbell-overhead-tricep-extension.gif",
    coice: "./images/tricep-kickback.gif",

    // ================== ABDÔMEN (ABS) ==================
    abdominal: "./images/crunches.gif",
    prancha: "./images/plank.gif",
    pranchalateral: "./images/side-plank.gif",
    elevacaodepernas: "./images/leg-raise.gif",
    elevacaodepernasnabarra: "./images/hanging-leg-raise.gif",
    girorusso: "./images/russian-twist.gif",
    bicicletanoar: "./images/bicycle-crunch.gif",

    // ================== CARDIO / CORPO INTEIRO ==================
    burpee: "./images/burpee.gif",
    polichinelo: "./images/jumping-jacks.gif",
    alpinista: "./images/mountain-climbers.gif",
    kettlebellswing: "./images/kettlebell-swing.gif",
    saltoemcaixa: "./images/box-jump.gif",
    corda: "./images/jump-rope.gif"
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
