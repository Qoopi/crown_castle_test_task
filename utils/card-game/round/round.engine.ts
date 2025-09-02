import { evaluateHand } from '../domain/blackjack';
import { DeckService } from '../services/deck.service';
import { RoundLogger } from './round.logger';
import type {
  ApiCallResult,
  ApiCard,
  DrawResponse,
  NewDeckResponse,
  PlayerId,
  ShuffleResponse,
} from '../domain/types';

export interface RoundState {
  deckId: string | null;
  hands: Record<PlayerId, ApiCard[]>;
}

export class RoundEngine {
  private readonly logger: RoundLogger;
  private readonly deck: DeckService;
  private state: RoundState = {
    deckId: null,
    hands: { P1: [], P2: [] },
  };

  constructor(deck: DeckService, logger: RoundLogger) {
    this.deck = deck;
    this.logger = logger;
  }

  /** Create a new deck and shuffle it. */
  async startRound(): Promise<{
    newDeck: ApiCallResult<NewDeckResponse>;
    shuffle?: ApiCallResult<ShuffleResponse>;
  }> {
    this.state = { deckId: null, hands: { P1: [], P2: [] } };
    const newDeck = await this.deck.newDeck();
    if (newDeck.data?.deck_id) this.state.deckId = newDeck.data.deck_id;

    let shuffle: ApiCallResult<ShuffleResponse> | undefined;
    if (this.state.deckId) {
      shuffle = await this.deck.shuffle(this.state.deckId);
    }

    return { newDeck, shuffle };
  }

  /** Deal initial 2 cards each in sequence: P1 → P2 → P1 → P2 */
  async dealInitial(): Promise<
    ApiCallResult<DrawResponse> & { dealt?: Record<PlayerId, ApiCard[]> }
  > {
    if (!this.state.deckId) return this.noDeckResult<DrawResponse>();

    const res = await this.deck.dealToPlayers(this.state.deckId, ['P1', 'P2'], 2);
    if (res.dealt) {
      this.state.hands = res.dealt;
    }

    return res;
  }

  /** Draw one card for the specified player. */
  async hit(player: PlayerId) {
    if (!this.state.deckId) return this.noDeckResult<DrawResponse>();
    const draw = await this.deck.draw(this.state.deckId, 1);
    const card = draw.data?.cards?.[0];
    if (card) this.state.hands[player].push(card);
    return draw;
  }

  /** Quick check: does anyone have a natural blackjack after the initial deal? */
  hasNaturalBlackjack(): { P1: boolean; P2: boolean } {
    const { P1, P2 } = this.state.hands;
    return {
      P1: evaluateHand(P1).isNaturalBlackjack,
      P2: evaluateHand(P2).isNaturalBlackjack,
    };
  }

  getHands() {
    const { P1, P2 } = this.state.hands;
    return { P1: [...P1], P2: [...P2] };
  }


  /** Summarize + log round state (non-destructive). */
  summarizeAndLog() {
    return this.logger.summarizeRound({
      deckId: this.state.deckId ?? 'unknown',
      hands: this.getHands(),
    });
  }
  private noDeckResult<T>(): ApiCallResult<T> {
    // Matches current contract: tests check `response` and `data`
    return { response: undefined as any };
  }
}
