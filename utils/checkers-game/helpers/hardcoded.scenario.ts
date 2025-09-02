import type { Move } from './board.types';

// Five orange moves that usually work from the starting layout.
// If the site AI changes, you can tweak these moves without touching tests.
export const MY_MOVES: Move[] = [
  // r,c are 1-based, playable squares only
  { from: { r: 3, c: 3 }, to: { r: 2, c: 4} },
  { from: { r: 2, c: 2 }, to: { r: 3, c: 3 } },
  { from: { r: 5, c: 3 }, to: { r: 4, c: 4 } },
  { from: { r: 6, c: 2 }, to: { r: 4, c: 4 } },
  { from: { r: 4, c: 4 }, to: { r: 6, c: 6 } },
];

export const OPPONENT_MOVES: {r:number, c:number}[] = [
  { r: 3, c: 5 },
  { r: 5, c: 5 },
  { r: 5, c: 3 },
  { r: 7, c: 5 },
  { r: 5, c: 5 },
];