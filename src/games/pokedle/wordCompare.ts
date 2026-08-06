export type LetterState = "correct" | "present" | "absent";

/** Letras "puras" del nombre: sin acentos, may/min, espacios, guiones ni puntuacion. */
export function letterWord(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

export function normalizeGuess(text: string): string {
  return letterWord(text).toLowerCase();
}

/** Compara letra a letra (estilo Wordle), gestionando bien las letras repetidas. */
export function compareGuess(guessRaw: string, answerRaw: string): LetterState[] {
  const guess = normalizeGuess(guessRaw).split("");
  const answer = normalizeGuess(answerRaw).split("");
  const states: LetterState[] = new Array(guess.length).fill("absent");
  const answerUsed: boolean[] = new Array(answer.length).fill(false);

  for (let i = 0; i < guess.length; i++) {
    if (i < answer.length && guess[i] === answer[i]) {
      states[i] = "correct";
      answerUsed[i] = true;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (states[i] === "correct") continue;
    const idx = answer.findIndex((ch, j) => !answerUsed[j] && ch === guess[i]);
    if (idx !== -1) {
      states[i] = "present";
      answerUsed[idx] = true;
    }
  }

  return states;
}

export function isExactGuess(guessRaw: string, answerRaw: string): boolean {
  return normalizeGuess(guessRaw) === normalizeGuess(answerRaw);
}
