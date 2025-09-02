import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {
  ApiCallResult,
  DrawResponse,
  NewDeckResponse,
  ShuffleResponse,
  ApiCard,
  PlayerId,
} from '../domain/types';

async function asJson<T>(resp: APIResponse): Promise<ApiCallResult<T>> {
  try {
    const data = (await resp.json()) as T;
    return { response: resp, data };
  } catch {
    return { response: resp };
  }
}

export class DeckService {
  private readonly request: APIRequestContext;
  private readonly apiBase = '/api/deck';
  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async newDeck(): Promise<ApiCallResult<NewDeckResponse>> {
    const resp = await this.request.get(`${this.apiBase}/new/`);

    return asJson<NewDeckResponse>(resp);
  }

  async shuffle(deckId: string, remainingOnly = false): Promise<ApiCallResult<ShuffleResponse>> {
    const url = `${this.apiBase}/${deckId}/shuffle/${remainingOnly ? '?remaining=true' : ''}`;
    const resp = await this.request.get(url);

    return asJson<ShuffleResponse>(resp);
  }

  async draw(deckId: string, count = 1): Promise<ApiCallResult<DrawResponse>> {
    const resp = await this.request.get(`${this.apiBase}/${deckId}/draw/?count=${count}`);

    return asJson<DrawResponse>(resp);
  }

  /**
   * Convenience: deal to players in round-robin order using a single draw call.
   * Returns the raw DrawResponse plus a simple distribution map.
   */
  async dealToPlayers(
    deckId: string,
    players: PlayerId[],
    cardsPerPlayer: number,
  ): Promise<ApiCallResult<DrawResponse> & { dealt?: Record<PlayerId, ApiCard[]> }> {
    const total = players.length * cardsPerPlayer;
    const result = await this.draw(deckId, total);
    if (!result.data?.cards) return { ...result };

    if (players.length === 0 || cardsPerPlayer <= 0) {
      return { ...result };
    }

    // Explicitly initialize the two known PlayerId keys to satisfy Record<PlayerId, ApiCard[]>
    const dealt: Record<PlayerId, ApiCard[]> = { P1: [], P2: [] };

    // Preserve deck order: P1 → P2 → P1 → P2 ...
    result.data.cards.forEach((card, idx) => {
      const pid: PlayerId = players[idx % players.length];
      dealt[pid].push(card);
    });

    return { ...result, dealt };
  }
}
