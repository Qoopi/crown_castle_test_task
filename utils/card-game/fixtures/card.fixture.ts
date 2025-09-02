import { test as base, expect } from '@playwright/test';
import { DeckService } from '../services/deck.service';
import { RoundEngine } from '../round/round.engine';
import { RoundLogger } from '../round/round.logger';
import { CardsHomePage} from '../pages/home.page';

export type CardGameFixtures = {
  cardsHomePage: CardsHomePage;
  deckService: DeckService;
  roundEngine: RoundEngine;
};

export const cardGameTest = base.extend<CardGameFixtures>({
  cardsHomePage: async ({ page }, use) => {
    const homePage = new CardsHomePage(page);
    await use(homePage);
  },
  deckService: async ({ request }, use) => {
    const service = new DeckService(request);
    await use(service);
  },
  roundEngine: async ({ deckService }, use) => {
    const engine = new RoundEngine(deckService, new RoundLogger());
    await use(engine);
  },
});

export { expect };