### Test task for the Crown Castle team. (TS, Playwright)

A compact guide to run and explain this repo.

## Tech stack

* **Playwright** (latest) — UI + API testing
* **TypeScript** (strict, `noImplicitAny: true`)
* **Node.js LTS** (18.x or 20.x)
* **ESLint + Prettier** — style & static checks
* **Reports**: Playwright HTML + JUnit XML (paths configured in `playwright.config.ts`)

## Project structure

```
utils/
  card-game/                 # API + Blackjack orchestration (used by cards tests)
    domain/                  # plain types + scoring
    round/                   # RoundEngine + summary logger
    services/                # Playwright APIRequestContext wrapper
    fixtures/                # Playwright fixtures (deckService, roundEngine)
  card-game-simple/          # (optional) beginner-friendly alt refactor
    card.logic.ts | deck.service.ts | round.engine.ts | fixtures/
  checkers-game/             # UI POM for GamesForTheBrain Checkers
    helpers/                 # tiny types + parsing
    pages/checkers.page.ts   # POM (no assertions)
    fixtures/                # Playwright fixture (checkersPage)

tests/
  exercies_1/                # Checkers UI suite
    the.checkers.game.spec.ts
  exercies_2/                # Cards API/engine suite
    the.cards.game.spec.ts

.github/workflows/           # CI (all/checkers/cards) with dorny/test-reporter
```

## One-time local setup

```bash
# 1) Install deps
npm ci
```

```bash
# 2) Install Playwright browsers (and OS deps on Linux/macOS)
npx playwright install --with-deps
```

## Running tests

```bash
# Run everything (both projects)
npx playwright test
```

```bash
# Run only Checkers UI tests (project name set in playwright.config.ts)
npx playwright test --project=checkers-game
```

```bash
# Run only Cards (API/engine) tests
npx playwright test --project=card-game
```

```bash
# Headed & slow-mo (handy for UI debug)
npx playwright test --project=checkers-game --headed --slow-mo=200
```

```bash
# Show last HTML report
npx playwright show-report
```

### Reports & artifacts (after a run)

* **JUnit**: `tests-report/junit/junit.xml`
* **HTML**: `tests-report/html/` (opened by `npx playwright show-report`)
* **Artifacts** (traces, screenshots, videos): `tests-output/`

> These paths are controlled via `reporter` and `use` in `playwright.config.ts` (added in step 4).

## Useful npm scripts (suggested)

Add these to `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --project=checkers-game",
    "test:cards": "playwright test --project=card-game",
    "report": "playwright show-report",
    "lint": "eslint . --ext .ts",
    "fmt": "prettier --write ."
  }
}
```

* **Artifacts** under `tests-output/` (via `use: { trace, screenshot, video, outputDir }`).