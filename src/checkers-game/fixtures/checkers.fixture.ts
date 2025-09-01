import { test as base } from '@playwright/test';
import { CheckersPage } from '../pages/checkers.page';

export type CheckersFixtures = {
  checkers: CheckersPage;
};

export const test = base.extend<CheckersFixtures>({
  checkers: async ({ page }, use) => {
    const p = new CheckersPage(page);
    await use(p);
  }
});

export const expect = base.expect;