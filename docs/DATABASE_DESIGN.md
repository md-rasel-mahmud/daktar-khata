# Daktar Khata - Database Design

The system uses MongoDB with Mongoose. Multi-tenancy is typically enforced by linking records to a specific `clinic` or `merchant` reference.

## Existing Schemas (Phase 1)
Located in `apps/backend/src/modules/*/schema`:

### Platform & Users
- **User** (`user.schema.ts`): Base account for all users (Admin, Merchant, Doctor, Staff, Patient).
- **Merchant** (`merchant.schema.ts`): Tenant owner.
- **Subscription** (`subscription.schema.ts`): SaaS billing plans.
- **Permission** (`permission.schema.ts`): Granular access control permissions.

### Clinic & Staff
- **Clinic** (`clinic.schema.ts`): Clinic locations.
- **Staff** (`staff.schema.ts`): Clinic staff members.
- **Attendance** (`attendance.schema.ts`): Staff check-in/check-out.
- **Staff Role Template** (`staff-role-template.schema.ts`): Customizable roles per clinic.

### Clinical
- **Patient** (`patient.schema.ts`): Patient demographic details.
- **Doctor** (`doctor.schema.ts`): Doctor profile and schedule.
- **Appointment** (`appointment.schema.ts`): Patient visits.
- **Medical Record** (`medical-record.schema.ts`): Patient history.

### Finance
- **Income** (`income.schema.ts`): Clinic revenue.
- **Expense** (`expense.schema.ts`): Clinic costs.
- **Payment** (`payment.schema.ts`): Patient/Merchant payments.
- **Merchant PG** (`merchant-pg.schema.ts`): Gateway configurations.

## Important Note
- The MongoDB environment MUST run as a replica set (`?replicaSet=rs0`) because the backend utilizes MongoDB transactions for financial and critical operations. A standalone instance will fail these operations.
