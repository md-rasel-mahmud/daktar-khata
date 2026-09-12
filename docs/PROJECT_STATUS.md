# Daktar Khata - Project Status

## Overall Status
- **Backend (NestJS)**: ~85% complete for Phase 1. Base infrastructure (auth, RBAC, CRUD for core entities) is in place.
- **Frontend (React/Vite)**: ~75% complete for Phase 1. Most forms and tables are present, but many rely on mock data or lack API integration.
- **Overall**: ~65%. The project is transitioning from a "scaffolded" state to a fully integrated state.

## Known Technical Debt & Landmines
1. **Broken Contracts**: Some frontend services call non-existent backend endpoints (e.g., `/users/admin/create`).
2. **Mock Data**: Dashboards, Appointments, and Manage Users have mock fallbacks that need to be removed.
3. **Master Password**: Seeder uses `DK@1234` master password and `admin123` defaults which bypass bcrypt. (Intended for design, not a leak, but should be tracked).
4. **Environment**: Requires MongoDB Replica Set (`?replicaSet=rs0`) for transactions.
5. **Linting/Tooling**: Backend ESLint is broken. Strict mode is disabled in applications despite being in `packages/typescript-config`.
6. **i18n**: Backend English and Bengali keys are swapped and incomplete.

## Next Steps
Execute **Phase 1: Stabilize Existing Features**. Fix broken API contracts, remove mock data, secure CORS/rate-limiting, and prepare the core platform for the Consultation/Queue features.
