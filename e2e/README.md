# Playwright E2E tests

Browser end-to-end tests for the Plane web app (`apps/web`), run with [Playwright](https://playwright.dev) against a real API/DB backend.

## Layout

```
e2e/
├── playwright.config.ts   # baseURL, projects, webServer (serves the web build on :3000)
├── global.setup.ts        # fails fast if the API is down / instance not set up
├── fixtures/seed.py       # Django shell script: E2E user, workspace, instance admin
├── lib/
│   ├── api.ts             # API base URL, seeded credentials, health polling
│   └── auth.ts            # AuthPage page object (email -> password -> submit)
└── tests/auth/            # sign-in.spec.ts, sign-up.spec.ts
```

The specs locate elements through `data-testid` attributes on the auth forms
(`apps/web/core/components/account/auth-forms/*.tsx`): `auth-email-input`,
`auth-continue-button`, `auth-password-input`, `auth-confirm-password-input`,
`auth-sign-in-button`, `auth-sign-up-button` and `auth-error-banner`. Keep them when
refactoring those components — Playwright depends on them.

## Running locally

1. Generate env files and install dependencies (once):

   ```sh
   ./setup.sh
   pnpm test:e2e:install      # downloads Chromium
   cp e2e/.env.example e2e/.env
   ```

2. Start the backend stack. `docker-compose-e2e.yml` boots Postgres/Valkey/RabbitMQ/MinIO and an
   API container that migrates, registers + configures the instance and runs `e2e/fixtures/seed.py`
   (creating `e2e@plane.local` / `e2e-password-1234!` with workspace `e2e`), then serves on `:8000`:

   ```sh
   docker compose -f docker-compose-e2e.yml up -d --build --wait
   ```

   To run against the regular dev stack instead, start `docker-compose-local.yml`, then seed with
   `docker compose -f docker-compose-local.yml exec -T api python manage.py shell < e2e/fixtures/seed.py`
   and make sure `WEB_URL` in `apps/api/.env` points at `http://localhost:3000`.

3. Run the tests. Playwright starts `pnpm --filter=web preview` (production build served on `:3000`)
   unless something is already listening there:

   ```sh
   pnpm test:e2e             # headless
   pnpm test:e2e:ui          # Playwright UI mode
   pnpm test:e2e:debug       # step through with the inspector
   ```

   Useful env vars (see `e2e/.env.example`): `PLAYWRIGHT_BASE_URL`, `E2E_API_BASE_URL`,
   `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `E2E_WORKSPACE_SLUG`, `E2E_ALL_BROWSERS=1`,
   `PLAYWRIGHT_SKIP_WEB_SERVER=1`, `PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm --filter=web start"`.

4. Tear down: `docker compose -f docker-compose-e2e.yml down -v`.

Reports land in `e2e/playwright-report/` (`pnpm --filter=e2e exec playwright show-report`) and
traces/screenshots/videos for failures in `e2e/test-results/`.

## CI

`.github/workflows/pull-request-playwright.yml` runs the suite on pull requests to `preview`:
it builds `web`, starts `docker-compose-e2e.yml`, runs `pnpm test:e2e` and uploads the report on failure.

## Writing specs

- Prefer URL/navigation assertions and `data-testid` selectors over `waitForTimeout`.
- The suite runs with `fullyParallel: false` and a single worker because auth specs share server state;
  use `uniqueEmail()` from `lib/api.ts` for anything that creates users.
- Add new page objects under `lib/` and specs under `tests/<area>/`.
