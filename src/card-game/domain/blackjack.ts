import { Card, Hand, Face } from './models';

/**
 * Blackjack hand evaluation with standard values.
 * - Number cards: face value
 * - Face cards (J,Q,K): 10
 * - Ace: 1 or 11, whichever yields highest <= 21 (soft) else hard
 */
export class Blackjack {
  private faceToValue(face: Face): number[] {
    switch (face) {
      case 'ACE':
        return [1, 11];
      case 'JACK':
      case 'QUEEN':
      case 'KING':
        return [10];
      default:
        return [parseInt(face, 10)];
    }
  }

  /** Best value for a set of cards, with soft-ace handling. */
  bestValue(cards: Card[]): { best: number; isSoft: boolean } {
    let total = 0;
    let aces = 0;

    for (const c of cards) {
      const vals = this.faceToValue(c.value);
      if (vals.length === 2) aces += 1;
      total += vals[0]; // count Aces as 1 initially
    }

    // Try to upgrade some Aces to 11 while staying <= 21
    let soft = false;
    for (let i = 0; i < aces; i++) {
      if (total + 10 <= 21) {
        total += 10;
        soft = true;
      }
    }

    return { best: total, isSoft: soft };
  }

  /** Natural blackjack = exactly two cards totaling 21. */
  hasBlackjack(hand: Hand): boolean {
    if (hand.cards.length < 2) return false;
    const { best } = this.bestValue(hand.cards.slice(0, 2));
    return best === 21;
  }

  isBust(hand: Hand): boolean {
    return this.bestValue(hand.cards).best > 21;
  }
}