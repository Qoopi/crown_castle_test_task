import { Page, Locator } from '@playwright/test';

/**
 * Minimal POM to verify the site is reachable (HTML title check).
 */
export class CardsHomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly subtitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('//h1[@class="title"]');
    this.subtitle = page.locator('//h3[@class="subtitle"]');
  }

  async open() {
    await this.page.goto('/');
  }
}
