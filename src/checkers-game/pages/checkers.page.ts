import { Page, expect, Locator } from '@playwright/test';
import { BoardParser, countPieces } from '../utils/board.parser';
import { Board, Move, Side, Coord } from '../utils/types';
import { planMove } from '../utils/planner';

export class CheckersPage {
  readonly page: Page;
  readonly makeMoveText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.makeMoveText = page.locator('//p[@id="message"]');
  }

  async openPage() {
    await this.page.goto('');
  }

  parser(): BoardParser {
    return new BoardParser(this.page);
  }

  async readBoard(): Promise<Board> {
    return await this.parser().parse();
  }

  async piecesCount(side: Side): Promise<number> {
    const board = await this.readBoard();

    return countPieces(board, side);
  }

  /** Plans and performs one legal move for YOU (or specified side). */
  async planAndMove(side: Side = 'YOU'): Promise<Move | null> {
    const parser = this.parser();
    const board = await parser.parse();
    const move = planMove(board, side);
    if (!move) return null;

    await parser.doMove(move.from, move.to);
    return move;
  }

  /** Perform an explicit move by coordinates. */
  async makeMove(from: Coord, to: Coord): Promise<void> {
    const parser = this.parser();
    await parser.doMove(from, to);
  }

  async waitForOpponent(): Promise<void> {
    await this.parser().waitForOpponent();
  }

  /** Reads the status/instruction text, e.g., "Make a move." */
  async statusText(): Promise<string> {
    return (await this.makeMoveText.first().innerText()).trim();
  }

  /** Convenience: checks if it's currently YOUR turn. */
  async isYourTurn(): Promise<boolean> {
    const s = await this.statusText();
    return /make a move/i.test(s);
  }

  /** Wait until it's your turn (status shows "Make a move"). */
  async waitForYourTurn(timeout = 10000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.isYourTurn()) return;
      await this.page.waitForTimeout(200);
    }
    throw new Error('Timed out waiting for your turn');
  }

  /** Clicks the Restart link and waits for the board to reload. */
  async restartGame(): Promise<void> {
    const restart = this.page.getByRole('link', { name: /restart/i });
    if (await restart.count()) {
      await Promise.all([this.page.waitForLoadState('networkidle'), restart.first().click()]);
    } else {
      // Fallback: try any link containing "Restart"
      const any = this.page.locator('a:has-text("Restart")');
      await Promise.all([this.page.waitForLoadState('networkidle'), any.first().click()]);
    }
  }

  /** Compact board signature for quick equality checks. */
  async boardSignature(): Promise<string> {
    const b = await this.readBoard();
    return JSON.stringify(b);
  }
}
