import { cardGameTest as test, expect } from '../../utils/card-game/fixtures/card.fixture';

test.describe('The Cards Game', () => {
  test('NavigateToWebsite_ItsUpAndRunning', async ({ cardsHomePage }) => {
    await cardsHomePage.open();

    await expect(cardsHomePage.title).toHaveText('Deck of Cards');
    await expect(cardsHomePage.subtitle).toHaveText('An API');
  });
  test('CreateNewDeck_ItsCreatedAndNotShuffled', async ({ deckService }) => {
    const res = await deckService.newDeck();

    expect(res.response.ok()).toBeTruthy();
    expect(res.data?.success).toBeTruthy();
    expect(typeof res.data?.deck_id).toBe('string');
    expect(res.data?.deck_id).toMatch(/^[a-z0-9]+$/i);
    expect(res.data?.remaining).toBe(52);
    expect(res.data?.shuffled).toBe(false);
  });
  test('ShuffleCards_ReturnCorrectDeckIdAndShuffledTrue', async ({ deckService }) => {
    const created = await deckService.newDeck();
    const id = created.data!.deck_id;
    const shuffled = await deckService.shuffle(id);

    expect(created.response.ok()).toBeTruthy();
    expect(created.data?.shuffled).toBe(false);
    expect(shuffled.response.ok()).toBeTruthy();
    expect(shuffled.data?.deck_id).toBe(id);
    expect(shuffled.data?.shuffled).toBe(true);
  });
  test('(e2e)_Distributes2CardsToEachPlayer_CheckForBlakjack', async ({ roundEngine }) => {
    const { newDeck, shuffle } = await roundEngine.startRound();
    expect(newDeck.response.ok()).toBeTruthy();
    expect(shuffle?.response.ok()).toBeTruthy();

    const deal = await roundEngine.dealInitial();
    expect(deal.response.ok()).toBeTruthy();
    expect(deal.data?.cards?.length).toBe(4);

    const hands = roundEngine.getHands();
    expect(hands.P1.length).toBe(2);
    expect(hands.P2.length).toBe(2);

    const summary = roundEngine.summarizeAndLog();
    expect(summary.deckId).toEqual(newDeck.data?.deck_id ?? 'unknown');
    expect(summary.players.length).toBe(2);

    for (const p of summary.players) {
      expect(Array.isArray(p.codes)).toBe(true);
      expect(p.codes.length).toBe(2);
      expect(typeof p.score).toBe('number');
      expect(typeof p.isSoft).toBe('boolean');
      expect(typeof p.isBust).toBe('boolean');
      expect(typeof p.isBlackjack).toBe('boolean');
    }
  });
  test('(e2e)_IfNoNaturalsBlackjack_PlayersHitOneMoreTime_CheckWhoWins', async ({ roundEngine }) => {
    const { newDeck, shuffle } = await roundEngine.startRound();
    expect(newDeck.response.ok()).toBeTruthy();
    expect(shuffle?.response.ok()).toBeTruthy();

    const deal = await roundEngine.dealInitial();
    expect(deal.response.ok()).toBeTruthy();

    const naturals = roundEngine.hasNaturalBlackjack();

    //This if here to follow the natural blackjack logic
    if (!naturals.P1 && !naturals.P2) {
      const hit1 = await roundEngine.hit('P1');
      const hit2 = await roundEngine.hit('P2');
      expect(hit1.response.ok()).toBeTruthy();
      expect(hit2.response.ok()).toBeTruthy();
    }

    const hands = roundEngine.getHands();
    const expectedLen = !naturals.P1 && !naturals.P2 ? 3 : 2;
    expect(hands.P1.length).toBe(expectedLen);
    expect(hands.P2.length).toBe(expectedLen);

    const summary = roundEngine.summarizeAndLog();
    for (const p of summary.players) {
      expect(p.codes.length).toBe(expectedLen);
      expect(typeof p.score).toBe('number');
    }
  });
});
