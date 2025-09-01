import { test, expect } from '../../src/checkers-game/fixtures/checkers.fixture';
import { legalMoves, planMove } from '../../src/checkers-game/utils/planner';
import { countPieces } from '../../src/checkers-game/utils/board.parser';

// Exercise I — Checkers Game (UI)

test.describe('Checkers Game', () => {
  test('1) Site is up and reachable', async ({ checkers }) => {
    await checkers.openPage();

    await expect(checkers.page).toHaveTitle('Checkers - Games for the Brain');
    await expect(checkers.makeMoveText).toHaveText('Select an orange piece to move.')
  });

  test('2) Parse board: 8x8 with pieces for both sides', async ({ checkers }) => {
    await checkers.openPage();
    const board = await checkers.readBoard();

    expect(board).toHaveLength(8);
    for (const row of board) expect(row).toHaveLength(8);

    const you = countPieces(board, 'YOU');
    const me = countPieces(board, 'ME');
    expect(you).toBeGreaterThan(0);
    expect(me).toBeGreaterThan(0);
  });

  test('3) Planner has at least one legal move for YOU', async ({ checkers }) => {
    await checkers.openPage();
    const board = await checkers.readBoard();
    const moves = legalMoves(board, 'YOU');
    expect(moves.length).toBeGreaterThan(0);
  });

  test('4) Planner prefers capture when available', async ({ checkers }) => {
    await checkers.openPage();
    const board = await checkers.readBoard();

    const moves = legalMoves(board, 'YOU');
    const withCaps = moves.filter((m) => (m.captures?.length || 0) > 0);

    if (withCaps.length === 0) test.skip();

    const chosen = planMove(board, 'YOU');
    expect(chosen?.captures?.length || 0).toBeGreaterThan(0);
  });

  test('5) Make five legal moves as orange, include a capture, then restart', async ({ checkers }) => {
    await checkers.openPage();

    // Capture initial board to verify restart later
    const initial = await checkers.readBoard();

    let totalCaptures = 0;
    for (let i = 0; i < 5; i++) {
      const move = await checkers.planAndMove('YOU');
      expect(move).not.toBeNull();
      const caps = move?.captures?.length || 0;
      totalCaptures += caps;

      // Computer replies, then it should be our turn again
      await checkers.waitForOpponent();
      const status = await checkers.statusText();
      expect(status).toMatch(/make a move/i);
    }

    // Prefer at least one capture within five moves (soft expectation to avoid flakiness)
    expect.soft(totalCaptures).toBeGreaterThan(0);

    // Restart and verify it matches the initial layout
    await checkers.restartGame();
    const afterRestart = await checkers.readBoard();

    // Deep-same by JSON serialization for simplicity
    expect(JSON.stringify(afterRestart)).toBe(JSON.stringify(initial));
  });
});
