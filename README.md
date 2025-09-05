### Test task for the Crown Castle team. (TS, Playwright)

A compact guide to run and explain this repo.

CI: GitHub Actions — ready-to-use pipelines for tests (all/checkers/cards). See runs: https://github.com/Qoopi/crown_castle_test_task/actions

## Tech stack

* **Playwright** (latest) — UI + API testing
* **TypeScript** (strict, `noImplicitAny: true`)
* **Node.js LTS** (18.x or 20.x)
* **ESLint + Prettier** — style & static checks
* **Reports**: Playwright HTML + JUnit XML (paths configured in `playwright.config.ts`)

## Prerequisites

- Node.js LTS (18.x or 20.x)
- npm (bundled with Node.js) or nvm for managing Node versions (optional)
- Git
- macOS, Linux, or Windows (WSL2 recommended on Windows, optional)
- Internet access to download Playwright browsers during setup (no manual browser install needed)

## Project structure

```
utils/
  card-game/                 # API + Blackjack orchestration (used by cards tests)
    domain/                  # plain types + scoring
    round/                   # RoundEngine + summary logger
    services/                # Playwright APIRequestContext wrapper
    fixtures/                # Playwright fixtures (deckService, roundEngine)
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
* **Artifacts** under `tests-output/` (via `use: { trace, screenshot, video, outputDir }`).