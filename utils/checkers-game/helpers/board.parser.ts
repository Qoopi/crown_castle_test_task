import type { Board, Square } from './board.types';

export function isPlayable(r: number, c: number) {
  return (r + c) % 2 === 0;
}

export function pieceFromSrc(src: string): { piece: Square['piece']; king: boolean } {
  const s = src.toLowerCase();
  const isOrange = s.includes('you');
  const isBlue = s.includes('me');
  const king = s.includes('2'); // you2/me2
  return {
    piece: isOrange ? 'orange' : isBlue ? 'blue' : null,
    king,
  };
}

export function emptyBoard(): Board {
  const rows: Board = [] as unknown as Board;
  for (let r = 1; r <= 8; r++) {
    const row: Square[] = [];
    for (let c = 1; c <= 8; c++) {
      row.push({ r, c, playable: isPlayable(r, c), piece: null, king: false });
    }
    rows.push(row);
  }
  return rows;
}

export function setSquare(board: Board, r: number, c: number, square: Partial<Square>) {
  const sq = board[r - 1][c - 1];
  Object.assign(sq, square);
}