import { Page, Locator, expect } from '@playwright/test';
import { Board, Coord, Piece, Side, playable } from './types';

/** Mapping by filename snippets used on gamesforthebrain checkers */
const YOU_MAN = 'you1';
const YOU_KING = 'you2';
const ME_MAN = 'me1';
const ME_KING = 'me2';

function pieceFromSrc(src: string): Piece | null {
  const s = src.toLowerCase();
  if (s.includes(YOU_KING)) return { side: 'YOU', kind: 'KING' };
  if (s.includes(YOU_MAN)) return { side: 'YOU', kind: 'MAN' };
  if (s.includes(ME_KING)) return { side: 'ME', kind: 'KING' };
  if (s.includes(ME_MAN)) return { side: 'ME', kind: 'MAN' };
  return null; // empty / light square image
}

function coordFromName(name: string): Coord | null {
  // expects name like "space77" or "space00"
  const m = name.match(/^\s*space(\d)(\d)\s*$/i);
  if (!m) return null;
  const r = Number(m[1]);
  const c = Number(m[2]);
  if (Number.isNaN(r) || Number.isNaN(c) || r < 0 || r > 7 || c < 0 || c > 7) return null;
  return { r, c };
}

export class BoardParser {
  private readonly page: Page;
  private readonly board: Locator;

  constructor(page: Page) {
    this.page = page;
    this.board = this.page.locator('//div[@id="board"]');
  }

  /** Parse current DOM into a Board (8x8) using attribute-driven coordinates. */
  async parse(): Promise<Board> {
    // Ensure the board root exists
    await this.board.waitFor({ state: 'visible'});

    // Get all rows

    const rows = this.board.locator('xpath=.//div[@class="line"]');
    const rowCount = await rows.count();

    if (rowCount !== 8) throw new Error(`Expected 8 rows, found ${rowCount}`);

    const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let i = 0; i < 8; i++) {
      const row = rows.nth(i);
      const cells = row.locator('xpath=.//img[contains(@name,"space")]');
      const cellCount = await cells.count();
      if (cellCount !== 8) throw new Error(`Row ${i}: expected 8 cells, found ${cellCount}`);

      for (let j = 0; j < 8; j++) {
        const img = cells.nth(j);
        const name = (await img.getAttribute('name')) || '';
        const src = (await img.getAttribute('src')) || '';
        const coord = coordFromName(name);
        if (!coord) throw new Error(`Invalid cell name attr: "${name}" at row ${i}, idx ${j}`);

        if (playable(coord)) {
          const piece = pieceFromSrc(src);
          if (piece) board[coord.r][coord.c] = piece;
          else board[coord.r][coord.c] = null;
        }
      }
    }

    return board;
  }

  /** Get locator for a specific cell image by coordinate. */
  cellLocator({ r, c }: Coord): Locator {
    return this.board.locator(`//img[@name="space${r}${c}"]`).first();
  }

  async clickCell(coord: Coord): Promise<void> {
    await this.cellLocator(coord).click();
  }

  /** After selecting a piece, try clicking the wrapping anchor; fallback to the image itself. */
  async clickDestination(coord: Coord): Promise<void> {
    const cellImg = this.cellLocator(coord);
    const anchor = cellImg.locator('xpath=ancestor::a[1]');
    if (await anchor.count()) await anchor.first().click();
    else await cellImg.click();
  }

  /** Executes a two-click move and waits for page/network to settle between clicks. */
  async doMove(from: Coord, to: Coord): Promise<void> {
    await this.clickCell(from);
    await this.clickDestination(to);
  }
}

/** Utility to count pieces by side for quick assertions. */
export function countPieces(board: Board, side: Side): number {
  let n = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c]?.side === side) n++;
  return n;
}
