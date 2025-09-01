import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 0,
  outputDir: 'tests-output/',
  reporter: [
    ['junit', { outputFile: 'tests-report/junit/junit.xml' }],
    ['html', { open: 'never', outputFolder: 'tests-report/html' }],
  ],
  projects: [
    {
      name: 'checkers-game',
      testMatch: ['exercise_1/**/*.{spec,test}.ts'],
      use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        baseURL: process.env.CHECKERS_URL || 'https://www.gamesforthebrain.com/game/checkers/',
        ...devices['Desktop Chrome'],
        headless: false,
      },
    },
    {
      name: 'card-game',
      testMatch: ['exercise_2/**/*.{spec,test}.ts'],
      use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        baseURL: process.env.CARDS_API_URL || 'https://deckofcardsapi.com/',
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
  workers: process.env.CI ? 2 : undefined,
});
