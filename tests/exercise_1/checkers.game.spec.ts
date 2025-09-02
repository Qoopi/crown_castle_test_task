import { checkersTest as test, expect } from '../../utils/checkers-game/fixtures/checkers.fixture';
import { HARD_SCENARIO } from '../../utils/checkers-game/helpers/hardcoded.scenario';
import type { Board } from '../../utils/checkers-game/helpers/board.types';

test.describe('The Checkers Game', () => {
  test('site is up and initial counts are 12/12', async ({ checkersPage }) => {
    await checkersPage.goto();
    const board = await checkersPage.readBoard();
    const counts = countPieces(board);

    // Basic presence checks
    await expect(checkersPage.page).toHaveTitle('Checkers - Games for the Brain');
    await expect(checkersPage.makeMoveText).toHaveText('Select an orange piece to move.');
    await expect(checkersPage.board).toBeVisible();
    expect(counts).toEqual({ orange: 12, blue: 12 });
  });

  test('first scripted move places our piece at destination', async ({ checkersPage }) => {
    await checkersPage.goto();

    const mv = HARD_SCENARIO[0];
    await checkersPage.makeMove(mv);
    await checkersPage.waitForOpponent();

    const board = await checkersPage.readBoard();
    expect(pieceAt(board, mv.from.r, mv.from.c)).not.toBe('orange');
    expect(pieceAt(board, mv.to.r, mv.to.c)).toBe('orange');
  });

  test('restart resets to 12/12 and initial message', async ({ checkersPage }) => {
    await checkersPage.goto();
    await checkersPage.makeMove(HARD_SCENARIO[0]);
    await checkersPage.waitForOpponent();

    const textBefore = await checkersPage.getStatusText();
    await checkersPage.restartGame();

    const board = await checkersPage.readBoard();
    const counts = countPieces(board);
    expect(counts).toEqual({ orange: 12, blue: 12 });
    expect(textBefore).toBe('Make a move.');
    await expect(checkersPage.makeMoveText).toHaveText(/Select an orange piece to move./i,
    );
  });

  test('after 5 scripted moves, piece counts change as expected', async ({ checkersPage }) => {
    await checkersPage.goto();

    const { after4, after5 } = await checkersPage.playFiveScenarioMovesAndCounts(HARD_SCENARIO);

    // Expect after move 4 Orange has lost 1, after move 5 Blue has lost 1
    expect.soft(after4.orange).toBe(11);
    expect.soft(after4.blue).toBe(11);
    expect.soft(after5.orange).toBe(10);
    expect.soft(after5.blue).toBe(10);

    // Return to initial state
    await checkersPage.restartGame();
    const board = await checkersPage.readBoard();
    const counts = countPieces(board);
    expect(counts).toEqual({ orange: 12, blue: 12 });
  });
});

function pieceAt(board: Board, r: number, c: number) {
  return board[r - 1][c - 1]?.piece ?? null;
}

function countPieces(board: Board) {
  let orange = 0,
    blue = 0;
  for (const row of board)
    for (const sq of row) {
      if (sq.piece === 'orange') orange++;
      else if (sq.piece === 'blue') blue++;
    }
  return { orange, blue };
}
