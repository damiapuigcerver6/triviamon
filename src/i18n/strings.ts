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
  };
  home: {
    play: string;
    comingSoon: string;
  };
  games: {
    tablaTipos: { title: string; description: string };
    detectivePokemon: { title: string; description: string };
    conexiones: { title: string; description: string };
    mayorMenor: { title: string; description: string };
    quienEsEsePokemon: { title: string; description: string };
    parrillaPokemon: { title: string; description: string };
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
  },
  home: {
    play: "Jugar →",
    comingSoon: "Próximamente",
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
  },
  home: {
    play: "Play →",
    comingSoon: "Coming soon",
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
};
