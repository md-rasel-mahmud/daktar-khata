import type { StaffRoleEnum } from "@/enums/staff-role.enum"

export type StaffRoleTemplate = {
  _id?: string
  merchant?: string
  key: string
  name: string
  staffRole: StaffRoleEnum
  customRoleName?: string
  permissions: string[]
  description?: string
  isSystem: boolean
  active: boolean
  createdAt: Date | string
  updatedAt: Date | string
}
