import { Hand } from '../domain/models';
import { Blackjack } from '../domain/blackjack';

export interface PlayerSummary {
  handCodes: string;
  score: number;
  soft: boolean;
  blackjack: boolean;
  bust: boolean;
}

export interface RoundSummary {
  p1: PlayerSummary;
  p2: PlayerSummary;
  blackjackNote: string | null; // "Blackjack: Player 1", "Blackjack: Both players", or null
  bustNote: string | null; // "Busted: Player 1", "Busted: Both players", or null
}

export function summarizeRound(bj: Blackjack, hands: [Hand, Hand]): RoundSummary {
  const [p1, p2] = hands;
  const s1 = summarizePlayer(bj, p1);
  const s2 = summarizePlayer(bj, p2);

  let blackjackNote: string | null = null;
  if (s1.blackjack || s2.blackjack) {
    blackjackNote = `Blackjack: ${s1.blackjack && s2.blackjack ? 'Both players' : s1.blackjack ? 'Player 1' : 'Player 2'}`;
  }

  let bustNote: string | null = null;
  if (!blackjackNote) {
    if (s1.bust || s2.bust) {
      bustNote = `Busted: ${s1.bust && s2.bust ? 'Both players' : s1.bust ? 'Player 1' : 'Player 2'}`;
    }
  }

  const summary: RoundSummary = { p1: s1, p2: s2, blackjackNote, bustNote };

  for (const line of formatRoundLogLines(summary)) {
    // eslint-disable-next-line no-console
    console.log(line);
  }

  return summary;
}
function summarizePlayer(bj: Blackjack, hand: Hand): PlayerSummary {
  const evalv = bj.bestValue(hand.cards);
  return {
    handCodes: hand.cards.map((c) => c.code).join(' '),
    score: evalv.best,
    soft: evalv.isSoft,
    blackjack: bj.hasBlackjack({ cards: hand.cards }),
    bust: bj.isBust({ cards: hand.cards }),
  };
}

function formatRoundLogLines(summary: RoundSummary): string[] {
  const lines: string[] = [];
  lines.push(
    `P1 Hand: ${summary.p1.handCodes} | Score: ${summary.p1.score}${summary.p1.soft ? ' (soft)' : ''}`,
  );
  lines.push(
    `P2 Hand: ${summary.p2.handCodes} | Score: ${summary.p2.score}${summary.p2.soft ? ' (soft)' : ''}`,
  );

  if (summary.blackjackNote) lines.push(summary.blackjackNote);
  else if (summary.bustNote) lines.push(summary.bustNote);
  else lines.push('No blackjack and no bust.');

  return lines;
}
