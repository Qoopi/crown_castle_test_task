export type Piece = 'orange' | 'blue' | null;

export interface Square {
  r: number; // 1..8
  c: number; // 1..8
  playable: boolean; // (r + c) % 2 === 0
  piece: Piece; // null for empty
  king: boolean; // you2/me2 images indicate kings
}

export type Board = Square[][]; // [row][col], 1-based stored at index r-1/c-1

export interface Coordinates { r: number; c: number }

export interface Move { from: Coordinates; to: Coordinates }