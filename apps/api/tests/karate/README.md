# Karate behaviour tests for the Plane REST API

Black-box behaviour tests for the public API (`/api/v1`, authenticated with
`X-API-Key`) written in [Karate](https://karatelabs.github.io/karate/). They
run against a live API process and complement the pytest suite in
`apps/api/plane/tests`, which tests the Django code in-process.

The features read like a specification of the API:

| Feature | Tag | Covers |
| --- | --- | --- |
| `plane/auth/authentication.feature` | `@auth @smoke` | missing / invalid / valid API keys, rate-limit headers, workspace scoping |
| `plane/instance/instance.feature` | `@instance @smoke` | health check, public instance descriptor |
| `plane/projects/projects.feature` | `@projects` | CRUD, pagination, lite listing, identifier rules, archive, summary |
| `plane/states/states.feature` | `@states` | default workflow, custom states, reserved triage group, validation |
| `plane/labels/labels.feature` | `@labels` | CRUD, uniqueness, nesting, validation |
| `plane/work-items/work-items.feature` | `@work-items` | CRUD, default state, `PROJ-123` lookup, labels, comments, links, activities, validation |
| `plane/cycles/cycles.feature` | `@cycles` | CRUD, cycle work items, date ordering, archive rules |
| `plane/modules/modules.feature` | `@modules` | CRUD, module work items, archive / unarchive, validation |
| `plane/members/members.feature` | `@members` | workspace and project member listings, permission checks |

## Running with Docker (recommended)

Prerequisite (once): `apps/api/.env` must exist — run `./setup.sh` from the repo
root, or simply `cp apps/api/.env.example apps/api/.env` (the stack overrides
every host / credential it needs).

```bash
# Full suite: boots postgres / valkey / rabbitmq / minio / api, seeds fixtures, runs Karate
docker compose -f docker-compose-karate.yml up --build --abort-on-container-exit --exit-code-from karate

# A subset, by tag or by feature path
docker compose -f docker-compose-karate.yml run --rm karate mvn -q test -Dkarate.options="-t @smoke"
docker compose -f docker-compose-karate.yml run --rm karate mvn -q test -Dkarate.options="classpath:plane/work-items"

# Tear down (drops the tmpfs data and the network)
docker compose -f docker-compose-karate.yml down -v
```

The `karate-api` service migrates the database, registers the instance and runs
`fixtures/seed.py`, which idempotently creates:

| Fixture | Default | Override |
| --- | --- | --- |
| user | `karate@plane.local` | `KARATE_USER_EMAIL` |
| workspace | slug `karate` | `KARATE_WORKSPACE_SLUG` |
| API key | `plane_api_karate_local_only_do_not_use_in_prod` | `KARATE_API_KEY` |

The key is deliberately a fixed, non-secret value so the runner and the API
agree on it; never reuse it outside the throwaway test stack.

## Running from the host

Useful while writing features. Needs JDK 17+ and Maven 3.6+.

```bash
# Start only the API (published on localhost:8000) and leave it running
docker compose -f docker-compose-karate.yml up -d --build karate-api

cd apps/api/tests/karate
mvn test                                        # everything
mvn test -Dkarate.options="-t @projects"        # one tag
mvn test -Dkarate.options="classpath:plane/cycles/cycles.feature:12"   # one scenario (line number)
```

Configuration is read from environment variables in `src/test/java/karate-config.js`:

| Variable | Default |
| --- | --- |
| `KARATE_BASE_URL` | `http://localhost:8000` |
| `KARATE_API_KEY` | `plane_api_karate_local_only_do_not_use_in_prod` |
| `KARATE_WORKSPACE_SLUG` | `karate` |
| `KARATE_USER_EMAIL` | `karate@plane.local` |
| `KARATE_THREADS` | `4` |
| `KARATE_ENV` / `-Dkarate.env` | `local` |

Point `KARATE_BASE_URL` / `KARATE_API_KEY` at any Plane instance to run the
suite against it (it only creates resources it then deletes, inside a project
it creates for the run).

## Reports

After a run:

- `target/karate-reports/karate-summary.html` – HTML report
- `target/karate-reports/*.xml` – JUnit XML (picked up by CI)
- `target/karate-reports/*.json` – Cucumber JSON
- `target/karate.log` – full request / response log

## Writing features

- `karate-config.js` creates one shared project per JVM (`plane/common/setup-project.feature`
  via `karate.callSingle`) and exposes it as `project` / `projectUrl`. Scenarios
  that only need "a project" should use it; scenarios that mutate project-level
  state (archive, delete, uniqueness) create and delete their own.
- Every resource name includes `runId` so the suite can be re-run against a
  reused database without collisions, and every scenario deletes what it made.
- Django requires trailing slashes: build URLs with `url someUrl + 'x/'`; do not
  use Karate `path`, which drops the trailing slash (POSTs would then 404/500).
- Headers set with `headers` are cleared after each request; features use
  `* configure headers = authHeaders` in `Background` instead.
- Inside inline JSON use embedded expressions: `{ name: '#("Sprint " + runId)' }`.
  Plain `'a' + b` is only valid in `match` / `def` JavaScript context.
- Reusable matchers live in `karate-config.js`: `uuid`, `isoDateTime`,
  `paginatedSchema`.
