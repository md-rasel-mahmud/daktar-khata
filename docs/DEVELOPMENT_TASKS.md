# Daktar Khata - Development Tasks

This task list covers **Phase 1: Stabilize Existing Features**, ensuring the existing scaffolded codebase is fully functional before adding new major features.

## 1. Backend Fixes
- [ ] Fix frontend/backend broken contracts:
  - Find and fix any remaining references to `/users/admin/create` (404) in the frontend.
  - Fix any remaining references to `/users/me` (should be `/users/profile`) in `doctor.service.ts` and others.
- [ ] Fix broken ESLint configuration in `apps/backend`.
- [ ] Fix swapped Bengali/English i18n keys and standardize the translation structure.
- [ ] Review wildcard CORS settings and secure them.
- [ ] Add rate limiting to authentication routes.
- [ ] Verify transactions and ensure `?replicaSet=rs0` is clearly documented.

## 2. Frontend Fixes
- [ ] Add a global React ErrorBoundary to catch rendering crashes safely.
- [ ] Remove mock fallback data and connect to real APIs:
  - Admin Dashboard
  - Doctor Dashboard
  - Manage Users Page
  - Admin Appointments
- [ ] Check responsive design on core pages (especially Tables and Forms on mobile).
- [ ] Ensure loading states, empty states, and error states are handled in RTK Query integrations.

## 3. Preparation for Phase 2 (Consultation and Queue)
- [ ] Verify the complete `Patient -> Appointment` flow end-to-end to ensure it is robust enough to build the `Queue` system on top of it.
- [ ] Verify the `Doctor -> Schedule` availability checks are solid.
