export type Side = 'YOU' | 'ME';
export type PieceKind = 'MAN' | 'KING';

export interface Coord { r: number; c: number } // 0..7 each

export interface Piece {
  side: Side;
  kind: PieceKind;
}

export interface Move {
  from: Coord;
  to: Coord;
  /** squares jumped over in capture sequence (in order) */
  captures?: Coord[];
}

export type Square = Piece | null; // null = empty/unplayable (we'll ignore lights by (r+c)%2)
export type Board = Square[][]; // 8x8

export function inBounds({ r, c }: Coord): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function eq(a: Coord, b: Coord): boolean {
  return a.r === b.r && a.c === b.c;
}

export function playable({ r, c }: Coord): boolean {
  // playable (dark) squares are usually (r+c) % 2 === 1 on this board
  return (r + c) % 2 === 1;
}