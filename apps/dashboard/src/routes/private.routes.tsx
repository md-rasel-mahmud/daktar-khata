/* eslint-disable react-refresh/only-export-components */
import React, { Suspense, lazy } from "react"
import { RolesEnum } from "@/enums/role.enum"
import { PermissionKeyEnum } from "@/enums/permission.enum"

const AdminAppointments = lazy(
  () => import("@/pages/private/admin/Appointments")
)
const AdminDashboard = lazy(() => import("@/pages/private/admin/Dashboard"))
const ManageDoctors = lazy(() => import("@/pages/private/admin/ManageDoctors"))
const ManageUsers = lazy(() => import("@/pages/private/admin/ManageUsers"))
const DoctorAppointmentsPage = lazy(
  () => import("@/pages/private/doctor/DoctorAppointmentsPage")
)
const DoctorDashboard = lazy(() => import("@/pages/private/doctor/Dashboard"))
const DoctorPatients = lazy(() => import("@/pages/private/doctor/Patients"))
const MerchantStaff = lazy(() => import("@/pages/private/merchant/Staff"))
const PatientAppointmentsPage = lazy(
  () => import("@/pages/private/patient/PatientAppointmentsPage")
)
const PatientDashboard = lazy(() => import("@/pages/private/patient/Dashboard"))
const PatientMedicalRecords = lazy(
  () => import("@/pages/private/patient/MedicalRecords")
)
const Profile = lazy(() => import("@/pages/private/Profile"))
const MerchantAppointmentsPage = lazy(
  () => import("@/pages/private/merchant/MerchantAppointmentsPage")
)

const MerchantHrmDashboard = lazy(
  () => import("@/pages/private/merchant/hrm/HrmDashboard")
)
const MerchantHrmStaffDirectory = lazy(
  () => import("@/pages/private/merchant/hrm/StaffDirectory")
)
const MerchantHrmAttendance = lazy(
  () => import("@/pages/private/merchant/hrm/Attendance")
)
const MerchantHrmLeaves = lazy(
  () => import("@/pages/private/merchant/hrm/Leaves")
)
const MerchantHrmPayroll = lazy(
  () => import("@/pages/private/merchant/hrm/Payroll")
)
const MerchantHrmRoleTemplates = lazy(
  () => import("@/pages/private/merchant/hrm/RoleTemplates")
)
const MerchantFinance = lazy(() => import("@/pages/private/merchant/Finance"))
const MerchantSales = lazy(() => import("@/pages/private/merchant/Sales"))
const MerchantPurchases = lazy(
  () => import("@/pages/private/merchant/Purchases")
)
const MerchantInvoices = lazy(() => import("@/pages/private/merchant/Invoices"))

const withSuspense = (element: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="p-4 text-sm text-muted-foreground">Loading...</div>
    }
  >
    {element}
  </Suspense>
)

export const privateRoutes = [
  {
    path: "/merchant",
    element: withSuspense(<AdminDashboard />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
  },
  {
    path: "/merchant/doctors",
    element: withSuspense(<ManageDoctors />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.MERCHANT],
  },
  {
    path: "/merchant/appointments",
    element: withSuspense(<MerchantAppointmentsPage />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
  },
  {
    path: "/merchant/staff",
    element: withSuspense(<MerchantStaff />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_READ],
  },
  {
    path: "/merchant/hrm",
    element: withSuspense(<MerchantHrmDashboard />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_READ],
  },
  {
    path: "/merchant/hrm/staff",
    element: withSuspense(<MerchantHrmStaffDirectory />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_READ],
  },
  {
    path: "/merchant/hrm/attendance",
    element: withSuspense(<MerchantHrmAttendance />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_ATTENDANCE],
  },
  {
    path: "/merchant/hrm/leave",
    element: withSuspense(<MerchantHrmLeaves />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_LEAVE],
  },
  {
    path: "/merchant/hrm/payroll",
    element: withSuspense(<MerchantHrmPayroll />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_PAYROLL],
  },
  {
    path: "/merchant/hrm/roles",
    element: withSuspense(<MerchantHrmRoleTemplates />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_READ],
  },
  {
    path: "/merchant/finance",
    element: withSuspense(<MerchantFinance />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.FINANCE_READ],
  },
  {
    path: "/merchant/accounts",
    element: withSuspense(<MerchantFinance />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.FINANCE_READ],
  },
  {
    path: "/merchant/accounts/purchases",
    element: withSuspense(<MerchantPurchases />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.PURCHASE_READ],
  },
  {
    path: "/merchant/accounts/sales",
    element: withSuspense(<MerchantSales />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.SALE_READ],
  },
  {
    path: "/merchant/accounts/invoices",
    element: withSuspense(<MerchantInvoices />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.INVOICE_READ],
  },
  {
    path: "/merchant/financial-reports",
    element: withSuspense(<MerchantFinance />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.FINANCE_READ],
  },

  {
    path: "/admin",
    element: withSuspense(<AdminDashboard />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN],
  },
  {
    path: "/admin/users",
    element: withSuspense(<ManageUsers />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN],
  },
  {
    path: "/admin/doctors",
    element: withSuspense(<ManageDoctors />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN],
  },
  {
    path: "/admin/appointments",
    element: withSuspense(<AdminAppointments />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN],
  },
  {
    path: "/doctor",
    element: withSuspense(<DoctorDashboard />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.DOCTOR],
  },
  {
    path: "/doctor/appointments",
    element: withSuspense(<DoctorAppointmentsPage />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.DOCTOR],
  },
  {
    path: "/doctor/patients",
    element: withSuspense(<DoctorPatients />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.DOCTOR],
  },
  {
    path: "/patient",
    element: withSuspense(<PatientDashboard />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.PATIENT],
  },
  {
    path: "/patient/appointments",
    element: withSuspense(<PatientAppointmentsPage />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.PATIENT],
  },
  {
    path: "/patient/records",
    element: withSuspense(<PatientMedicalRecords />),
    allowRoutes: [RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN, RolesEnum.PATIENT],
  },

  // profile
  {
    path: "/profile",
    element: withSuspense(<Profile />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.DOCTOR,
      RolesEnum.PATIENT,
      RolesEnum.STAFF,
      RolesEnum.MERCHANT,
    ],
  },

  // staff
  {
    path: "/staff",
    element: withSuspense(<MerchantStaff />),
    allowRoutes: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    requiredPermissions: [PermissionKeyEnum.STAFF_READ],
  },
]
