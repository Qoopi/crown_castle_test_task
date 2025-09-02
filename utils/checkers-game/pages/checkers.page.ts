import type { Page, Locator } from '@playwright/test';
import type { Board, Move, Piece } from '../helpers/board.types';
import { emptyBoard, pieceFromSrc, setSquare } from '../helpers/board.parser';
import { HARD_SCENARIO } from '../helpers/hardcoded.scenario';

export class CheckersPage {
  private cells: Locator[][] | null = null;
  readonly page: Page;
  readonly board: Locator;
  readonly makeMoveText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.board = page.locator('#board');
    this.makeMoveText = page.locator('//p[@id="message"]');
  }

  async goto() {
    await this.page.goto('');
  }

  async getStatusText(): Promise<string | null> {
    return await this.makeMoveText.textContent();
  }
  async readCounts() {
    const orange = await this.page.locator('//img[@src="you1.gif"]').count();
    console.log(`Orange pieces: ${orange}`);
    const blue = await this.page.locator('//img[@src="me1.gif"]').count();
    console.log(`Blue pieces: ${blue}`);
    return { orange, blue };
  }

  async pieceAt(r: number, c: number): Promise<Piece> {
    const src = (await this.cell(r, c).getAttribute('src')) || '';
    const low = src.toLowerCase();
    if (low.includes('you')) return 'orange';
    if (low.includes('me')) return 'blue';
    return null;
  }

  async makeMoveByCoords(r1: number, c1: number, r2: number, c2: number) {
    //Choose the square you want to move from
    await this.clickSquare(r1, c1);
    //Move the piece to the square you want to move to
    await this.clickSquare(r2, c2);
  }

  async makeMove(move: Move) {
    await this.makeMoveByCoords(move.from.r, move.from.c, move.to.r, move.to.c);
  }

  async waitForOpponent() {
    // Wait for the opponent to move (the "Make a move." message appears)
    await this.page
      .locator('//p[@id="message" and contains(text(),"Make a move.")]')
      .waitFor({ state: 'visible' });
  }

  async restartGame() {
    await this.page.locator('//a[text()="Restart..."]').click();
  }

  async readBoard(): Promise<Board> {
    const board = emptyBoard();
    for (let r = 1; r <= 8; r++) {
      for (let c = 1; c <= 8; c++) {
        const src = (await this.cell(r, c).getAttribute('src')) || '';
        const info = pieceFromSrc(src);
        setSquare(board, r, c, info);
      }
    }
    return board;
  }

  async playFiveScenarioMovesAndCounts(scenario: Move[] = HARD_SCENARIO) {
    const after4 = { orange: 0, blue: 0 };
    const after5 = { orange: 0, blue: 0 };

    for (let i = 0; i < 5; i++) {
      await this.makeMove(scenario[i]);
      await this.waitForOpponent();

      if (i === 3) {
        const counts = await this.readCounts();
        after4.orange = counts.orange;
        after4.blue = counts.blue;
      }
      if (i === 4) {
        const counts = await this.readCounts();
        after5.orange = counts.orange;
        after5.blue = counts.blue;
      }
    }

    return { after4, after5 };
  }

  private cell(r: number, c: number) {
    const name = `space${r - 1}${c - 1}`; // DOM is 0-based
    return this.page.locator(`//img[@name="${name}"]`);
  }

  private async clickSquare(r: number, c: number) {
    console.log(`Clicking square ${r},${c}`);
    const img = this.cell(r, c);
    await img.waitFor({ state: 'visible' });
    await img.click();
  }
}
