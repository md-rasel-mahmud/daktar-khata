# AGENTS.md

pnpm + Turborepo monorepo for **Daktar Khata**, a Multi-tenant clinic management SaaS (NestJS + React).

## Map of the repo

- The real product is `apps/backend` (NestJS v9, pkg `daktar-khata`, port 7711) and `apps/dashboard` (React 19 + Vite 7, pkg `dashboard`, port 7722).
- `apps/web`, `apps/docs`, and `packages/*` are stock `create-turbo` starter scaffolding — ignore unless told otherwise. Read `project-docs.md` at the root for authoritative project analysis, but treat it as slightly stale (it still lists past bugs).

## Commands

- `pnpm dev` at root runs **all** dev servers (dev tasks are `persistent`). To run one app, filter: `pnpm --filter daktar-khata start:dev` or `pnpm --filter dashboard dev`.
- `pnpm --filter daktar-khata test` — backend has only 3 payment-webhook tests (in `test/`, run via `test:e2e`). No unit tests for services.
- `pnpm --filter dashboard typecheck` — dashboard-only script; not wired into turbo's `check-types`. `pnpm build` / `pnpm lint` / `pnpm check-types` at root run turbo across packages.
- No CI, no frontend test setup, no docker-compose. Don't invent a verification step that isn't in the repo.

## Setup gotchas

- Backend requires a **MongoDB replica set** (`?replicaSet=rs0` in `apps/backend/.env.example`) — it uses Mongo transactions. A single-node Mongo will fail.
- On first start the seeder creates `SUPER_ADMIN` (superadmin123) and `ADMIN` (admin123). `SEEDER_README.md` is stale (claims `Super@123`); trust `src/seeder/database-seeder.service.ts`.
- `MASTER_PASSWORD` (default `DK@1234`) bypasses bcrypt and logs in as any user — the seeder's own admin creds, master password, and demo JWT/SSLCommerz secrets are committed as part of design; don't treat them as accidentally-leaked secrets.
- Dashboard reads `VITE_API_BASE_URL` from a local untracked `apps/dashboard/.env` (default `http://localhost:7711/api/v1`).

## Known landmines (verified in source)

- Backend `lint` script is **broken**: ESLint 10 is installed but `apps/backend` has no flat `eslint.config.js`. Don't rely on it.
- Frontend/backend contract is broken: `doctor.service.ts` and `user.service.ts` POST to `/users/admin/create` which **doesn't exist** (404), and `doctor.service.ts` queries dead `/users/me` (`user.service.ts` was fixed to `/users/profile`).
- Backend i18n `en`/`bn` values are swapped and have 1 key each; the dashboard i18n is complete. Don't model new BE i18n keys on the existing ones.
- Duplicate dirs `common/decorator/` and `common/decorators/` both exist.
- Backend TS is **non-strict** (`strictNullChecks:false`), though `packages/typescript-config` is strict — the apps don't extend it.

## Formatting

- Style is inconsistent by app: dashboard uses no-semis + Prettier Tailwind plugin (`cn`/`cva`); backend uses semis with defaults. Format within the app you touch; never run root `pnpm format` across the repo.

## Generated artifacts

- Backend regenerates and commits `apps/backend/docs.yaml` (Swagger/OpenAPI) on every startup. Changes to it from a run aren't meaningful edits; it also serves `/api-docs`.
