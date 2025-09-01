import { test, expect } from '../../src/checkers-game/fixtures/checkers.fixture';
import { countPieces } from '../../src/checkers-game/utils/board';

// Exercise I — Checkers Game (UI) — simplified and robust

test.describe('Checkers — UI flow', () => {
  test('1) Page loads and status is visible', async ({ checkers }) => {
    await checkers.openPage();

    await expect(checkers.page).toHaveTitle('Checkers - Games for the Brain');
    await expect(checkers.makeMoveText).toHaveText('Select an orange piece to move.');
  });

  test('2) Parse board: 8×8 and both sides present', async ({ checkers }) => {
    await checkers.openPage();
    const board = await checkers.readBoard();

    expect(board).toHaveLength(8);
    for (const row of board) expect(row).toHaveLength(8);

    const you = countPieces(board, 'YOU');
    const me = countPieces(board, 'ME');
    expect(you).toBeGreaterThan(0);
    expect(me).toBeGreaterThan(0);
  });

  test('3) Make a legal move, wait for opponent, then restart to initial position', async ({
    checkers,
  }) => {
    await checkers.openPage();

    const initial = await checkers.readBoard();
    await checkers.planAndMove('YOU');
    await checkers.waitForOpponent()

    await checkers.restartGame();
    const afterRestart = await checkers.readBoard();

    expect(JSON.stringify(afterRestart)).toBe(JSON.stringify(initial));
  });
});
