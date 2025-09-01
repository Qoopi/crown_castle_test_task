import { Page, Locator } from '@playwright/test';
import { BoardParser, countPieces } from '../utils/board';
import { Board, Move, Side, Coord } from '../utils/types';
import { planMove } from '../utils/planner';

// const STATUS_TEXT_XPATH = '//p[@id="message" and contains(text(),"Make a move.")]';
const STATUS_TEXT_XPATH = '//p[@id="message" and contains(text(),"Make a move.") or contains(text(),"Click on your orange piece, then click where you want to move it.")]';
const RESTART_LINK_XPATH = '//a[contains(text(),"Restart")]';


export class CheckersPage {
  private readonly boardParser: BoardParser;
  readonly page: Page;
  readonly makeMoveText: Locator;
  readonly restartLink: Locator;

  constructor(page: Page) {
    this.boardParser = new BoardParser(page);
    this.page = page;
    this.makeMoveText = page.locator(STATUS_TEXT_XPATH);
    this.restartLink = page.locator(RESTART_LINK_XPATH);
  }

  async openPage() {
    await this.page.goto('');
  }

  async readBoard(): Promise<Board> {
    return await this.boardParser.parse();
  }

  async piecesCount(side: Side): Promise<number> {
    const board = await this.readBoard();
    return countPieces(board, side);
  }

  /** Plans and performs one legal move for YOU (or specified side). */
  async planAndMove(side: Side = 'YOU'): Promise<Move | null> {
    const board = await this.boardParser.parse();
    const move = planMove(board, side);

    if (!move) return null;

    await this.boardParser.doMove(move.from, move.to);

    return move;
  }

  /** Perform an explicit move by coordinates. */
  async makeMove(from: Coord, to: Coord): Promise<void> {
    await this.boardParser.doMove(from, to);
  }

  /** Waits for the computer to reply by waiting for another network-idle. */
  async waitForOpponent(): Promise<void> {
    await this.makeMoveText.waitFor({ state: 'visible', timeout: 10_000 });
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
    await this.restartLink.click();
  }

  /** Compact board signature for quick equality checks. */
  async boardSignature(): Promise<string> {
    const b = await this.readBoard();

    return b.map((row) => JSON.stringify(row)).join('\n');
  }
}
