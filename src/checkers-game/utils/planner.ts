import { Board, Coord, Move, Piece, Side, inBounds, playable } from './types';

const YOU_DIR = -1; // YOU moves upward (toward smaller r)
const ME_DIR = 1; // ME moves downward (toward larger r)

function directionsFor(piece: Piece): number[][] {
  if (piece.kind === 'KING') return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const dir = piece.side === 'YOU' ? YOU_DIR : ME_DIR;
  return [[dir, -1], [dir, 1]];
}

function sideOf(piece: Piece | null): Side | null {
  return piece ? piece.side : null;
}

/**
 * Generate all capturing sequences from a starting square (multi-jumps included).
 */
function captureDFS(board: Board, from: Coord, piece: Piece, visited: Set<string>): Move[] {
  const moves: Move[] = [];
  let foundAny = false;

  for (const [dr, dc] of (piece.kind === 'KING'
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : directionsFor(piece))) {
    const mid: Coord = { r: from.r + dr, c: from.c + dc };
    const land: Coord = { r: from.r + 2 * dr, c: from.c + 2 * dc };
    if (!inBounds(mid) || !inBounds(land) || !playable(land)) continue;

    const midPiece = board[mid.r][mid.c];
    const landPiece = board[land.r][land.c];

    if (midPiece && midPiece.side !== piece.side && !landPiece) {
      // Perform jump on a temporary board
      const key = `${from.r},${from.c}->${land.r},${land.c}`;
      if (visited.has(key)) continue; // avoid loops in kings

      const clone: Board = board.map((row) => row.slice());
      // move piece
      clone[from.r][from.c] = null;
      clone[mid.r][mid.c] = null; // captured
      const promoted = maybePromote(piece, land);
      clone[land.r][land.c] = promoted;

      const subVisited = new Set(visited);
      subVisited.add(key);

      const cont = captureDFS(clone, land, promoted, subVisited);
      if (cont.length === 0) {
        moves.push({ from, to: land, captures: [mid] });
      } else {
        for (const m of cont) {
          moves.push({ from, to: m.to, captures: [mid, ...(m.captures || [])] });
        }
      }
      foundAny = true;
    }
  }

  return foundAny ? moves : [];
}

function maybePromote(piece: Piece, landing: Coord): Piece {
  if (piece.kind === 'KING') return piece;
  if (piece.side === 'YOU' && landing.r === 0) return { ...piece, kind: 'KING' };
  if (piece.side === 'ME' && landing.r === 7) return { ...piece, kind: 'KING' };
  return piece;
}

/** All legal non-capturing moves for one piece. */
function quietMoves(board: Board, from: Coord, piece: Piece): Move[] {
  const ms: Move[] = [];
  for (const [dr, dc] of directionsFor(piece)) {
    const to: Coord = { r: from.r + dr, c: from.c + dc };
    if (!inBounds(to) || !playable(to)) continue;
    if (!board[to.r][to.c]) {
      ms.push({ from, to });
    }
  }
  return ms;
}

/** All legal moves for `side`, preferring captures per standard rules. */
export function legalMoves(board: Board, side: Side): Move[] {
  const jumps: Move[] = [];
  const quiet: Move[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.side !== side) continue;
      const from: Coord = { r, c };
      const caps = captureDFS(board, from, piece, new Set());
      if (caps.length) jumps.push(...caps);
      else quiet.push(...quietMoves(board, from, piece));
    }
  }

  return jumps.length ? jumps : quiet;
}

/** Simple planner: choose the highest-capture move, then any. */
export function planMove(board: Board, side: Side): Move | null {
  const moves = legalMoves(board, side);
  if (moves.length === 0) return null;
  // prefer longer capture chains
  moves.sort((a, b) => (b.captures?.length || 0) - (a.captures?.length || 0));
  return moves[0];
}