import { words } from "../data/words";

export interface PuzzleData {
  word: string;
  hint: string;
  category: string;
}

export async function generatePuzzle() {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}
