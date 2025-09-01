import { test, expect } from '../../src/card-game/fixtures/card.game.fixture';
import { CardsHomePage } from '../../src/card-game/pages/home.page';

// Exercise II — Card Game (API)

test.describe('Deck of Cards', () => {
  test('1) Site is up and reachable', async ({ page }) => {
    const home = new CardsHomePage(page);
    await home.open();
    await expect(home.title).toHaveText('Deck of Cards');
    await expect(home.subtitle).toHaveText('An API');
  });

  test('2) Create a new deck', async ({ deckService }) => {
    const deck = await deckService.newDeck();
    expect(deck.deckId).toMatch(/^[a-z0-9]+$/i);
    expect(deck.shuffled).toBe(false);
    expect(deck.remaining).toBe(52);
  });

  test('3) Shuffle deck (same deck id, now shuffled)', async ({ deckService }) => {
    const deck = await deckService.newDeck();
    expect(deck.shuffled).toBe(false);

    const shuffled = await deckService.shuffle(deck.deckId);
    expect(shuffled.deckId).toBe(deck.deckId);
    expect(shuffled.shuffled).toBe(true);
    expect(shuffled.remaining).toBe(52);
  });

  test('4) Initial deal: sequential (2 cards each), check natural blackjack', async ({ roundEngine, }) => {
    await roundEngine.startRound({ shuffled: true });
    const hands = await roundEngine.dealInitial(2);

    expect(hands[0].cards).toHaveLength(2);
    expect(hands[1].cards).toHaveLength(2);

    roundEngine.summarizeAndLog();

    expect(hands[0].cards[0].code).toMatch(/^[0-9AJQK]{1,2}[SCHD]$/i);
    expect(hands[1].cards[0].code).toMatch(/^[0-9AJQK]{1,2}[SCHD]$/i);
  });

  test('5) If no natural blackjack, hit once each (sequential), then summarize', async ({
    roundEngine,
  }) => {
    await roundEngine.startRound({ shuffled: true });
    await roundEngine.dealInitial(2);

    const p1Nat = roundEngine.hasNaturalBlackjack(0);
    const p2Nat = roundEngine.hasNaturalBlackjack(1);

    //Done this intentionally to follow the natural blackjack logic
    if (!p1Nat) await roundEngine.hit(0, 1);
    if (!p2Nat) await roundEngine.hit(1, 1);

    const summary = roundEngine.summarizeAndLog();
    const [p1, p2] = roundEngine.getHands();

    expect(p1.cards[0].code).toMatch(/^[0-9AJQK]{1,2}[SCHD]$/i);
    expect(p2.cards[0].code).toMatch(/^[0-9AJQK]{1,2}[SCHD]$/i);
    expect.soft(summary.p1.score).toBeGreaterThan(0);
    expect.soft(summary.p2.score).toBeGreaterThan(0);
  });
});
