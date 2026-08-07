export interface Strings {
  common: {
    loadingPokedex: string;
    close: string;
    dailyChallengeTab: string;
    freePracticeTab: string;
    shareResult: string;
    shareCopied: string;
    playAgain: string;
  };
  header: {
    gamesTooltip: string;
    statsTooltip: string;
    themeTooltip: string;
    helpTooltip: string;
    homeTooltip: string;
    languageTooltip: string;
  };
  footer: {
    disclaimer: string;
    creditBefore: string; // "Un proyecto de" / "A project by"
    creditAfter: string; // "descubre también" / "check out"
    privacyLink: string;
  };
  home: {
    play: string;
    comingSoon: string;
    seoTitle: string;
    seoDescription: string;
  };
  games: {
    tablaTipos: { title: string; description: string };
    detectivePokemon: { title: string; description: string };
    conexiones: { title: string; description: string };
    mayorMenor: { title: string; description: string };
    quienEsEsePokemon: { title: string; description: string };
    parrillaPokemon: { title: string; description: string };
    pokedle: { title: string; description: string };
    movimix: { title: string; description: string };
  };
  stats: {
    modalTitle: string;
    dailyChallengeSuffix: string;
    completed: string;
    currentStreak: string;
    bestStreak: string;
    empty: string;
  };
  tablaTipos: {
    attackerDefender: string;
    colorLegend: string;
    brushNeutral: string;
    brushHalf: string;
    brushDouble: string;
    brushNone: string;
    unanswered: string;
    correctBang: string;
    yourAnswer: string;
    correctColon: string;
    gamePaused: string;
    keepPlaying: string;
    resume: string;
    pause: string;
    cellsSuffix: string;
    check: string;
    reset: string;
    correctSuffix: string;
    keepEditing: string;
  };
  detectivePokemon: {
    attrTipo1: string;
    attrTipo2: string;
    attrGen: string;
    attrFase: string;
    attrMetodo: string;
    attrColor: string;
    attrAltura: string;
    attrPeso: string;
    placeholder: string;
    hintsLabel: string;
    giveUp: string;
    wonTitle: (name: string) => string;
    guessedInAttempts: (n: number) => string;
    lostTitle: (name: string) => string;
    anotherPokemon: string;
    shareGuessesLabel: string;
  };
  conexiones: {
    subtitle: string;
    placeholder: string;
    oneAway: string;
    shuffle: string;
    deselect: string;
    checkGroup: string;
    mistakesRemaining: string;
    solvedTitle: string;
    outOfAttemptsTitle: string;
    mistakesCount: (m: number, max: number) => string;
    newGame: string;
    shareMistakesLine: (m: number, max: number) => string;
  };
  mayorMenor: {
    subtitle: string;
    bestStreakCard: (n: number) => string;
    streak: string;
    bestStreak: string;
    lostTitle: string;
    finalStreak: (n: number) => string;
    newRecord: string;
    playAgain: string;
    changeStat: string;
    backHome: string;
    statHp: string;
    statAttack: string;
    statDefense: string;
    statSpAttack: string;
    statSpDefense: string;
    statSpeed: string;
    statPokedexNumber: string;
    statBstTotal: string;
  };
  quienEsEsePokemon: {
    subtitle: string;
    bestScore: string;
    bestStreak: string;
    start: string;
    score: string;
    streak: string;
    placeholder: string;
    revealedBang: (name: string) => string;
    timeUp: string;
    lastWas: (name: string) => string;
    scoreAndBestStreak: (score: number, streak: number) => string;
    records: (score: number, streak: number) => string;
    playAgain: string;
    backToMenu: string;
  };
  parrillaPokemon: {
    cells: string;
    mistakes: string;
    selectEmptyCell: string;
    typeMatchingPokemon: string;
    placeholder: string;
    alreadyUsed: (name: string) => string;
    doesntMatch: (name: string) => string;
    giveUp: string;
    completedTitle: string;
    revealedTitle: string;
    cellsSolved: (n: number, mistakes: number) => string;
    anotherGrid: string;
    shareGaveUp: string;
    shareCompleted: string;
    shareMistakesLine: (m: number) => string;
  };
  cookieBanner: {
    title: string;
    purposeAds: string;
    purposeStorage: string;
    detail: string;
    accept: string;
    reject: string;
    learnMore: string;
  };
  privacy: {
    title: string;
    lastUpdated: string;
    introBody: string;
    dataTitle: string;
    dataBody: string;
    cookiesTitle: string;
    cookiesBody: string;
    adsTitle: string;
    adsBody: string;
    hostingTitle: string;
    hostingBody: string;
    childrenTitle: string;
    childrenBody: string;
    changesTitle: string;
    changesBody: string;
    contactTitle: string;
    contactBody: string;
  };
  pokedle: {
    attemptsLabel: (n: number, max: number) => string;
    legend: string;
    guessButton: string;
    notEnoughLetters: string;
    notAPokemon: string;
    alreadyGuessed: (name: string) => string;
    giveUp: string;
    wonTitle: (name: string) => string;
    guessedInAttempts: (n: number, max: number) => string;
    lostTitle: (name: string) => string;
    anotherWord: string;
    shareWon: (n: number, max: number) => string;
    shareLost: (max: number) => string;
  };
  movimix: {
    placeholder: string;
    movesLabel: string;
    tableLevel: string;
    tableMove: string;
    tableType: string;
    tableCategory: string;
    evoLevel: string;
    hintTitle: string;
    hintTypeLabel: string;
    hintGenLabel: string;
    hintBstLabel: string;
    previousGuessesLabel: string;
    giveUp: string;
    wonTitle: (name: string) => string;
    guessedInAttempts: (n: number) => string;
    lostTitle: (name: string) => string;
    anotherPokemon: string;
    shareWon: (n: number) => string;
    shareLost: (name: string) => string;
  };
}

export const STRINGS_ES: Strings = {
  common: {
    loadingPokedex: "Cargando la Pokédex…",
    close: "Cerrar",
    dailyChallengeTab: "Reto diario",
    freePracticeTab: "Práctica libre",
    shareResult: "Compartir resultado",
    shareCopied: "¡Resultado copiado! Pégalo donde quieras.",
    playAgain: "Jugar de nuevo",
  },
  header: {
    gamesTooltip: "Juegos",
    statsTooltip: "Estadísticas",
    themeTooltip: "Cambiar tema",
    helpTooltip: "Ayuda",
    homeTooltip: "Volver al inicio",
    languageTooltip: "Cambiar idioma",
  },
  footer: {
    disclaimer: "Proyecto de aficionado, sin ánimo de lucro. Pokémon © Nintendo / Game Freak.",
    creditBefore: "Un proyecto de",
    creditAfter: "descubre también",
    privacyLink: "Política de privacidad",
  },
  home: {
    play: "Jugar →",
    comingSoon: "Próximamente",
    seoTitle: "Triviamon - Minijuegos de Pokémon gratis: Conexiones, Pokédle, Parrilla y más",
    seoDescription:
      "Triviamon es un hub gratuito de minijuegos de Pokémon: Conexiones, Pokédle, Detective Pokémon, Parrilla Pokémon, Mayor o menor, Tabla de tipos y ¿Quién es ese Pokémon? Reto diario y práctica libre, en español e inglés.",
  },
  games: {
    tablaTipos: {
      title: "Tabla de tipos",
      description:
        "Rellena de memoria la tabla completa de efectividades entre los 18 tipos. ¿Te la sabes al 100%?",
    },
    detectivePokemon: {
      title: "Detective Pokémon",
      description:
        "Adivina el Pokémon comparando tipo, generación, evolución, color y más. Reto diario o práctica libre.",
    },
    conexiones: {
      title: "Conexiones",
      description:
        "Agrupa 16 Pokémon en 4 grupos de 4 según lo que tienen en común. Reto diario o práctica libre.",
    },
    mayorMenor: {
      title: "Mayor o menor",
      description:
        "Elige una estadística y adivina si el siguiente Pokémon la tiene mayor o menor. ¿Cuánta racha aguantas?",
    },
    quienEsEsePokemon: {
      title: "¿Quién es ese Pokémon?",
      description:
        "Adivina el Pokémon a partir de su silueta antes de que se acabe el tiempo. ¡Cada acierto suma segundos!",
    },
    parrillaPokemon: {
      title: "Parrilla Pokémon",
      description:
        "Rellena la cuadrícula 3x3 con un Pokémon distinto por casilla que cumpla su fila y su columna a la vez.",
    },
    pokedle: {
      title: "Pokédle",
      description:
        "Adivina el Pokémon oculto en 6 intentos. Cada letra de tu intento se colorea según esté en el sitio correcto, en otro sitio o no esté.",
    },
    movimix: {
      title: "Movimix",
      description:
        "Se revela el conjunto de movimientos que puede aprender un Pokémon oculto. Adivina de quién se trata.",
    },
  },
  stats: {
    modalTitle: "Estadísticas",
    dailyChallengeSuffix: "Reto diario",
    completed: "Completados",
    currentStreak: "Racha actual",
    bestStreak: "Mejor racha",
    empty: "Aún no has completado ningún reto diario.",
  },
  tablaTipos: {
    attackerDefender: "Atacante ↓ / Defensor →",
    colorLegend: "Leyenda de colores",
    brushNeutral: "Neutra",
    brushHalf: "Mitad",
    brushDouble: "Doble",
    brushNone: "Nula",
    unanswered: "Sin responder. Correcto:",
    correctBang: "¡Correcto!",
    yourAnswer: "Tu respuesta:",
    correctColon: "Correcto:",
    gamePaused: "Juego pausado",
    keepPlaying: "Seguir jugando",
    resume: "Reanudar",
    pause: "Pausar",
    cellsSuffix: "celdas",
    check: "Comprobar",
    reset: "Reiniciar",
    correctSuffix: "correctas",
    keepEditing: "Seguir editando",
  },
  detectivePokemon: {
    attrTipo1: "Tipo 1",
    attrTipo2: "Tipo 2",
    attrGen: "Gen.",
    attrFase: "Fase evol.",
    attrMetodo: "Método evol.",
    attrColor: "Color",
    attrAltura: "Altura",
    attrPeso: "Peso",
    placeholder: "Escribe el nombre de un Pokémon...",
    hintsLabel: "💡 Pistas:",
    giveUp: "Solucionar",
    wonTitle: (name) => `¡Es ${name}!`,
    guessedInAttempts: (n) => `Lo adivinaste en ${n} intento${n === 1 ? "" : "s"}.`,
    lostTitle: (name) => `La respuesta era ${name}`,
    anotherPokemon: "Otro Pokémon",
    shareGuessesLabel: "Intentos",
  },
  conexiones: {
    subtitle: "Agrupa los 16 Pokémon en 4 grupos de 4 según lo que tienen en común.",
    placeholder: "Escribe el nombre de un Pokémon...",
    oneAway: "¡Solo un Pokémon no encaja!",
    shuffle: "Barajar",
    deselect: "Deseleccionar",
    checkGroup: "Comprobar grupo",
    mistakesRemaining: "Fallos restantes",
    solvedTitle: "¡Resuelto!",
    outOfAttemptsTitle: "Se acabaron los intentos",
    mistakesCount: (m, max) => `${m}/${max} fallos`,
    newGame: "Nueva partida",
    shareMistakesLine: (m, max) => `Fallos: ${m}/${max}`,
  },
  mayorMenor: {
    subtitle: "Elige una estadística para empezar a jugar.",
    bestStreakCard: (n) => `Mejor racha: ${n}`,
    streak: "Racha:",
    bestStreak: "Mejor racha:",
    lostTitle: "Has fallado",
    finalStreak: (n) => `Racha final: ${n}`,
    newRecord: "· ¡Nuevo récord!",
    playAgain: "Jugar de nuevo",
    changeStat: "Cambiar de estadística",
    backHome: "Volver al inicio",
    statHp: "Vida",
    statAttack: "Ataque",
    statDefense: "Defensa",
    statSpAttack: "Ataque especial",
    statSpDefense: "Defensa especial",
    statSpeed: "Velocidad",
    statPokedexNumber: "Número de Pokédex",
    statBstTotal: "Suma total de estadísticas (BST)",
  },
  quienEsEsePokemon: {
    subtitle:
      "Adivina el Pokémon a partir de su silueta antes de que se acabe el tiempo. Empiezas con 15 segundos y cada acierto te suma 5 más, hasta un máximo de 15.",
    bestScore: "Mejor puntuación:",
    bestStreak: "Mejor racha:",
    start: "Empezar",
    score: "Puntuación:",
    streak: "Racha:",
    placeholder: "Escribe el nombre del Pokémon...",
    revealedBang: (name) => `¡Es ${name}!`,
    timeUp: "¡Se acabó el tiempo!",
    lastWas: (name) => `El último era ${name}.`,
    scoreAndBestStreak: (score, streak) =>
      `Puntuación: ${score} · Mejor racha de la partida: ${streak}`,
    records: (score, streak) => `Récords: ${score} puntos · ${streak} de racha`,
    playAgain: "Jugar de nuevo",
    backToMenu: "Volver al menú",
  },
  parrillaPokemon: {
    cells: "Casillas:",
    mistakes: "Fallos:",
    selectEmptyCell: "Selecciona una casilla vacía para responder.",
    typeMatchingPokemon: "Escribe un Pokémon que cumpla las dos categorías de esa casilla.",
    placeholder: "Escribe el nombre de un Pokémon...",
    alreadyUsed: (name) => `Ya has usado a ${name} en otra casilla.`,
    doesntMatch: (name) => `${name} no cumple las dos categorías.`,
    giveUp: "Rendirse",
    completedTitle: "¡Parrilla completada!",
    revealedTitle: "Parrilla revelada",
    cellsSolved: (n, mistakes) => `Casillas acertadas: ${n}/9 · Fallos: ${mistakes}`,
    anotherGrid: "Otra parrilla",
    shareGaveUp: "Rendido",
    shareCompleted: "Completado",
    shareMistakesLine: (m) => `Fallos: ${m}`,
  },
  cookieBanner: {
    title: "Triviamon te pide tu consentimiento para usar tus datos personales para:",
    purposeAds: "Publicidad personalizada y medición de anuncios",
    purposeStorage: "Guardar y/o acceder a información en tu dispositivo",
    detail:
      "Usamos Google AdSense para mostrar anuncios; Google puede usar cookies para ofrecer publicidad personalizada. El resto de datos (progreso de partidas, preferencias) se guardan solo en tu navegador. Más información en policies.google.com/technologies/ads.",
    accept: "Aceptar",
    reject: "No aceptar",
    learnMore: "Más información",
  },
  privacy: {
    title: "Política de privacidad",
    lastUpdated: "Última actualización: agosto de 2026",
    introBody:
      "Triviamon es un proyecto de aficionado hecho por MDLabs. No es necesario registrarse ni crear una cuenta para jugar. Esta página explica qué datos se manejan al usar el sitio.",
    dataTitle: "Qué se guarda",
    dataBody:
      "Las puntuaciones, rachas, el progreso de las partidas y preferencias (como el idioma o el tema) se guardan únicamente en tu propio navegador (localStorage). Triviamon no tiene servidores propios que almacenen esta información ni la asocian a tu identidad: si borras los datos del navegador o cambias de dispositivo, se pierden.",
    cookiesTitle: "Cookies",
    cookiesBody:
      "Triviamon en sí no usa cookies propias de seguimiento. Si en el futuro se activan anuncios (ver más abajo), Google puede instalar cookies para mostrar publicidad, incluida publicidad personalizada. La primera vez que visitas el sitio te pedimos tu consentimiento para ese uso; puedes cambiar tu decisión en cualquier momento.",
    adsTitle: "Publicidad (Google AdSense)",
    adsBody:
      "Triviamon puede mostrar anuncios gestionados por Google AdSense. Google y sus socios pueden usar cookies u otros identificadores para ofrecer anuncios basados en tus visitas a este y otros sitios web. Puedes informarte sobre cómo Google usa estos datos en policies.google.com/technologies/ads, y gestionar la publicidad personalizada en adssettings.google.com.",
    hostingTitle: "Alojamiento",
    hostingBody:
      "El sitio está alojado en Vercel, que como cualquier proveedor de hosting puede registrar datos técnicos básicos (como la dirección IP) por motivos de seguridad y rendimiento, de forma independiente a Triviamon.",
    childrenTitle: "Menores de edad",
    childrenBody:
      "Triviamon no está dirigido específicamente a menores de 13 años ni recopila intencionadamente datos personales de menores.",
    changesTitle: "Cambios en esta política",
    changesBody:
      "Esta política puede actualizarse si cambia el funcionamiento del sitio (por ejemplo, al activar la publicidad). La fecha de la última actualización aparece arriba.",
    contactTitle: "Contacto",
    contactBody: "Para cualquier duda sobre esta política, puedes contactar a través de mdlabs.app.",
  },
  pokedle: {
    attemptsLabel: (n, max) => `Intento ${n}/${max}`,
    legend: "🟩 posición correcta · 🟨 está en el nombre · ⬛ no está en el nombre",
    guessButton: "Adivinar",
    notEnoughLetters: "Faltan letras.",
    notAPokemon: "Eso no es un Pokémon.",
    alreadyGuessed: (name) => `Ya has probado ${name}.`,
    giveUp: "Rendirse",
    wonTitle: (name) => `¡Correcto! Era ${name}`,
    guessedInAttempts: (n, max) => `Adivinado en ${n}/${max} intentos`,
    lostTitle: (name) => `Era ${name}`,
    anotherWord: "Otra palabra",
    shareWon: (n, max) => `${n}/${max}`,
    shareLost: (max) => `X/${max}`,
  },
  movimix: {
    placeholder: "Escribe un Pokémon…",
    movesLabel: "Movimientos por nivel:",
    tableLevel: "Nivel",
    tableMove: "Movimiento",
    tableType: "Tipo",
    tableCategory: "Categoría",
    evoLevel: "Evo.",
    hintTitle: "Pistas",
    hintTypeLabel: "Tipo:",
    hintGenLabel: "Generación:",
    hintBstLabel: "Suma de estadísticas:",
    previousGuessesLabel: "Intentos:",
    giveUp: "Rendirse",
    wonTitle: (name) => `¡Correcto! Era ${name}`,
    guessedInAttempts: (n) => `Adivinado en ${n} ${n === 1 ? "intento" : "intentos"}`,
    lostTitle: (name) => `Era ${name}`,
    anotherPokemon: "Otro Pokémon",
    shareWon: (n) => `Adivinado en ${n} ${n === 1 ? "intento" : "intentos"}`,
    shareLost: (name) => `No lo conseguí. Era ${name}`,
  },
};

export const STRINGS_EN: Strings = {
  common: {
    loadingPokedex: "Loading the Pokédex…",
    close: "Close",
    dailyChallengeTab: "Daily Challenge",
    freePracticeTab: "Free Practice",
    shareResult: "Share result",
    shareCopied: "Result copied! Paste it anywhere.",
    playAgain: "Play again",
  },
  header: {
    gamesTooltip: "Games",
    statsTooltip: "Stats",
    themeTooltip: "Switch theme",
    helpTooltip: "Help",
    homeTooltip: "Back to hub",
    languageTooltip: "Switch language",
  },
  footer: {
    disclaimer: "Fan project, not for profit. Pokémon © Nintendo / Game Freak.",
    creditBefore: "A project by",
    creditAfter: "check out",
    privacyLink: "Privacy policy",
  },
  home: {
    play: "Play →",
    comingSoon: "Coming soon",
    seoTitle: "Triviamon - Free Pokémon Mini-Games: Connections, Pokédle, Grid and more",
    seoDescription:
      "Triviamon is a free hub of Pokémon mini-games: Connections, Pokédle, Pokémon Detective, Pokémon Grid, Higher or Lower, Type Chart and Who's That Pokémon? Daily challenge and free practice, in English and Spanish.",
  },
  games: {
    tablaTipos: {
      title: "Type Chart",
      description:
        "Fill in the full effectiveness chart between the 18 types from memory. Do you know it 100%?",
    },
    detectivePokemon: {
      title: "Pokémon Detective",
      description:
        "Guess the Pokémon by comparing type, generation, evolution, color and more. Daily challenge or free practice.",
    },
    conexiones: {
      title: "Connections",
      description:
        "Group 16 Pokémon into 4 groups of 4 based on what they have in common. Daily challenge or free practice.",
    },
    mayorMenor: {
      title: "Higher or Lower",
      description:
        "Pick a stat and guess whether the next Pokémon has more or less of it. How long can you keep your streak?",
    },
    quienEsEsePokemon: {
      title: "Who's That Pokémon?",
      description:
        "Guess the Pokémon from its silhouette before time runs out. Every correct guess buys you more seconds!",
    },
    parrillaPokemon: {
      title: "Pokémon Grid",
      description:
        "Fill the 3x3 grid with a different Pokémon per cell that matches both its row and its column.",
    },
    pokedle: {
      title: "Pokédle",
      description:
        "Guess the hidden Pokémon in 6 tries. Every letter of your guess is colored by whether it's in the right spot, elsewhere, or not in the name.",
    },
    movimix: {
      title: "Movimix",
      description: "The move set a hidden Pokémon can learn is revealed. Guess who it is.",
    },
  },
  stats: {
    modalTitle: "Stats",
    dailyChallengeSuffix: "Daily challenge",
    completed: "Completed",
    currentStreak: "Current streak",
    bestStreak: "Best streak",
    empty: "You haven't completed a daily challenge yet.",
  },
  tablaTipos: {
    attackerDefender: "Attacker ↓ / Defender →",
    colorLegend: "Color legend",
    brushNeutral: "Neutral",
    brushHalf: "Half",
    brushDouble: "Double",
    brushNone: "None",
    unanswered: "Unanswered. Correct:",
    correctBang: "Correct!",
    yourAnswer: "Your answer:",
    correctColon: "Correct:",
    gamePaused: "Game paused",
    keepPlaying: "Resume playing",
    resume: "Resume",
    pause: "Pause",
    cellsSuffix: "cells",
    check: "Check",
    reset: "Reset",
    correctSuffix: "correct",
    keepEditing: "Keep editing",
  },
  detectivePokemon: {
    attrTipo1: "Type 1",
    attrTipo2: "Type 2",
    attrGen: "Gen.",
    attrFase: "Evo. stage",
    attrMetodo: "Evo. method",
    attrColor: "Color",
    attrAltura: "Height",
    attrPeso: "Weight",
    placeholder: "Type a Pokémon's name...",
    hintsLabel: "💡 Hints:",
    giveUp: "Give up",
    wonTitle: (name) => `It's ${name}!`,
    guessedInAttempts: (n) => `You guessed it in ${n} attempt${n === 1 ? "" : "s"}.`,
    lostTitle: (name) => `The answer was ${name}`,
    anotherPokemon: "Another Pokémon",
    shareGuessesLabel: "Guesses",
  },
  conexiones: {
    subtitle: "Group the 16 Pokémon into 4 groups of 4 based on what they have in common.",
    placeholder: "Type a Pokémon's name...",
    oneAway: "Only one Pokémon doesn't fit!",
    shuffle: "Shuffle",
    deselect: "Deselect",
    checkGroup: "Check group",
    mistakesRemaining: "Mistakes remaining",
    solvedTitle: "Solved!",
    outOfAttemptsTitle: "Out of attempts",
    mistakesCount: (m, max) => `${m}/${max} mistakes`,
    newGame: "New game",
    shareMistakesLine: (m, max) => `Mistakes: ${m}/${max}`,
  },
  mayorMenor: {
    subtitle: "Pick a stat to start playing.",
    bestStreakCard: (n) => `Best streak: ${n}`,
    streak: "Streak:",
    bestStreak: "Best streak:",
    lostTitle: "You lost",
    finalStreak: (n) => `Final streak: ${n}`,
    newRecord: "· New record!",
    playAgain: "Play again",
    changeStat: "Change stat",
    backHome: "Back to home",
    statHp: "HP",
    statAttack: "Attack",
    statDefense: "Defense",
    statSpAttack: "Sp. Attack",
    statSpDefense: "Sp. Defense",
    statSpeed: "Speed",
    statPokedexNumber: "Pokédex Number",
    statBstTotal: "Total base stats (BST)",
  },
  quienEsEsePokemon: {
    subtitle:
      "Guess the Pokémon from its silhouette before time runs out. You start with 15 seconds and every correct guess adds 5 more, up to a maximum of 15.",
    bestScore: "Best score:",
    bestStreak: "Best streak:",
    start: "Start",
    score: "Score:",
    streak: "Streak:",
    placeholder: "Type the Pokémon's name...",
    revealedBang: (name) => `It's ${name}!`,
    timeUp: "Time's up!",
    lastWas: (name) => `The last one was ${name}.`,
    scoreAndBestStreak: (score, streak) =>
      `Score: ${score} · Best streak this game: ${streak}`,
    records: (score, streak) => `Records: ${score} points · ${streak} streak`,
    playAgain: "Play again",
    backToMenu: "Back to menu",
  },
  parrillaPokemon: {
    cells: "Cells:",
    mistakes: "Mistakes:",
    selectEmptyCell: "Select an empty cell to answer.",
    typeMatchingPokemon: "Type a Pokémon that matches both categories of that cell.",
    placeholder: "Type a Pokémon's name...",
    alreadyUsed: (name) => `You've already used ${name} in another cell.`,
    doesntMatch: (name) => `${name} doesn't match both categories.`,
    giveUp: "Give up",
    completedTitle: "Grid completed!",
    revealedTitle: "Grid revealed",
    cellsSolved: (n, mistakes) => `Cells solved: ${n}/9 · Mistakes: ${mistakes}`,
    anotherGrid: "Another grid",
    shareGaveUp: "Gave up",
    shareCompleted: "Completed",
    shareMistakesLine: (m) => `Mistakes: ${m}`,
  },
  cookieBanner: {
    title: "Triviamon asks for your consent to use your personal data to:",
    purposeAds: "Personalised advertising and ad measurement",
    purposeStorage: "Store and/or access information on your device",
    detail:
      "We use Google AdSense to show ads; Google may use cookies to serve personalized ads. Everything else (game progress, preferences) stays only in your browser. Learn more at policies.google.com/technologies/ads.",
    accept: "Accept",
    reject: "Do not consent",
    learnMore: "Learn more",
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: August 2026",
    introBody:
      "Triviamon is a fan project made by MDLabs. There's no sign-up or account needed to play. This page explains what data is involved when you use the site.",
    dataTitle: "What gets stored",
    dataBody:
      "Scores, streaks, game progress, and preferences (like language or theme) are stored only in your own browser (localStorage). Triviamon has no servers of its own that store this information or tie it to your identity: if you clear your browser data or switch devices, it's gone.",
    cookiesTitle: "Cookies",
    cookiesBody:
      "Triviamon itself doesn't use its own tracking cookies. If ads are enabled in the future (see below), Google may set cookies to serve ads, including personalized ads. The first time you visit, we ask for your consent for that use; you can change your choice at any time.",
    adsTitle: "Advertising (Google AdSense)",
    adsBody:
      "Triviamon may show ads served through Google AdSense. Google and its partners may use cookies or other identifiers to serve ads based on your visits to this and other websites. You can learn how Google uses this data at policies.google.com/technologies/ads, and manage personalized advertising at adssettings.google.com.",
    hostingTitle: "Hosting",
    hostingBody:
      "The site is hosted on Vercel, which like any hosting provider may log basic technical data (such as IP address) for security and performance purposes, independently of Triviamon.",
    childrenTitle: "Children's privacy",
    childrenBody:
      "Triviamon isn't specifically directed at children under 13 and doesn't knowingly collect personal data from children.",
    changesTitle: "Changes to this policy",
    changesBody:
      "This policy may be updated if how the site works changes (for example, when ads are enabled). The last-updated date is shown above.",
    contactTitle: "Contact",
    contactBody: "For any questions about this policy, you can reach out via mdlabs.app.",
  },
  pokedle: {
    attemptsLabel: (n, max) => `Attempt ${n}/${max}`,
    legend: "🟩 right spot · 🟨 in the name, wrong spot · ⬛ not in the name",
    guessButton: "Guess",
    notEnoughLetters: "Not enough letters.",
    notAPokemon: "That's not a Pokémon.",
    alreadyGuessed: (name) => `You've already tried ${name}.`,
    giveUp: "Give up",
    wonTitle: (name) => `Correct! It was ${name}`,
    guessedInAttempts: (n, max) => `Guessed in ${n}/${max} tries`,
    lostTitle: (name) => `It was ${name}`,
    anotherWord: "Another word",
    shareWon: (n, max) => `${n}/${max}`,
    shareLost: (max) => `X/${max}`,
  },
  movimix: {
    placeholder: "Type a Pokémon…",
    movesLabel: "Moves by level:",
    tableLevel: "Level",
    tableMove: "Move",
    tableType: "Type",
    tableCategory: "Category",
    evoLevel: "Evo.",
    hintTitle: "Hints",
    hintTypeLabel: "Type:",
    hintGenLabel: "Generation:",
    hintBstLabel: "Total base stats:",
    previousGuessesLabel: "Guesses:",
    giveUp: "Give up",
    wonTitle: (name) => `Correct! It was ${name}`,
    guessedInAttempts: (n) => `Guessed in ${n} ${n === 1 ? "try" : "tries"}`,
    lostTitle: (name) => `It was ${name}`,
    anotherPokemon: "Another Pokémon",
    shareWon: (n) => `Guessed in ${n} ${n === 1 ? "try" : "tries"}`,
    shareLost: (name) => `Didn't get it. It was ${name}`,
  },
};
