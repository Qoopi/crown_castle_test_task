import { checkersTest as test, expect } from '../../utils/checkers-game/fixtures/checkers.fixture';
import { pieceAt, countPieces } from '../../utils/checkers-game/helpers/board.parser';
import { MY_MOVES, OPPONENT_MOVES } from '../../utils/checkers-game/helpers/hardcoded.scenario';

test.describe('The Checkers Game', () => {
  test.beforeEach(async ({ checkersPage }) => {
    await checkersPage.goto();
  })

  test('NavigateToWebsite_IsUpAndRunning', async ({ checkersPage }) => {
    const board = await checkersPage.readBoard();
    const counts = countPieces(board);

    // Basic presence checks
    await expect(checkersPage.page).toHaveTitle('Checkers - Games for the Brain');
    await expect(checkersPage.makeMoveText).toHaveText('Select an orange piece to move.');
    await expect(checkersPage.board).toBeVisible();
    expect(counts).toEqual({ orange: 12, blue: 12 });
  });

  test('FirstPlayersMove_PieceAtCorrectDestination', async ({ checkersPage }) => {
    const myMove = MY_MOVES[0];
    await checkersPage.makeMove(myMove);
    await checkersPage.waitForOpponentMoveToFinish(OPPONENT_MOVES[0].r, OPPONENT_MOVES[0].c);
    const board = await checkersPage.readBoard();
    expect(pieceAt(board, myMove.from.r, myMove.from.c)).not.toBe('orange');
    expect(pieceAt(board, myMove.to.r, myMove.to.c)).toBe('orange');
  });

  test('RestartTheGame_NewGameIsOnTheScreen', async ({ checkersPage }) => {
    await checkersPage.makeMove(MY_MOVES[0]);
    await checkersPage.waitForOpponentMoveToFinish(OPPONENT_MOVES[0].r, OPPONENT_MOVES[0].c);

    const textBefore = await checkersPage.getStatusText();
    await checkersPage.restartGame();

    const board = await checkersPage.readBoard();
    const counts = countPieces(board);
    expect(counts).toEqual({ orange: 12, blue: 12 });
    expect(textBefore).toBe('Make a move.');
    await expect(checkersPage.makeMoveText).toHaveText(/Select an orange piece to move./i);
  });

  test('(e2e)_Make5LegalMovesAndRestart', async ({ checkersPage }) => {
    const { after4, after5 } = await checkersPage.playFiveScenarioMovesAndCounts(MY_MOVES, OPPONENT_MOVES);

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

  test.afterAll(async ({ browser }) => {
    await browser.close();
  })
});
