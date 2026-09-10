This project now includes a DatabaseSeederService (src/seeder/database-seeder.service.ts) which will create default roles and a SUPER_ADMIN user on first startup if no users exist.

Notes:

- SUPER_ADMIN credentials (only used for seeding):
  - Email/Phone: superadmin@example.com
  - Password: Super@123

Security: After first startup you should change the superadmin password via an admin endpoint.

Packages to install:

- @nestjs/schedule
- bcryptjs (or keep bcrypt already used)

Run:

- npm install @nestjs/schedule bcryptjs

Employee to Staff migration:

- npm run migrate:employee-to-staff
