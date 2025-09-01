import { APIRequestContext, expect } from '@playwright/test';
import { toCard, toDeck } from '../domain/mappers';
import {
  DrawResponseDTO,
  NewDeckResponseDTO,
  ShuffleResponseDTO,
  Card,
  Hand,
  Deck
} from '../domain/models';


/**
 * Strongly-typed wrapper over Deck of Cards API using Playwright's request client.
 * Base path assumed from Playwright project's baseURL.
 */
export class DeckService {
  private readonly request: APIRequestContext;
  private readonly apiBase = '/api/deck';

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /** GET /api/deck/new/ or /api/deck/new/shuffle/?deck_count=n */
  async newDeck(options?: { shuffled?: boolean; deckCount?: number }): Promise<Deck> {
    const params = new URLSearchParams();
    if (options?.deckCount) params.set('deck_count', String(options.deckCount));

    const path = options?.shuffled ? `/new/shuffle/` : `/new/`;
    const res = await this.request.get(`${this.apiBase}${path}?${params.toString()}`);

    expect(res.ok()).toBeTruthy();

    const json = (await res.json()) as NewDeckResponseDTO;
    return toDeck(json);
  }

  /** GET /api/deck/{deck_id}/shuffle/?remaining=true|false */
  async shuffle(deckId: string, remaining = false): Promise<Deck> {
    const res = await this.request.get(
      `${this.apiBase}/${deckId}/shuffle/?remaining=${remaining ? 'true' : 'false'}`
    );

    expect(res.ok()).toBeTruthy();

    const json = (await res.json()) as ShuffleResponseDTO;

    return { deckId: json.deck_id, shuffled: json.shuffled, remaining: json.remaining };
  }

  /** GET /api/deck/{deck_id}/draw/?count=n */
  async draw(deckId: string, count: number): Promise<{ cards: Card[]; remaining: number }> {
    const res = await this.request.get(`${this.apiBase}/${deckId}/draw/?count=${count}`);

    expect(res.ok()).toBeTruthy();

    const json = (await res.json()) as DrawResponseDTO;
    const cards = json.cards.map(toCard);

    return { cards, remaining: json.remaining };
  }

  /** Deal to N players with K cards each (draws N*K once then slices). */
  async deal(deckId: string, players: number, cardsEach: number): Promise<Hand[]> {
    const total = players * cardsEach;
    const { cards } = await this.draw(deckId, total);

    const hands: Hand[] = [];
    for (let p = 0; p < players; p++) {
      const start = p * cardsEach;
      hands.push({ cards: cards.slice(start, start + cardsEach) });
    }

    return hands;
  }
}