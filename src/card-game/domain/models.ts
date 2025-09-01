export type Suit = 'SPADES' | 'HEARTS' | 'CLUBS' | 'DIAMONDS';
export type Face =
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

export interface Card {
  code: string;
  image: string;
  images?: { svg: string; png: string };
  value: Face;
  suit: Suit;
}

export interface Deck {
  deckId: string;
  shuffled: boolean;
  remaining: number;
}

export interface Hand {
  cards: Card[];
}

// Raw API responses (DTOs)
export interface CardDTO {
  code: string;
  image: string;
  images?: { svg: string; png: string };
  value: string; // uppercase face or numeric as string
  suit: string; // uppercase suit
}

export interface NewDeckResponseDTO {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

export interface ShuffleResponseDTO {
  success: boolean;
  deck_id: string;
  shuffled: boolean;
  remaining: number;
}

export interface DrawResponseDTO {
  success: boolean;
  deck_id: string;
  remaining: number;
  cards: CardDTO[];
}