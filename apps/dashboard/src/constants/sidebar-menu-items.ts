import { RolesEnum } from "@/enums/role.enum"
import { PermissionKeyEnum } from "@/enums/permission.enum"
import {
  Banknote,
  Calendar,
  CreditCard,
  FileText,
  Home,
  User,
  UserCog,
  Users,
} from "lucide-react"

export const sidebarMenuItems = [
  {
    path: "/merchant",
    icon: Home,
    label: "Dashboard",
    roles: [
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
  },
  {
    path: "/merchant/doctors",
    icon: User,
    label: "Doctors",
    roles: [RolesEnum.MERCHANT],
  },
  {
    path: "/merchant/subscription",
    icon: CreditCard,
    label: "Subscription",
    roles: [RolesEnum.MERCHANT],
  },
  {
    path: "/merchant/appointments",
    icon: Calendar,
    label: "Appointments",
    roles: [
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
  },
  {
    path: "/merchant/hrm",
    icon: Users,
    label: "HRM",
    roles: [
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    permissions: [PermissionKeyEnum.STAFF_READ],
    children: [
      {
        path: "/merchant/hrm/staff",
        icon: UserCog,
        label: "Staff Directory",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.STAFF_READ],
      },
      {
        path: "/merchant/hrm/attendance",
        icon: Calendar,
        label: "Attendance",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.STAFF_ATTENDANCE],
      },
      {
        path: "/merchant/hrm/leave",
        icon: FileText,
        label: "Leaves",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.STAFF_LEAVE],
      },
      {
        path: "/merchant/hrm/payroll",
        icon: Banknote,
        label: "Payroll",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.STAFF_PAYROLL],
      },
      {
        path: "/merchant/hrm/roles",
        icon: UserCog,
        label: "Role Templates",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.STAFF_READ],
      },
    ],
  },
  {
    path: "/merchant/accounts",
    icon: Banknote,
    label: "Accounts",
    roles: [
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    permissions: [PermissionKeyEnum.FINANCE_READ],
    children: [
      {
        path: "/merchant/accounts/purchases",
        icon: Banknote,
        label: "Purchases",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.PURCHASE_READ],
      },
      {
        path: "/merchant/accounts/sales",
        icon: Banknote,
        label: "Sales",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.SALE_READ],
      },
      {
        path: "/merchant/accounts/invoices",
        icon: FileText,
        label: "Invoices",
        roles: [
          RolesEnum.MERCHANT,
          RolesEnum.STAFF,
        ],
        permissions: [PermissionKeyEnum.INVOICE_READ],
      },
    ],
  },
  {
    path: "/merchant/financial-reports",
    icon: FileText,
    label: "Financial Reports",
    roles: [
      RolesEnum.MERCHANT,
      RolesEnum.STAFF,
    ],
    permissions: [PermissionKeyEnum.FINANCE_READ],
  },
  {
    path: "/merchant/finance",
    icon: Banknote,
    label: "Finance Overview",
    roles: [RolesEnum.MERCHANT],
  },

  {
    path: "/admin",
    icon: Home,
    label: "Dashboard",
    roles: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
  },
  {
    path: "/admin/doctors",
    icon: User,
    label: "Doctors",
    roles: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
  },
  {
    path: "/admin/users",
    icon: Users,
    label: "Users",
    roles: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
  },
  {
    path: "/admin/appointments",
    icon: Calendar,
    label: "Appointments",
    roles: [RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN],
  },

  {
    path: "/doctor",
    icon: Home,
    label: "Dashboard",
    roles: [RolesEnum.DOCTOR],
  },
  {
    path: "/doctor/patients",
    icon: Users,
    label: "Patients",
    roles: [RolesEnum.DOCTOR],
  },
  {
    path: "/doctor/appointments",
    icon: Calendar,
    label: "Appointments",
    roles: [RolesEnum.DOCTOR],
  },

  {
    path: "/patient",
    icon: Home,
    label: "Dashboard",
    roles: [RolesEnum.PATIENT],
  },
  {
    path: "/patient/appointments",
    icon: Calendar,
    label: "Appointments",
    roles: [RolesEnum.PATIENT],
  },
  {
    path: "/patient/records",
    icon: FileText,
    label: "Medical Records",
    roles: [RolesEnum.PATIENT],
  },
  {
    path: "/staff",
    icon: Home,
    label: "Dashboard",
    roles: [RolesEnum.STAFF],
  },

  {
    path: "/profile",
    icon: User,
    label: "Profile",
    roles: [
      RolesEnum.SUPER_ADMIN,
      RolesEnum.ADMIN,
      RolesEnum.DOCTOR,
      RolesEnum.PATIENT,
      RolesEnum.STAFF,
      RolesEnum.MERCHANT,
    ],
  },
]
