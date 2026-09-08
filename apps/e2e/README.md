# @plane/e2e

Playwright end-to-end tests for the Plane web app. They drive a real browser against a running instance, so start the stack first.

## Running locally

```bash
# 1. API + infra (from the repo root)
docker compose -f docker-compose-local.yml up -d

# 2. Web app
pnpm --filter=web dev            # http://localhost:3000

# 3. Browsers (once)
pnpm --filter=@plane/e2e install:browsers

# 4. Tests
pnpm --filter=@plane/e2e test
pnpm --filter=@plane/e2e test:ui       # interactive runner
pnpm --filter=@plane/e2e test:report   # open the last HTML report
```

## How it works

- `tests/auth.setup.ts` runs first (Playwright `setup` project). It finishes instance setup if needed, signs up a fresh user through the UI, completes onboarding (profile + workspace) and stores the authenticated browser state in `.auth/user.json` plus the generated user/workspace details in `.auth/session.json`.
- All `*.spec.ts` files run in the `chromium` project with that storage state and read the session details through the `session` fixture (`support/fixtures.ts`).
- Page objects live in `support/pages/`.

## Configuration

| Variable                                 | Default                        | Purpose                                                          |
| ---------------------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| `E2E_WEB_URL`                            | `http://localhost:3000`        | Web app under test                                               |
| `E2E_API_URL`                            | `http://localhost:8000`        | API used for the instance setup check                            |
| `E2E_USER_PASSWORD`                      | built-in dev password          | Password for the generated test user                             |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | `admin@plane.local` / built-in | Instance admin created when the instance has not been set up yet |
