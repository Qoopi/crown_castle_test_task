import { Page, Locator } from '@playwright/test';
import { Board, Coord, Piece, Side } from './types';

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
  return null; // light square, empty, or other decoration
}

export function idx({ r, c }: Coord): number {
  return r * 8 + c;
}

export class BoardParser {
  private readonly page: Page;
  private readonly board: Locator;
  private readonly lines: Locator;
  private readonly images: Locator;

  constructor(page: Page) {
    this.page = page;
    this.board = this.page.locator('//div[@id="board"]');
    this.lines = this.board.locator('//div[@class="line"]');
    this.images = this.page.locator('//img[contains(@name,"space")]');

  }

  /** Parse current DOM into a Board (8x8). */
  async parse(): Promise<Board> {
    const count = await this.images.count();

    // Collect 64 (or more) images; take the first 64 that correspond to board tiles.
    const N = Math.min(64, count);
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));

    for (let i = 0; i < N; i++) {
      const src = (await this.images.nth(i).getAttribute('src')) || '';
      const r = Math.floor(i / 8);
      const c = i % 8;
      // Only interpret dark squares (playable) as real cells; others remain null
      const piece = pieceFromSrc(src || '');
      if (piece && (r + c) % 2 === 1) {
        board[r][c] = piece;
      } else if ((r + c) % 2 === 1) {
        // explicitly mark empty playable square
        board[r][c] = null;
      }
    }
    return board;
  }

  /** Get locator for cell at coord, targeting the IMG (or wrapped A>IMG). */
  cellLocator(coord: Coord): Locator {
    return this.page.locator('img').nth(idx(coord));
  }

  async clickCell(coord: Coord): Promise<void> {
    await this.cellLocator(coord).click();
  }

  /** After clicking a piece, legal destinations become anchors. Prefer clicking the anchor wrapping the IMG. */
  async clickDestination(coord: Coord): Promise<void> {
    const cellImg = this.cellLocator(coord);
    const anchor = cellImg.locator('xpath=ancestor::a[1]');
    if (await anchor.count()) {
      await anchor.first().click();
    } else {
      // fallback to clicking the image itself
      await cellImg.click();
    }
  }

  /**
   * Executes a two-click move: selects piece at `from`, then clicks destination `to`.
   * The page reloads between clicks; we wait for network idle.
   */
  async doMove(from: Coord, to: Coord): Promise<void> {
    await this.clickCell(from);
    await this.page.waitForLoadState('networkidle');
    await this.clickDestination(to);
    await this.page.waitForLoadState('networkidle');
  }

  /** Waits for the computer to reply by waiting for another page load. */
  async waitForOpponent(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}

/** Utility to count pieces by side for quick assertions. */
export function countPieces(board: Board, side: Side): number {
  let n = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c]?.side === side) n++;
  return n;
}
