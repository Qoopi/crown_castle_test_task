import { test as base } from '@playwright/test';
import { DeckService } from '../services/deck.service';
import { Blackjack } from '../domain/blackjack';
import { RoundEngine } from '../services/round.engine';

export type CardGameFixtures = {
  deckService: DeckService;
  blackjack: Blackjack;
  roundEngine: RoundEngine;
};

export const test = base.extend<CardGameFixtures>({
  deckService: async ({ request }, use) => {
    await use(new DeckService(request));
  },
  blackjack: async ({}, use) => {
    await use(new Blackjack());
  },
  roundEngine: async ({ deckService, blackjack }, use) => {
    await use(new RoundEngine(deckService, blackjack));
  }
});

export const expect = base.expect;