import { DeckService } from './deck.service';
import { Blackjack } from '../domain/blackjack';
import { Hand } from '../domain/models';
import { summarizeRound, RoundSummary } from '../utils/round.summary';

export class RoundEngine {
  private readonly deckService: DeckService;
  private readonly blackjack: Blackjack;
  private deckId: string | null = null;
  private hands: [Hand, Hand] = [{ cards: [] }, { cards: [] }];

  constructor(deckService: DeckService, blackjack: Blackjack) {
    this.deckService = deckService;
    this.blackjack = blackjack;
  }

  async startRound(options?: { shuffled?: boolean; deckCount?: number }): Promise<string> {
    const deck = await this.deckService.newDeck({ shuffled: true, ...options });
    this.deckId = deck.deckId;
    this.hands = [{ cards: [] }, { cards: [] }];
    return deck.deckId;
  }

  /** Deal sequentially: P1, P2, P1, P2 (two cards each). */
  async dealInitial(players = 2): Promise<[Hand, Hand]> {
    if (!this.deckId) throw new Error('Call startRound() first');
    if (players !== 2) throw new Error('This demo engine supports exactly 2 players');

    for (let i = 0; i < players * 2; i++) {
      const p = i % players; // 0,1,0,1
      const draw = await this.deckService.draw(this.deckId, 1);
      this.hands[p].cards.push(draw.cards[0]);
    }
    return this.hands;
  }

  /** Draws one card for the specified player (0 or 1). */
  async hit(playerIndex: 0 | 1, count = 1): Promise<Hand> {
    if (!this.deckId) throw new Error('Call startRound() first');

    for (let i = 0; i < count; i++) {
      const draw = await this.deckService.draw(this.deckId, 1);
      this.hands[playerIndex].cards.push(draw.cards[0]);
    }

    return this.hands[playerIndex];
  }

  getHands(): [Hand, Hand] {
    return this.hands;
  }

  /** Natural blackjack = first two cards 21. */
  hasNaturalBlackjack(playerIndex: 0 | 1): boolean {
    const hand = this.hands[playerIndex];
    return this.blackjack.hasBlackjack({ cards: hand.cards });
  }

  /** Convenience: summarize & (internally) log via summarizeRound. */
  summarizeAndLog(): RoundSummary {
    return summarizeRound(this.blackjack, this.hands);
  }
}
