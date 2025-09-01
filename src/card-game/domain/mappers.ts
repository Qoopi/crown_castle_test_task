import { CardDTO, Card, Suit, Face, NewDeckResponseDTO, Deck } from './models';

export function toCard(dto: CardDTO): Card {
  // Narrow strings into our union types where possible
  const suit = dto.suit.toUpperCase() as Suit;
  const value = dto.value.toUpperCase() as Face;
  return {
    code: dto.code,
    image: dto.image,
    images: dto.images,
    value,
    suit
  };
}

export function toDeck(dto: NewDeckResponseDTO): Deck {
  return {
    deckId: dto.deck_id,
    shuffled: dto.shuffled,
    remaining: dto.remaining
  };
}