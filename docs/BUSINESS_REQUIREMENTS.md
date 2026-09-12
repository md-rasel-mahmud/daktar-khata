# Daktar Khata - Business Requirements

## 1. Product Vision
Daktar Khata is a multi-tenant clinic management and doctor operations SaaS platform. It enables clinic owners to manage:
- Doctors and patients
- Online and walk-in appointments
- Consultation queues
- Medical records, prescriptions, and diagnostic tests
- Patient admission and operations
- Billing, inventory, payroll, and reports

## 2. Core Product Principles
1. **Mobile-first and responsive**: Fully accessible on all devices.
2. **Multi-tenant isolation**: Strict data isolation per merchant.
3. **Permission-based access**: Granular control for all features.
4. **Business workflow**: Features connect end-to-end (e.g. appointment -> consultation -> billing).
5. **Auditability**: Traceability for critical and financial actions.

## 3. Main Patient Journey
Registration -> Appointment -> Check-in -> Queue -> Consultation -> Prescription / Tests -> Admission (optional) -> Discharge -> Final Invoice -> Payment.

## 4. Roles
- **SUPER_ADMIN**: Platform management.
- **ADMIN**: Operations oversight.
- **MERCHANT**: Clinic owner, manages their own tenant.
- **DOCTOR**: Handles appointments and clinical encounters.
- **STAFF**: Configurable roles (Receptionist, Nurse, Lab Tech, etc.).
- **PATIENT**: Books appointments and views their own history.

*(Refer to the main Roadmap for complete, detailed workflows and business rules.)*
