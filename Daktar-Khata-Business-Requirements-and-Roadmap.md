# Daktar Khata — Business Requirements & Development Roadmap

> **Project:** Daktar Khata  
> **Type:** Multi-tenant Clinic Management & Doctor Operations SaaS  
> **Purpose:** This document is the primary business and development reference for continuing the existing project after a development gap.  
> **Important:** Do not rebuild existing features blindly. First inspect the current codebase, compare it with this document, and implement only the missing or incomplete parts.

---

## 1. Product Vision

Daktar Khata will be a complete clinic management platform that helps clinic owners manage:

- Doctors and patients
- Online and walk-in appointments
- Doctor consultation queues
- Medical records and prescriptions
- Diagnostic tests and reports
- Patient admission and bed allocation
- Operations and treatment workflows
- Nursing care and medication tasks
- Dynamic service charges and invoices
- Cash and online payments
- Doctor commissions and clinic revenue sharing
- Staff HRM, attendance, leave, and payroll
- Inventory, purchases, stock issues, and sales
- Notifications, reports, and audit history

The platform must support multiple clinics or organizations under separate merchants/tenants.

---

## 2. Existing Project Context

The existing codebase is documented as:

### Backend

- NestJS
- MongoDB + Mongoose
- JWT authentication
- Role-based access control
- SSLCommerz payment integration
- Swagger API documentation
- Bengali and English i18n foundation
- 18 existing feature modules

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redux Toolkit + RTK Query
- React Router
- React Hook Form + Zod
- Recharts
- i18next

### Existing documented modules

- Auth
- User
- Doctor
- Patient
- Clinic
- Staff
- Appointment
- Medical Records
- Merchant
- Merchant Payment Gateway
- Subscription
- Payment
- Dashboard
- Income
- Expense
- Finance
- Permissions
- Staff Role Templates

### Current documented progress

- Backend: approximately 85%
- Frontend: approximately 75%
- Overall: approximately 65%

These percentages are estimates only. Every feature must be verified from the actual codebase.

---

## 3. Core Product Principles

1. **Mobile-first and responsive**
   - Every page must work on mobile, tablet, laptop, and desktop.
   - No horizontal page overflow.
   - Tables must have responsive alternatives.
   - Forms must be usable with touch.
   - Primary actions must be easy to access on small screens.

2. **Multi-tenant isolation**
   - A merchant must only access its own clinic, patients, staff, appointments, financial records, inventory, and reports.
   - Super Admin may manage the platform.
   - Tenant data must never leak between merchants.

3. **Permission-based access**
   - Authentication alone is not enough.
   - Every sensitive action must be protected by role and permission.
   - Staff roles should be configurable through Staff Role Templates.

4. **Business workflow over isolated CRUD**
   - Patient, encounter, order, service, charge, invoice, payment, and commission must be connected.
   - A status change in one module should update related modules safely.

5. **Auditability**
   - Important actions must be traceable.
   - Financial, medical, admission, operation, inventory, and permission changes should be recorded.

6. **No fake completion**
   - Do not mark a feature complete if it only displays mock data or toast messages.
   - Every completed feature must be connected to the real API and tested.

7. **No destructive changes without review**
   - Before changing existing schemas, routes, or business logic, inspect current usage and migration impact.

---

## 4. User Roles

### Platform Roles

#### SUPER_ADMIN

- Manage the SaaS platform
- Manage merchants
- Manage subscription plans
- View platform-level reports
- Manage platform settings
- Manage system-level permissions

#### ADMIN

- Manage users and system operations according to permissions
- Manage doctors, clinics, and platform data where authorized

#### MERCHANT / CLINIC OWNER

- Manage clinic profile and branches
- Manage doctors, staff, services, pricing, commissions
- Manage beds, admission settings, inventory, and billing
- View revenue, expenses, payroll, and reports
- Configure payment gateways
- Configure custom staff roles and permissions

### Operational Roles

#### DOCTOR

- View assigned appointments
- Manage consultation queue
- Create encounters
- Record diagnosis and prescriptions
- Order tests
- Review reports
- Recommend admission or operation
- Write operation and discharge notes
- View authorized patient history

#### STAFF

Staff is a parent category. It should support configurable sub-roles such as:

- Receptionist
- Nurse
- Lab Technician
- Accountant
- Pharmacist / Inventory Staff
- Operation Theatre Staff
- HR Staff
- General Staff

#### PATIENT

- Register online
- Manage profile
- Book appointments
- View appointment status
- View permitted prescriptions and reports
- View invoices and payment status
- View admission and discharge information where permitted

#### USER

- Basic registered account
- Access depends on assigned role and permissions

---

## 5. Permission Model

Use granular permissions instead of hardcoding access only by role.

Example permissions:

```text
patient.create
patient.read
patient.update
patient.delete

doctor.create
doctor.read
doctor.update
doctor.delete

appointment.create
appointment.read
appointment.update
appointment.cancel
appointment.queue.manage

encounter.create
encounter.read
encounter.update

test.create
test.read
test.update
test.report.create
test.report.approve

admission.create
admission.read
admission.update
admission.discharge

bed.read
bed.allocate
bed.release
bed.manage

operation.create
operation.read
operation.schedule
operation.start
operation.complete

nursing.task.read
nursing.task.complete
nursing.vitals.create

billing.create
billing.read
billing.update
billing.discount
billing.refund

payment.create
payment.read
payment.refund

commission.read
commission.manage
commission.settle

inventory.read
inventory.purchase
inventory.stock.issue
inventory.stock.adjust
inventory.sale

staff.create
staff.read
staff.update
staff.delete
staff.payroll
staff.salary.manage
```

Permissions must be checked on the backend and reflected in the frontend.

---

## 6. Main Patient Journey

A patient may follow one or more of these flows:

```text
Registration
  -> Appointment
  -> Check-in
  -> Doctor Queue
  -> Consultation
  -> Prescription
  -> Test Order
  -> Lab Report
  -> Follow-up
  -> Admission
  -> Treatment / Operation
  -> Nursing Care
  -> Discharge
  -> Final Invoice
  -> Payment / Due
```

Not every patient must complete every step.

Examples:

- A patient may only complete a consultation.
- A patient may visit, receive a test, and return later.
- A patient may be admitted without an operation.
- A patient may be admitted for an operation and later discharged.
- A patient may have multiple encounters over time.

---

## 7. Patient Registration

### Online registration

A patient can:

1. Open the public website
2. Register an account
3. Verify required information
4. Log in
5. Select a clinic or doctor
6. Book an appointment

### Walk-in registration

Receptionist can:

1. Search existing patient by phone or patient ID
2. Create a new patient if not found
3. Add basic demographic information
4. Create a same-day appointment or queue token

### Patient information

Suggested fields:

- Patient ID
- Full name
- Phone
- Email
- Date of birth
- Gender
- Blood group
- Address
- Emergency contact
- Allergies
- Existing medical conditions
- Guardian information where needed

Sensitive medical information must not be publicly visible.

---

## 8. Appointment Management

### Appointment types

- Online appointment
- Walk-in appointment
- Follow-up appointment
- Emergency appointment
- Rescheduled appointment

### Appointment fields

- Patient
- Doctor
- Clinic
- Appointment date
- Appointment time or slot
- Serial number
- Token number
- Appointment type
- Status
- Payment status
- Notes
- Created by
- Cancellation reason
- Reschedule history

### Appointment statuses

```text
BOOKED
CONFIRMED
CHECKED_IN
WAITING
IN_CONSULTATION
COMPLETED
CANCELLED
NO_SHOW
RESCHEDULED
```

### Business rules

- A patient cannot book an unavailable slot.
- The same doctor must not have conflicting appointments.
- A cancelled appointment must not remain in the active queue.
- A rescheduled appointment must preserve history.
- Appointment status changes must be recorded.
- Payment status must be separate from appointment status.

---

## 9. Doctor Consultation Queue

The doctor should be able to manage the daily queue continuously.

### Doctor workflow

```text
Start Consultation Session
  -> View Today's Queue
  -> Call Next Patient
  -> Patient In Consultation
  -> Record Encounter
  -> Prescribe / Order Test / Recommend Admission
  -> Complete Consultation
  -> Next Patient Highlighted
```

### Queue statuses

```text
WAITING
CALLED
IN_CONSULTATION
COMPLETED
SKIPPED
CANCELLED
```

### Queue rules

- Only the correct doctor or authorized staff can change the queue.
- Completing a consultation moves the patient out of the active queue.
- The encounter remains permanently stored in medical history.
- Skipped patients may be recalled.
- The queue must be sorted by serial and priority.
- Emergency patients may have a priority flag.
- Queue changes must be server-authoritative.

---

## 10. Public Realtime Queue Page

Create a public page similar to:

```text
/public/doctor-queue/:doctorId
```

### Publicly visible information

- Clinic name
- Doctor name
- Current serial
- Current queue status
- Next serial
- Waiting count
- Estimated waiting time
- Appointment token or public queue number

### Do not show publicly

- Patient phone number
- Patient address
- Medical history
- Diagnosis
- Prescription
- Test results
- Payment details
- Sensitive personal information

### Realtime behavior

When a doctor completes or updates a queue item:

1. Backend updates the appointment/queue status.
2. Backend emits a realtime event.
3. Public queue page receives the event.
4. Current serial updates.
5. Next serial is highlighted.
6. Waiting count updates.

Socket.IO may be used if it is already installed. The frontend must also have a safe fallback such as polling or manual refresh if realtime connection fails.

---

## 11. Encounter / Consultation Record

An encounter represents one clinical interaction between a patient and a doctor.

### Encounter fields

- Patient
- Doctor
- Appointment
- Clinic
- Encounter date
- Chief complaint
- Symptoms
- Vitals
- Diagnosis
- Clinical notes
- Prescription
- Test orders
- Advice
- Follow-up date
- Admission recommendation
- Operation recommendation
- Created by
- Updated by

### Important rules

- Each consultation should create or update an encounter.
- Previous encounters must remain available.
- Medical records must not be deleted casually.
- Corrections should be tracked where possible.
- Patient history must be visible only to authorized users.

---

## 12. Prescription Management

Doctor can create prescriptions linked to an encounter.

### Prescription data

- Medicine
- Dosage
- Route
- Frequency
- Duration
- Timing
- Quantity
- Instructions
- Before/after meal
- Notes

### Prescription lifecycle

```text
PRESCRIBED
  -> DISPENSED
  -> PARTIALLY_GIVEN
  -> COMPLETED
  -> CANCELLED
```

A prescription is not the same as medication administration. Doctor prescribes; authorized nursing or pharmacy staff records actual administration or dispensing.

---

## 13. Test and Laboratory Management

### Required entities

```text
TestCatalog
TestOrder
TestOrderItem
LabSample
LabReport
```

### TestCatalog

Merchant can create and manage:

- Test name
- Category
- Description
- Price
- Sample type
- Expected turnaround time
- Active status
- Required preparation instructions

Examples:

- CBC
- Blood Sugar
- X-Ray
- ECG
- Urine Test

### Test order flow

```text
Doctor orders test
  -> Test order created
  -> Billing charge created
  -> Lab receives order
  -> Sample collected
  -> Processing
  -> Report prepared
  -> Report approved
  -> Doctor notified
  -> Patient can view/download report
```

### Test statuses

```text
ORDERED
PAYMENT_PENDING
SAMPLE_PENDING
SAMPLE_COLLECTED
PROCESSING
REPORT_READY
APPROVED
CANCELLED
```

### Report rules

- A report must be linked to the patient and test order.
- Reports may take one or more days.
- Doctor can review reports during a follow-up encounter.
- Report approval should be restricted to authorized lab staff.
- Patients can only view their own reports.

---

## 14. Admission Management

Admission is created when a patient needs inpatient care.

### Admission sources

- Doctor recommendation
- Emergency admission
- Planned operation
- Direct admission by authorized staff

### Admission fields

- Admission ID
- Patient
- Clinic
- Attending doctor
- Admission date/time
- Admission reason
- Diagnosis
- Ward
- Room
- Bed
- Admission status
- Expected discharge date
- Emergency contact
- Notes
- Responsible staff

### Admission statuses

```text
REQUESTED
ADMITTED
ON_TREATMENT
READY_FOR_DISCHARGE
DISCHARGED
CANCELLED
```

---

## 15. Ward, Room, and Bed Management

### Entities

```text
Ward
Room
Bed
BedAllocation
```

### Structure

```text
Ward
  -> Room
    -> Bed
```

### Bed statuses

```text
AVAILABLE
RESERVED
OCCUPIED
MAINTENANCE
```

### Bed allocation rules

- A bed cannot be allocated to two active patients.
- Bed allocation must be checked transactionally.
- Admission creates an allocation.
- Discharge releases the bed.
- Transfer between beds must preserve history.
- Bed maintenance blocks allocation.
- Authorized users can view availability.
- Only permitted users can allocate or release beds.

### Responsive bed board

On desktop:

- Grid or board view

On mobile:

- Filterable list view
- Ward/room filter
- Status badges
- Quick availability summary

---

## 16. Dynamic Services and Charges

The merchant/admin should be able to configure billable services dynamically.

### Service fields

- Service name
- Category
- Description
- Default price
- Tax
- Discount eligibility
- Commission eligibility
- Inventory impact
- Active status
- Service duration
- Department

### Example categories

```text
CONSULTATION
TEST
ADMISSION
BED
OPERATION
MEDICINE
MEDICAL_SUPPLY
NURSING
MEAL
SERVICE
OTHER
```

### Example services

- Doctor consultation
- CBC test
- Bed charge
- Operation charge
- Nursing charge
- Meal
- Injection
- Bandage
- Metal plate
- Dressing
- Other medical supplies

Do not hardcode every charge into the billing system.

---

## 17. Billing and Invoice Management

### Billing concepts

Separate these concepts:

- Service
- Charge
- Invoice
- Payment
- Refund
- Due
- Commission

### Charge sources

Charges may be created from:

- Consultation
- Test order
- Admission
- Bed allocation
- Operation
- Medicine dispensing
- Inventory issue
- Nursing service
- Meal
- Other services

### Invoice fields

- Invoice number
- Patient
- Admission
- Encounter
- Clinic
- Line items
- Subtotal
- Discount
- Tax
- Paid amount
- Due amount
- Refund amount
- Total
- Status
- Created by
- Payment history

### Invoice statuses

```text
DRAFT
ISSUED
PARTIALLY_PAID
PAID
DUE
CANCELLED
REFUNDED
```

### Payment methods

- Cash
- Online
- SSLCommerz
- Other supported gateways

### Business rules

- Partial payment must be supported.
- Due amount must be calculated accurately.
- Payment and discharge status must be separate.
- Refunds must create an audit record.
- Invoice totals must be calculated on the backend.
- Frontend must never be the source of truth for financial totals.

---

## 18. Doctor Commission and Revenue Sharing

Doctor commissions must be separate from payment records and clinic revenue.

### Commission types

```text
PERCENTAGE
FIXED_AMOUNT
NONE
```

### Commission sources

- Consultation
- Operation
- Test referral, only if clinic policy permits
- Other configured services

### Commission rule fields

- Clinic
- Doctor
- Service
- Commission type
- Commission value
- Effective date
- Active status

### Example

```text
Consultation fee: 1,000 BDT
Doctor commission: 80%
Doctor share: 800 BDT
Clinic share: 200 BDT
```

```text
Operation fee: 50,000 BDT
Doctor commission: 10,000 BDT
Clinic share: 40,000 BDT
```

### Commission lifecycle

```text
EARNED
  -> PAYABLE
  -> APPROVED
  -> SETTLED
  -> CANCELLED
```

Important:

- Payment received does not mean commission has been paid.
- Commission should be generated from finalized billable services.
- A refund or cancellation may reverse unpaid commission.
- Settled commission should not be silently edited.
- Commission must be included in financial reports and payroll where applicable.

---

## 19. Operation Management

The first version should focus on operational tracking, not highly specialized surgical documentation.

### Operation entities

```text
OperationCase
OperationSchedule
OperationTeam
OperationNote
OperationSupply
```

### Operation fields

- Patient
- Admission
- Surgeon/doctor
- Assistant doctors
- Procedure name
- Diagnosis
- Operation date/time
- Operation theatre/room
- Anesthesia type
- Pre-op status
- Operation status
- Post-op instructions
- Notes
- Required supplies
- Charges
- Commission

### Operation statuses

```text
PLANNED
SCHEDULED
ADMITTED
PRE_OP
READY_FOR_OT
IN_PROGRESS
COMPLETED
POST_OP
CANCELLED
```

### Operation flow

```text
Doctor recommends operation
  -> Operation case created
  -> Pre-op tests/checklist
  -> Admission
  -> Bed allocation
  -> Operation scheduled
  -> Required supplies checked
  -> Operation started
  -> Operation completed
  -> Post-op care
  -> Discharge
```

### Pre-op checklist examples

- Consent recorded
- Required reports available
- Patient identity verified
- Blood group recorded
- Required supplies available
- Anesthesia assessment completed
- Doctor/team assigned

### Operation notes

- Procedure performed
- Start/end time
- Team
- Findings
- Complications
- Post-op instructions
- Follow-up plan

Do not implement medical decisions automatically. The system should record authorized staff input.

---

## 20. Nursing and Patient Care

Nursing should be task-based.

### Nurse dashboard

- Assigned patients
- Assigned beds
- Medication schedule
- Pending tasks
- Overdue tasks
- Completed tasks
- Patient observations

### Nursing task types

```text
MEDICATION
INJECTION
VITALS_CHECK
WOUND_CARE
DRESSING
PATIENT_OBSERVATION
MEAL
TRANSFER
OTHER
```

### Task statuses

```text
PENDING
IN_PROGRESS
COMPLETED
SKIPPED
CANCELLED
```

### Medication administration fields

- Patient
- Prescription
- Medicine
- Dose
- Route
- Scheduled time
- Actual time
- Administered by
- Status
- Reason if skipped
- Notes

### Nursing rules

- Doctor creates prescription.
- Nurse records administration.
- Nurse cannot independently change a prescription without authorization.
- Every medication administration must be traceable.
- Missed or skipped doses require a reason.
- Vitals and nursing notes must be linked to admission/patient.

---

## 21. Discharge Management

### Discharge flow

```text
Doctor approves discharge
  -> Discharge summary
  -> Final charges calculated
  -> Invoice reviewed
  -> Payment or due recorded
  -> Bed released
  -> Admission closed
```

### Discharge summary

- Admission details
- Final diagnosis
- Treatment summary
- Operation summary if applicable
- Medicines
- Follow-up date
- Warning signs
- Doctor instructions
- Discharge date
- Authorized doctor

### Important rules

- Discharge and payment are separate statuses.
- Clinic policy may allow discharge with due.
- Bed must be released only after discharge is finalized.
- Discharge should not delete admission history.

---

## 22. Inventory Management

Inventory must connect to patient treatment, operation, and billing.

### Inventory categories

- Medicine
- Injection
- Bandage
- Surgical item
- Medical supply
- Equipment
- Other

### Entities

```text
InventoryItem
InventoryCategory
Supplier
Purchase
PurchaseItem
StockBatch
StockTransaction
StockIssue
Sale
SaleItem
```

### Stock transaction types

```text
PURCHASE
SALE
ISSUE_TO_PATIENT
ISSUE_TO_OPERATION
ISSUE_TO_DEPARTMENT
RETURN
ADJUSTMENT
EXPIRED
DAMAGED
```

### Inventory flow

```text
Purchase
  -> Stock In
  -> Available Stock
  -> Issue/Sale
  -> Stock Out
  -> Patient/Operation charge if applicable
```

### Stock rules

- Stock quantity must be calculated on the backend.
- Stock issue must prevent negative stock unless explicitly allowed.
- Batch, expiry date, and purchase price should be supported for medicines.
- Stock adjustments require a reason.
- Inventory transactions must be auditable.
- A patient-provided item must not reduce clinic stock.

### Supply source

```text
CLINIC_STOCK
EXTERNAL_PURCHASE
PATIENT_PROVIDED
```

Example:

- Metal plate from clinic stock: reduce stock and add patient charge.
- Metal plate purchased externally for patient: record external purchase and patient charge.
- Metal plate supplied by patient: record in treatment record, no clinic stock deduction.

---

## 23. Staff HRM and Payroll

### Staff profile

- Name
- Phone
- Role
- Department
- Clinic
- Joining date
- Salary type
- Salary amount
- Bank/payment information
- Employment status

### Salary types

```text
MONTHLY
DAILY
PER_VISIT
PER_OPERATION
COMMISSION_BASED
HOURLY
```

### Payroll flow

```text
Staff salary structure
  -> Attendance/work records
  -> Commission calculation
  -> Billing cycle reached
  -> Payroll generated
  -> Review
  -> Approved
  -> Paid
```

### Payroll fields

- Staff
- Billing cycle
- Base salary
- Attendance adjustment
- Overtime
- Commission
- Bonus
- Deduction
- Advance
- Net payable
- Payment status
- Approved by
- Paid date

### Business rules

- Payroll generation must be idempotent.
- A cycle must not generate duplicate payroll.
- Paid payroll should be locked from silent editing.
- Doctor commission may be included in payroll.
- Daily staff salary should depend on approved attendance.
- Payroll changes must be audited.

---

## 24. Notifications

Notifications are planned and should be implemented after core workflows are stable.

### Notification events

- Appointment booked
- Appointment cancelled
- Appointment reminder
- Doctor queue turn approaching
- Test order created
- Test report ready
- Admission created
- Bed allocated
- Operation scheduled
- Nursing task assigned
- Discharge approved
- Invoice created
- Payment received
- Payroll generated

### Delivery channels

- In-app notifications
- Email where configured
- SMS or other provider later
- Push notification later

### Requirements

- Notifications must be tenant-aware.
- Sensitive medical information must not be exposed in public notifications.
- Read/unread state should be supported.
- Failed delivery should be logged.

---

## 25. Audit Logs

Audit logs should record important actions.

### Audit events

- Login/logout
- Patient record access
- Patient record update
- Prescription creation/update
- Test report approval
- Admission/discharge
- Bed allocation/release
- Operation status changes
- Invoice changes
- Payment/refund
- Commission settlement
- Inventory adjustment
- Permission changes
- Payroll approval

### Audit fields

- Actor
- Role
- Tenant/clinic
- Action
- Entity type
- Entity ID
- Previous value where appropriate
- New value where appropriate
- Timestamp
- IP/device metadata where permitted

---

## 26. Dashboard Requirements

### Merchant dashboard

- Today's appointments
- Current queue
- Total patients
- Active admissions
- Occupied/available beds
- Today's income
- Today's expenses
- Net revenue
- Pending payments
- Upcoming operations
- Inventory alerts
- Staff attendance summary

### Doctor dashboard

- Today's appointments
- Waiting queue
- Current patient
- Completed consultations
- Pending test reports
- Follow-up patients
- Assigned admitted patients
- Upcoming operations

### Reception dashboard

- Today's appointments
- Check-in queue
- Patient search
- Available beds
- Active admissions
- Pending invoices
- Quick patient registration

### Nurse dashboard

- Assigned beds
- Assigned patients
- Medication schedule
- Pending nursing tasks
- Overdue tasks
- Recent vitals

### Lab dashboard

- Pending test orders
- Samples awaiting collection
- Processing tests
- Reports awaiting approval
- Completed reports

### Accountant dashboard

- Today's collections
- Due invoices
- Refunds
- Doctor commissions
- Expenses
- Payroll
- Financial reports

---

## 27. Responsive and Mobile-Friendly Requirements

This is a mandatory product requirement.

### General

- Mobile-first layout
- Support widths from approximately 320px and above
- No page-level horizontal scrolling
- Touch-friendly controls
- Minimum comfortable tap target
- Responsive typography
- Responsive spacing
- Accessible focus states
- Keyboard navigation on desktop
- Proper loading, empty, error, and success states

### Navigation

Desktop:

- Sidebar
- Topbar
- Breadcrumbs where useful

Mobile:

- Collapsible sidebar or drawer
- Compact topbar
- Bottom action area where appropriate
- Avoid oversized desktop-only navigation

### Tables

Desktop may use data tables.

Mobile should use:

- Stacked cards
- Responsive rows
- Horizontal scrolling only inside a bounded table container when absolutely necessary
- Priority columns shown first
- Row actions inside a menu or drawer

### Forms

- Single-column layout on mobile
- Multi-column layout on larger screens
- Labels always visible
- Validation messages near fields
- Date/time pickers usable by touch
- Avoid very wide dialogs on mobile
- Long forms should be divided into logical sections

### Dashboards

- Cards must stack naturally
- Charts must resize
- Avoid fixed-width charts
- Use horizontal scrolling only for intentional compact chart areas
- Important metrics should appear first

### Queue page

- Large current serial
- Clear next serial
- High contrast status
- Mobile-friendly refresh/realtime indicator
- Search field accessible without zooming

### Bed board

- Desktop grid
- Mobile list/card view
- Clear status colors and labels
- Filter controls must wrap

### Billing

- Invoice summary always visible
- Payment actions easy to access
- Line items responsive
- Avoid tiny text for totals
- Confirm destructive actions

### Accessibility

- Semantic HTML
- Proper labels
- ARIA only where needed
- Color must not be the only status indicator
- Support keyboard navigation
- Support reduced motion
- Ensure sufficient contrast

---

## 28. Frontend Architecture Guidelines

Continue the existing feature-based architecture.

Suggested structure:

```text
src/
  features/
    auth/
    patients/
    doctors/
    appointments/
    queue/
    encounters/
    tests/
    admissions/
    beds/
    operations/
    nursing/
    billing/
    payments/
    commissions/
    inventory/
    hrm/
    notifications/
  components/
  pages/
  routes/
  lib/
    store/
    i18n/
  types/
  hooks/
```

### Frontend rules

- Use RTK Query for server data.
- Avoid duplicate API state.
- Use shared form components.
- Use Zod validation.
- Keep business calculations on the backend.
- Avoid mock fallback in production pages.
- Use reusable status badges.
- Use responsive shadcn/ui components.
- Add error boundaries.
- Use optimistic updates only when safe.

---

## 29. Backend Architecture Guidelines

Use the existing NestJS modular architecture.

Each major module should generally contain:

```text
module/
  controller
  service
  dto
  schema
  constants
  guards/policies where needed
```

### Backend rules

- Validate all input.
- Enforce tenant isolation.
- Enforce permissions.
- Use transactions for financial, stock, bed, and admission operations where required.
- Keep status transitions explicit.
- Do not trust frontend totals or permissions.
- Use consistent error responses.
- Use pagination for large lists.
- Add indexes for common queries.
- Avoid `any` where practical.
- Keep secrets in environment variables.
- Never expose passwords or payment secrets.

---

## 30. Important Technical Fixes Before New Features

Based on the existing project analysis, verify and fix:

1. Frontend calls to `/users/admin/create` if the backend route does not exist.
2. Frontend calls to `users/me` if the correct route is `users/profile`.
3. Mock Admin Dashboard.
4. Mock Doctor Dashboard.
5. Mock Manage Users page.
6. Mock fallback data in Admin Appointments.
7. Incomplete i18n translations.
8. Missing React ErrorBoundary.
9. Insecure wildcard CORS.
10. Master password/backdoor behavior.
11. Hardcoded seeder credentials.
12. Missing rate limiting.
13. MongoDB replica-set requirement for transactions.
14. Broken ESLint configuration.
15. Unused Socket.IO/version mismatch.
16. Empty stub files.
17. Duplicate decorator directories.
18. Unused mock data references.

Do not fix these based only on this document. Inspect the current code and confirm each issue first.

---

## 31. Recommended Development Phases

### Phase 0 — Project Recovery

- Inspect frontend and backend repositories.
- Run both applications.
- Verify environment variables.
- Verify database connection.
- Review Git history.
- Review existing routes and schemas.
- Compare actual implementation with this document.
- Create a verified feature matrix.
- Mark each item as:
  - Complete
  - Partial
  - Mock
  - Broken
  - Not Started

### Phase 1 — Stabilize Existing Features

- Fix FE/BE contract issues.
- Fix authentication and permissions.
- Replace mock pages with real APIs.
- Verify patient, doctor, appointment, medical record, finance, and payment flows.
- Fix responsive issues in existing pages.
- Add loading, empty, and error states.

### Phase 2 — Consultation and Queue

- Encounter model and workflow.
- Doctor consultation session.
- Queue status management.
- Public queue page.
- Realtime queue updates.
- Follow-up workflow.
- Queue notifications.

### Phase 3 — Test and Report

- Test catalog.
- Test order.
- Sample collection.
- Lab report.
- Report approval.
- Doctor report review.
- Patient report access.
- Test billing integration.

### Phase 4 — Admission and Beds

- Ward, room, and bed.
- Bed availability.
- Admission.
- Bed allocation.
- Bed transfer.
- Admission charges.
- Admission dashboard.

### Phase 5 — Operation and Discharge

- Operation case.
- Operation scheduling.
- Pre-op checklist.
- Operation notes.
- Operation supplies.
- Operation charges.
- Doctor commission.
- Post-op care.
- Discharge summary.

### Phase 6 — Nursing

- Nurse dashboard.
- Patient assignment.
- Medication schedule.
- Medication administration.
- Vitals.
- Nursing tasks.
- Nursing notes.

### Phase 7 — Billing and Inventory

- Dynamic service catalog.
- Charge engine.
- Invoice lifecycle.
- Partial payment and due.
- Refund.
- Inventory purchase.
- Stock batches.
- Stock issue.
- Patient/operation stock consumption.
- Inventory-linked billing.

### Phase 8 — HRM and Finance

- Salary structures.
- Payroll cycles.
- Daily/monthly salary.
- Commission integration.
- Payroll approval and settlement.
- Financial reports.
- Audit logs.

### Phase 9 — Production Readiness

- Unit tests.
- Integration tests.
- E2E tests.
- Security hardening.
- CORS whitelist.
- Rate limiting.
- Docker setup.
- CI/CD.
- Production deployment.
- Monitoring and logging.
- Final documentation.

---

## 32. Definition of Done

A feature is complete only when:

- Backend schema and business rules are implemented.
- API endpoints are implemented and documented.
- Permissions are enforced.
- Frontend is connected to the real API.
- Loading, empty, error, and success states exist.
- Mobile and desktop layouts work.
- Validation exists.
- Important actions are audited.
- Related billing/inventory/commission behavior works.
- At least one realistic workflow has been tested.
- No mock data remains in the production flow.
- Documentation is updated.

---

## 33. Agent Instructions

When working on this project:

1. First inspect the existing codebase.
2. Do not rebuild existing modules without checking their current implementation.
3. Before coding, explain:
   - What already exists
   - What is missing
   - What files will change
   - What database changes are needed
   - What API changes are needed
   - What frontend changes are needed
4. Implement one coherent feature at a time.
5. Keep frontend and backend contracts synchronized.
6. Use the existing design system and shadcn/ui.
7. Make every UI responsive and mobile-friendly.
8. Do not introduce mock data as a substitute for real functionality.
9. Keep tenant isolation and permissions in every feature.
10. Do not place financial calculations only in the frontend.
11. Use explicit status transitions.
12. Add migration or seed updates when schemas change.
13. Test the complete workflow after implementation.
14. Update this document or the project task file after each major milestone.
15. If a business rule is unclear, do not invent a dangerous assumption. Mark it as a decision required from the product owner.

---

## 34. Open Business Decisions

These decisions should be confirmed before implementing the related feature:

- Can a patient be admitted without a doctor recommendation?
- Can discharge happen with unpaid due?
- Can a doctor edit a completed encounter?
- Can a patient cancel an appointment after payment?
- Are emergency patients allowed to bypass serial order?
- Can a clinic have multiple branches?
- Can one patient belong to multiple clinics?
- Can doctors work in multiple clinics?
- Is commission calculated before or after discount?
- Is commission reversed after refund?
- Can patient-provided supplies be included in the invoice?
- Can inventory go negative?
- Who approves lab reports?
- Who approves operation completion?
- Who can allocate or release beds?
- Can nurses modify medication schedules?
- What information can patients download?
- What notification channels are required for MVP?
- What are the exact payroll cycle dates?
- Are taxes or VAT required?
- Which services are taxable?
- Which payment gateways are required besides SSLCommerz?

---

## 35. Immediate Next Task

Start with a codebase verification task.

### Deliverables

Create:

```text
docs/
  BUSINESS_REQUIREMENTS.md
  PROJECT_STATUS.md
  MODULE_MATRIX.md
  API_CONTRACTS.md
  DATABASE_DESIGN.md
  DEVELOPMENT_TASKS.md
```

Then produce a module matrix like:

| Module | Backend | Frontend | API Connected | Responsive | Tested | Status |
|---|---|---|---|---|---|---|
| Patient | | | | | | |
| Doctor | | | | | | |
| Appointment | | | | | | |
| Queue | | | | | | |
| Encounter | | | | | | |
| Test/Lab | | | | | | |
| Admission | | | | | | |
| Bed | | | | | | |
| Operation | | | | | | |
| Nursing | | | | | | |
| Billing | | | | | | |
| Payment | | | | | | |
| Commission | | | | | | |
| Inventory | | | | | | |
| HRM/Payroll | | | | | | |
| Notifications | | | | | | |
| Audit Logs | | | | | | |

The first implementation milestone should be:

```text
Existing System Verification
  -> Critical Bug Fixes
  -> Real API Integration
  -> Responsive UI Review
  -> Patient-to-Doctor Consultation Flow
```

---

## 36. Final Product Workflow Summary

```text
Patient
  -> Registration
  -> Appointment
  -> Check-in
  -> Doctor Queue
  -> Consultation
  -> Encounter
  -> Prescription/Test/Admission Recommendation

Test Path:
  -> Test Order
  -> Sample
  -> Lab Report
  -> Doctor Review
  -> Follow-up

Admission Path:
  -> Admission
  -> Bed Allocation
  -> Treatment
  -> Operation if required
  -> Nursing Care
  -> Discharge

Financial Path:
  -> Service
  -> Charge
  -> Invoice
  -> Payment/Due
  -> Commission
  -> Revenue Report

Inventory Path:
  -> Purchase
  -> Stock
  -> Issue/Sale
  -> Patient/Operation Consumption
  -> Stock and Billing Update

HRM Path:
  -> Staff
  -> Attendance
  -> Salary/Commission
  -> Payroll Cycle
  -> Approval
  -> Payment
```

---

## 37. Success Criteria

Daktar Khata should eventually allow a clinic to manage the complete lifecycle of a patient from online registration to consultation, tests, admission, operation, nursing care, discharge, billing, payment, inventory consumption, and doctor commission—while remaining secure, multi-tenant, auditable, and fully responsive on mobile and desktop.

