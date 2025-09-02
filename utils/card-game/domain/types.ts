import { APIResponse } from '@playwright/test';
export type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';
export type Rank =
  | 'ACE'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'JACK'
  | 'QUEEN'
  | 'KING';

export interface ApiCard {
  code: string; // e.g., "AS" (Ace of Spades), "0D" (Ten of Diamonds)
  image: string;
  images?: { svg: string; png: string };
  value: string; // API returns e.g., "ACE", "KING", "2" ...
  suit: Suit;
}

export interface NewDeckResponse {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

export interface ShuffleResponse {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

export interface DrawResponse {
  success: boolean;
  deck_id: string;
  cards: ApiCard[];
  remaining: number;
}

export type PlayerId = 'P1' | 'P2';

export interface ScoreBreakdown {
  bestValue: number; // best total <= 21 if possible, else minimal over 21
  isSoft: boolean; // true if bestValue uses an Ace as 11
  isBust: boolean; // > 21
  isNaturalBlackjack: boolean; // exactly 21 with 2 cards
}

export interface PlayerSummary {
  playerId: PlayerId;
  codes: string[]; // e.g., ["AS", "0D", "5H"]
  score: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean; // natural blackjack
}

export interface RoundSummary {
  deckId: string;
  players: PlayerSummary[];
  winner: PlayerId | 'tie' | null;
}

export interface ApiCallResult<T> {
  response: APIResponse;
  data?: T;
}

export function cardCodeList(cards: ApiCard[]): string[] {
  return cards.map((c) => c.code);
}
