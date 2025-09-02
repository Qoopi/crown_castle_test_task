import { test as base, expect } from '@playwright/test';
import { CheckersPage } from '../pages/checkers.page';

export type CheckersFixtures = {
  checkersPage: CheckersPage;
};

export const checkersTest = base.extend<CheckersFixtures>({
  checkersPage: async ({ page }, use) => {
    await use(new CheckersPage(page));
  },
});

export { expect };