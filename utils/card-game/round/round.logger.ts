import type { ApiCard, PlayerId, RoundSummary } from '../domain/types';
import { evaluateHand } from '../domain/blackjack';

type PlayerSummary = {
  playerId: PlayerId;
  codes: string[];
  score: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean;
};

export class RoundLogger {
  summarizeRound(input: { deckId: string; hands: Record<PlayerId, ApiCard[]> }): RoundSummary {
    const [s1, s2] = (['P1', 'P2'] as const).map((playerId) =>
      buildPlayerSummary(playerId, input.hands[playerId]),
    );

    const winner = decideWinner(s1, s2);

    const summary: RoundSummary = {
      deckId: input.deckId,
      players: [s1, s2],
      winner,
    };

    // Needed to follow exercise logic
    // eslint-disable-next-line no-console
    console.log(
      `[deck ${input.deckId}] ${formatPlayerSummary(s1)} | ${formatPlayerSummary(s2,)} → winner: ${winner ?? 'n/a'}`,
    );

    return summary;
  }
}

function buildPlayerSummary(playerId: PlayerId, cards: ApiCard[]): PlayerSummary {
  const evaluated = evaluateHand(cards);
  return {
    playerId,
    codes: cards.map((c) => c.code),
    score: evaluated.bestValue,
    isSoft: evaluated.isSoft,
    isBust: evaluated.isBust,
    isBlackjack: evaluated.isNaturalBlackjack,
  };
}

function formatPlayerSummary(s: PlayerSummary): string {
  const tags = [s.isBlackjack ? 'BLACKJACK' : null, s.isBust ? 'BUST' : null]
    .filter(Boolean)
    .join(',');
  const hardSoft = s.isSoft ? 'soft' : 'hard';
  return `${s.playerId}:${s.codes.join(',')} (${s.score},${hardSoft}${tags ? ',' + tags : ''})`;
}

function decideWinner(
  a: { score: number; isBust: boolean; isBlackjack: boolean; playerId: PlayerId },
  b: { score: number; isBust: boolean; isBlackjack: boolean; playerId: PlayerId },
): PlayerId | 'tie' | null {
  // Natural blackjack beats any non-blackjack 21.
  if (a.isBlackjack && !b.isBlackjack) return a.playerId;
  if (b.isBlackjack && !a.isBlackjack) return b.playerId;

  if (a.isBust && b.isBust) return 'tie';
  if (a.isBust) return b.playerId;
  if (b.isBust) return a.playerId;

  if (a.score > b.score) return a.playerId;
  if (b.score > a.score) return b.playerId;
  return 'tie';
}
