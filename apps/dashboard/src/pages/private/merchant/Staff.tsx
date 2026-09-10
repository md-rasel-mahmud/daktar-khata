import React, { useEffect, useMemo, useState } from "react"
import {
  useCreateStaffRoleTemplateMutation,
  useCreateLeaveRequestMutation,
  useCreatePayrollMutation,
  useCreateStaffMutation,
  useDeleteStaffRoleTemplateMutation,
  useDeactivateStaffMutation,
  useGetPayrollQuery,
  useGetStaffRoleTemplatesQuery,
  useGetStaffListQuery,
  useRecordAttendanceMutation,
  useUpdateStaffRoleTemplateMutation,
} from "@/lib/store/api/services/staff.service"
import {
  FormInput,
  type FormInputConfig,
} from "@/components/common/form/FormInput"
import { Button } from "@repo/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import { Badge } from "@repo/ui/badge"
import { toast } from "sonner"
import { type Control, type FieldValues, useForm } from "react-hook-form"
import { useLocation } from "react-router"
import AddStaffDialog from "@/features/merchant/components/staff/AddStaffDialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const STAFF_ROLE_OPTIONS = [
  "MANAGER",
  "NURSE",
  "RECEPTIONIST",
  "ACCOUNTANT",
  "LAB_TECHNICIAN",
  "CUSTOM",
]

const PAYROLL_STATUS_OPTIONS = ["PENDING", "PAID"]

const STAFF_PERMISSION_OPTIONS = [
  "staff.read",
  "staff.create",
  "staff.update",
  "staff.delete",
  "staff.attendance",
  "staff.leave",
  "staff.payroll",
  "finance.read",
  "finance.write",
  "sale.read",
  "sale.write",
  "purchase.read",
  "purchase.write",
  "invoice.read",
]

const DEFAULT_ROLE_PERMISSION_TEMPLATES: Record<string, string[]> = {
  MANAGER: STAFF_PERMISSION_OPTIONS,
  NURSE: ["staff.read", "staff.attendance", "staff.leave"],
  RECEPTIONIST: ["staff.read", "staff.attendance", "sale.read", "sale.write"],
  ACCOUNTANT: [
    "finance.read",
    "finance.write",
    "sale.read",
    "sale.write",
    "purchase.read",
    "purchase.write",
    "invoice.read",
  ],
  LAB_TECHNICIAN: ["staff.read", "sale.read"],
}

const MerchantStaff: React.FC = () => {
  const location = useLocation()

  const { data: staffList = [], isLoading } = useGetStaffListQuery(undefined)
  const { data: roleTemplates = [] } = useGetStaffRoleTemplatesQuery(undefined)

  const [createStaff, { isLoading: isCreatingStaff }] = useCreateStaffMutation()
  const [createRoleTemplate, { isLoading: isCreatingTemplate }] =
    useCreateStaffRoleTemplateMutation()
  const [updateRoleTemplate, { isLoading: isUpdatingTemplate }] =
    useUpdateStaffRoleTemplateMutation()
  const [deleteRoleTemplate] = useDeleteStaffRoleTemplateMutation()
  const [deactivateStaff] = useDeactivateStaffMutation()
  const [recordAttendance, { isLoading: isRecordingAttendance }] =
    useRecordAttendanceMutation()
  const [createLeaveRequest, { isLoading: isCreatingLeave }] =
    useCreateLeaveRequestMutation()
  const [createPayroll, { isLoading: isCreatingPayroll }] =
    useCreatePayrollMutation()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeStaffId, setActiveStaffId] = useState<string>("")
  const [editingTemplateId, setEditingTemplateId] = useState<string>("")
  const [templateForm, setTemplateForm] = useState({
    key: "",
    name: "",
    staffRole: "CUSTOM",
    customRoleName: "",
    description: "",
    permissions: [] as string[],
  })

  const roleTemplateOptions = useMemo(() => {
    if (Array.isArray(roleTemplates) && roleTemplates.length > 0) {
      return roleTemplates.map((template: any) => ({
        label: template.name,
        value: template.key,
      }))
    }

    return STAFF_ROLE_OPTIONS.filter((role) => role !== "CUSTOM").map(
      (role) => ({
        label: role,
        value: role,
      })
    )
  }, [roleTemplates])

  const staffDefaultValues = {
    name: "",
    phone: "",
    password: "",
    email: "",
    staffRole: "RECEPTIONIST",
    customRoleName: "",
    roleTemplateKey: "RECEPTIONIST",
    permissions: DEFAULT_ROLE_PERMISSION_TEMPLATES.RECEPTIONIST,
    designation: "",
    salary: 0,
  }

  const staffValidationSchema = z.object({
    name: z.string().nonempty("Name is required"),
    phone: z.string().nonempty("Phone is required"),
    email: z.email("Invalid email").optional(),
    staffRole: z.enum(STAFF_ROLE_OPTIONS, {
      message: "Select a valid staff role",
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    customRoleName: z.string().optional(),
    roleTemplateKey: z.string().optional(),
    permissions: z.array(z.string()).optional(),
    designation: z.string().optional(),
    salary: z
      .number({ error: "Salary must be a number" })
      .min(0, "Salary cannot be negative")
      .optional(),
  })

  const {
    control: staffControl,
    handleSubmit: handleStaffSubmit,
    reset: resetStaffForm,
    watch: watchStaffForm,
    setValue: setStaffValue,
  } = useForm({
    defaultValues: staffDefaultValues,
    mode: "all",
    resolver: zodResolver(staffValidationSchema),
  })

  const selectedRoleTemplateKey = watchStaffForm("roleTemplateKey")

  useEffect(() => {
    const selectedTemplate = Array.isArray(roleTemplates)
      ? roleTemplates.find(
          (template: any) => template.key === selectedRoleTemplateKey
        )
      : undefined

    if (selectedTemplate) {
      setStaffValue("staffRole", selectedTemplate.staffRole)
      setStaffValue("customRoleName", selectedTemplate.customRoleName || "")
      setStaffValue("permissions", selectedTemplate.permissions || [])
      return
    }

    if (selectedRoleTemplateKey && selectedRoleTemplateKey !== "CUSTOM") {
      setStaffValue(
        "permissions",
        DEFAULT_ROLE_PERMISSION_TEMPLATES[selectedRoleTemplateKey] || []
      )
      setStaffValue("staffRole", selectedRoleTemplateKey)
      setStaffValue("customRoleName", "")
    }
  }, [roleTemplates, selectedRoleTemplateKey, setStaffValue])

  const staffFormData: FormInputConfig[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter name",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      required: true,
      placeholder: "Enter phone (Login credential)",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password (min 6 chars)",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email",
    },
    {
      name: "roleTemplateKey",
      label: "Role Template",
      type: "select",
      required: true,
      options: roleTemplateOptions,
    },
    {
      name: "staffRole",
      label: "Staff Role",
      type: "select",
      required: true,
      options: STAFF_ROLE_OPTIONS.map((role) => ({
        label: role,
        value: role,
      })),
    },
    {
      name: "salary",
      label: "Salary",
      type: "number",
      placeholder: "Enter salary",
    },
    {
      name: "customRoleName",
      label: "Custom Role (for CUSTOM)",
      type: "text",
      placeholder: "e.g. Nurse Manager",
    },
    {
      name: "permissions",
      label: "Permissions",
      type: "multiple-checkbox",
      options: STAFF_PERMISSION_OPTIONS.map((permission) => ({
        label: permission,
        value: permission,
      })),
      className: "md:col-span-2",
    },
    {
      name: "designation",
      label: "Designation",
      type: "text",
      placeholder: "Enter designation",
      className: "md:col-span-2",
    },
  ]

  const leaveDefaultValues = {
    fromDate: "",
    toDate: "",
    reason: "",
  }

  const payrollDefaultValues = {
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    basicSalary: 0,
    bonus: 0,
    deduction: 0,
    status: "PENDING",
    note: "",
  }

  const {
    control: leaveControl,
    handleSubmit: handleLeaveSubmit,
    reset: resetLeaveForm,
  } = useForm({
    defaultValues: leaveDefaultValues,
    mode: "all",
  })

  const {
    control: payrollControl,
    handleSubmit: handlePayrollSubmit,
    reset: resetPayrollForm,
  } = useForm({
    defaultValues: payrollDefaultValues,
    mode: "all",
  })

  const leaveFormData: FormInputConfig[] = [
    {
      name: "fromDate",
      label: "From Date",
      type: "date",
      required: true,
    },
    {
      name: "toDate",
      label: "To Date",
      type: "date",
      required: true,
    },
    {
      name: "reason",
      label: "Reason",
      type: "text",
      required: true,
      className: "md:col-span-2",
    },
  ]

  const payrollFormData: FormInputConfig[] = [
    {
      name: "month",
      label: "Month",
      type: "number",
      required: true,
    },
    {
      name: "year",
      label: "Year",
      type: "number",
      required: true,
    },
    {
      name: "basicSalary",
      label: "Basic Salary",
      type: "number",
      required: true,
      className: "md:col-span-2",
    },
    {
      name: "bonus",
      label: "Bonus",
      type: "number",
    },
    {
      name: "deduction",
      label: "Deduction",
      type: "number",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: PAYROLL_STATUS_OPTIONS.map((status) => ({
        label: status,
        value: status,
      })),
      className: "md:col-span-2",
    },
    {
      name: "note",
      label: "Note",
      type: "textarea",
      className: "md:col-span-2",
    },
  ]

  const payrollStaffId = useMemo(() => {
    if (activeStaffId) return activeStaffId
    return staffList[0]?._id || ""
  }, [activeStaffId, staffList])

  const { data: payrollList = [] } = useGetPayrollQuery(payrollStaffId, {
    skip: !payrollStaffId,
  })

  const staffColumns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        sortable: true,
        sortValue: (staff) => staff.name,
        className: "font-medium",
        cell: (staff) => staff.name,
      },
      {
        id: "role",
        header: "Role",
        sortable: true,
        sortValue: (staff) => staff.customRoleName || staff.staffRole,
        cell: (staff) =>
          staff.customRoleName
            ? `${staff.customRoleName} (${staff.staffRole})`
            : staff.staffRole,
      },
      {
        id: "phone",
        header: "Phone",
        cell: (staff) => staff.phone,
      },
      {
        id: "permissions",
        header: "Permissions",
        sortable: true,
        sortValue: (staff) => (staff.permissions || []).length,
        cell: (staff) => `${(staff.permissions || []).length} perms`,
      },
      {
        id: "salary",
        header: "Salary",
        sortable: true,
        sortValue: (staff) => Number(staff.salary || 0),
        cell: (staff) => `৳${Number(staff.salary || 0).toLocaleString()}`,
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        sortValue: (staff) => (staff.active ? 1 : 0),
        cell: (staff) => (
          <Badge
            variant="secondary"
            className={staff.active ? "bg-emerald-100 text-emerald-700" : ""}
          >
            {staff.active ? "ACTIVE" : "INACTIVE"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        cell: (staff) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isRecordingAttendance}
              onClick={() => handleQuickAttendance(staff._id, "PRESENT")}
            >
              Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isRecordingAttendance}
              onClick={() => handleQuickAttendance(staff._id, "ABSENT")}
            >
              Absent
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeactivate(staff._id)}
            >
              Deactivate
            </Button>
            <Button size="sm" onClick={() => setActiveStaffId(staff._id)}>
              Manage
            </Button>
          </div>
        ),
      },
    ],
    [isRecordingAttendance]
  )

  const payrollColumns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "period",
        header: "Period",
        sortable: true,
        sortValue: (item) => `${item.year}-${item.month}`,
        cell: (item) => `${item.month}/${item.year}`,
      },
      {
        id: "basic",
        header: "Basic",
        sortable: true,
        sortValue: (item) => Number(item.basicSalary || 0),
        cell: (item) => `৳${Number(item.basicSalary || 0).toLocaleString()}`,
      },
      {
        id: "bonus",
        header: "Bonus",
        sortable: true,
        sortValue: (item) => Number(item.bonus || 0),
        cell: (item) => `৳${Number(item.bonus || 0).toLocaleString()}`,
      },
      {
        id: "deduction",
        header: "Deduction",
        sortable: true,
        sortValue: (item) => Number(item.deduction || 0),
        cell: (item) => `৳${Number(item.deduction || 0).toLocaleString()}`,
      },
      {
        id: "net",
        header: "Net Pay",
        sortable: true,
        sortValue: (item) => Number(item.netPay || 0),
        className: "font-medium",
        cell: (item) => `৳${Number(item.netPay || 0).toLocaleString()}`,
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        sortValue: (item) => item.status,
        cell: (item) => (
          <Badge
            variant="secondary"
            className={
              item.status === "PAID" ? "bg-emerald-100 text-emerald-700" : ""
            }
          >
            {item.status}
          </Badge>
        ),
      },
    ],
    []
  )

  const handleCreateStaff = async (values: FieldValues) => {
    const permissions = Array.isArray(values.permissions)
      ? values.permissions
      : []

    try {
      await createStaff({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        password: values.password,
        staffRole: values.staffRole,
        customRoleName:
          values.staffRole === "CUSTOM"
            ? values.customRoleName || undefined
            : undefined,
        permissions,
        designation: values.designation || undefined,
        salary: values.salary ? Number(values.salary) : 0,
      }).unwrap()

      toast.success("Staff created", { description: "New staff added." })
      setIsCreateDialogOpen(false)
      resetStaffForm(staffDefaultValues)
    } catch (error: any) {
      toast.error("Create failed", {
        description: error?.data?.message || "Could not create staff",
      })
    }
  }

  const handleTemplatePermissionToggle = (permission: string) => {
    setTemplateForm((prev) => {
      const hasPermission = prev.permissions.includes(permission)

      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter((item) => item !== permission)
          : [...prev.permissions, permission],
      }
    })
  }

  const handleCreateTemplate = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const payload = {
        key: templateForm.key,
        name: templateForm.name,
        staffRole: templateForm.staffRole,
        customRoleName:
          templateForm.staffRole === "CUSTOM"
            ? templateForm.customRoleName || undefined
            : undefined,
        description: templateForm.description || undefined,
        permissions: templateForm.permissions,
      }

      if (editingTemplateId) {
        await updateRoleTemplate({
          templateId: editingTemplateId,
          body: payload,
        }).unwrap()
        toast.success("Template updated")
      } else {
        await createRoleTemplate(payload).unwrap()
        toast.success("Template created")
      }

      setEditingTemplateId("")
      setTemplateForm({
        key: "",
        name: "",
        staffRole: "CUSTOM",
        customRoleName: "",
        description: "",
        permissions: [],
      })
    } catch (error: any) {
      toast.error("Template create failed", {
        description: error?.data?.message || "Could not create role template",
      })
    }
  }

  const handleEditTemplate = (template: any) => {
    setEditingTemplateId(template._id)
    setTemplateForm({
      key: template.key || "",
      name: template.name || "",
      staffRole: template.staffRole || "CUSTOM",
      customRoleName: template.customRoleName || "",
      description: template.description || "",
      permissions: Array.isArray(template.permissions)
        ? template.permissions
        : [],
    })
  }

  const handleCancelTemplateEdit = () => {
    setEditingTemplateId("")
    setTemplateForm({
      key: "",
      name: "",
      staffRole: "CUSTOM",
      customRoleName: "",
      description: "",
      permissions: [],
    })
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteRoleTemplate(templateId).unwrap()
      toast.success("Template deleted")
    } catch (error: any) {
      toast.error("Template delete failed", {
        description: error?.data?.message || "Could not delete role template",
      })
    }
  }

  const handleQuickAttendance = async (staffId: string, status: string) => {
    try {
      await recordAttendance({
        staffId,
        body: {
          date: new Date().toISOString(),
          status,
        },
      }).unwrap()
      toast.success("Attendance recorded", {
        description: `Marked as ${status}`,
      })
    } catch (error: any) {
      toast.error("Attendance failed", {
        description: error?.data?.message || "Could not record attendance",
      })
    }
  }

  const handleDeactivate = async (staffId: string) => {
    try {
      await deactivateStaff(staffId).unwrap()
      toast.success("Staff deactivated")
    } catch (error: any) {
      toast.error("Deactivate failed", {
        description: error?.data?.message || "Could not deactivate staff",
      })
    }
  }

  const handleCreateLeave = async (values: FieldValues) => {
    if (!activeStaffId) {
      toast.error("Select staff", {
        description: "Pick a staff member first",
      })
      return
    }

    try {
      await createLeaveRequest({
        staffId: activeStaffId,
        body: {
          fromDate: values.fromDate,
          toDate: values.toDate,
          reason: values.reason,
        },
      }).unwrap()

      toast.success("Leave request submitted")
      resetLeaveForm(leaveDefaultValues)
    } catch (error: any) {
      toast.error("Leave request failed", {
        description: error?.data?.message || "Could not submit leave",
      })
    }
  }

  const handleCreatePayroll = async (values: FieldValues) => {
    if (!payrollStaffId) {
      toast.error("No staff available")
      return
    }

    try {
      await createPayroll({
        staffId: payrollStaffId,
        body: {
          month: Number(values.month),
          year: Number(values.year),
          basicSalary: Number(values.basicSalary),
          bonus: Number(values.bonus || 0),
          deduction: Number(values.deduction || 0),
          status: values.status,
          note: values.note || undefined,
        },
      }).unwrap()

      toast.success("Payroll created")
      resetPayrollForm(payrollDefaultValues)
    } catch (error: any) {
      toast.error("Payroll failed", {
        description: error?.data?.message || "Could not create payroll",
      })
    }
  }

  const isAttendanceView = location.pathname === "/merchant/hrm/attendance"
  const isLeaveView = location.pathname === "/merchant/hrm/leave"
  const isPayrollView = location.pathname === "/merchant/hrm/payroll"
  const isRolesView = location.pathname === "/merchant/hrm/roles"
  const isStaffDirectoryView = location.pathname === "/merchant/hrm/staff"

  const showStaffList =
    isStaffDirectoryView ||
    (!isAttendanceView && !isLeaveView && !isPayrollView && !isRolesView)
  const showRoleTemplates =
    isRolesView ||
    (!isAttendanceView &&
      !isLeaveView &&
      !isPayrollView &&
      !isStaffDirectoryView)
  const showLeaveSection =
    isLeaveView ||
    (!isAttendanceView &&
      !isPayrollView &&
      !isRolesView &&
      !isStaffDirectoryView)
  const showPayrollSection =
    isPayrollView ||
    (!isAttendanceView && !isLeaveView && !isRolesView && !isStaffDirectoryView)
  const showAttendanceHelper = isAttendanceView

  return (
    <div className="fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, leave, and payroll.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add Staff</Button>
      </div>

      {showStaffList ? (
        <Card>
          <CardHeader>
            <CardTitle>Staff List</CardTitle>
            <CardDescription>Total: {staffList.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading staff...</p>
            ) : (
              <ClientDataTable
                data={staffList as any[]}
                columns={staffColumns}
                getRowId={(staff) => staff._id}
                emptyMessage="No staff found."
                searchPlaceholder="Search by name, role or phone..."
                searchKeys={[
                  (staff) => staff.name,
                  (staff) => staff.staffRole,
                  (staff) => staff.phone,
                ]}
                pageSizeOptions={[5, 10, 20]}
                initialPageSize={10}
                defaultSort={{ columnId: "name", direction: "asc" }}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {showAttendanceHelper ? (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Module</CardTitle>
            <CardDescription>
              Use Staff List actions to mark PRESENT/ABSENT quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Attendance actions are available in the Staff Directory table.
              Open HRM → Staff Directory and use the Present/Absent action
              buttons.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {showRoleTemplates ? (
        <Card>
          <CardHeader>
            <CardTitle>Role Template Manager</CardTitle>
            <CardDescription>
              Create custom staff role templates for your merchant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid gap-3 md:grid-cols-3"
              onSubmit={handleCreateTemplate}
            >
              <input
                className="h-10 rounded-md border bg-background px-3"
                placeholder="Template key (e.g. NURSE_MANAGER)"
                value={templateForm.key}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    key: e.target.value.toUpperCase(),
                  }))
                }
                required
              />
              <input
                className="h-10 rounded-md border bg-background px-3"
                placeholder="Template name"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={templateForm.staffRole}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    staffRole: e.target.value,
                  }))
                }
              >
                {STAFF_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <input
                className="h-10 rounded-md border bg-background px-3"
                placeholder="Custom role name (for CUSTOM)"
                value={templateForm.customRoleName}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    customRoleName: e.target.value,
                  }))
                }
              />
              <input
                className="h-10 rounded-md border bg-background px-3 md:col-span-2"
                placeholder="Description"
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <div className="rounded-md border p-3 md:col-span-3">
                <p className="mb-2 text-sm font-medium">Template Permissions</p>
                <div className="grid gap-2 md:grid-cols-3">
                  {STAFF_PERMISSION_OPTIONS.map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={templateForm.permissions.includes(permission)}
                        onChange={() =>
                          handleTemplatePermissionToggle(permission)
                        }
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3">
                <Button
                  type="submit"
                  disabled={
                    isCreatingTemplate ||
                    isUpdatingTemplate ||
                    templateForm.permissions.length === 0
                  }
                >
                  {isUpdatingTemplate
                    ? "Updating..."
                    : isCreatingTemplate
                      ? "Creating..."
                      : editingTemplateId
                        ? "Update Template"
                        : "Create Template"}
                </Button>
                {editingTemplateId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelTemplateEdit}
                  >
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="space-y-2">
              {(roleTemplates as any[]).map((template) => (
                <div
                  key={template._id || template.key}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.key} · {template.staffRole} ·{" "}
                      {template.permissions?.length || 0} perms
                    </p>
                  </div>
                  {template.isSystem ? (
                    <Badge variant="outline">System</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showLeaveSection || showPayrollSection ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Leave Request</CardTitle>
              <CardDescription>
                {activeStaffId
                  ? "Leave will be created for selected staff."
                  : "Select a staff member from the list first."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleLeaveSubmit(handleCreateLeave)}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormInput
                    control={leaveControl as unknown as Control<FieldValues>}
                    formData={leaveFormData}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isCreatingLeave || !activeStaffId}
                >
                  {isCreatingLeave ? "Submitting..." : "Submit Leave"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Payroll</CardTitle>
              <CardDescription>
                {payrollStaffId
                  ? "Payroll is generated for selected/first staff."
                  : "No staff available."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handlePayrollSubmit(handleCreatePayroll)}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormInput
                    control={payrollControl as unknown as Control<FieldValues>}
                    formData={payrollFormData}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isCreatingPayroll || !payrollStaffId}
                >
                  {isCreatingPayroll ? "Creating..." : "Create Payroll"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {showPayrollSection ? (
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
            <CardDescription>
              {payrollStaffId
                ? "Most recent payroll records for selected staff"
                : "Select staff to view payroll"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientDataTable
              data={payrollList as any[]}
              columns={payrollColumns}
              getRowId={(item, index) => `${item.month}-${item.year}-${index}`}
              emptyMessage="No payroll records found."
              searchPlaceholder="Search payroll status or period..."
              searchKeys={[
                (item) => `${item.month}/${item.year}`,
                (item) => item.status,
              ]}
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={5}
              defaultSort={{ columnId: "period", direction: "desc" }}
            />
          </CardContent>
        </Card>
      ) : null}

      <AddStaffDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        resetForm={() => resetStaffForm(staffDefaultValues)}
        onSubmit={handleStaffSubmit(handleCreateStaff)}
        control={staffControl}
        formData={staffFormData}
        isSubmitting={isCreatingStaff}
      />
    </div>
  )
}

export default MerchantStaff
