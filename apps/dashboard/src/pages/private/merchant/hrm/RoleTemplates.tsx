import React, { useState } from "react"
import {
  useCreateStaffRoleTemplateMutation,
  useDeleteStaffRoleTemplateMutation,
  useGetStaffRoleTemplatesQuery,
  useUpdateStaffRoleTemplateMutation,
} from "@/lib/store/api/services/staff.service"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { toast } from "sonner"

const STAFF_ROLE_OPTIONS = [
  "MANAGER",
  "NURSE",
  "RECEPTIONIST",
  "ACCOUNTANT",
  "LAB_TECHNICIAN",
  "CUSTOM",
]

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

const MerchantHrmRoleTemplates: React.FC = () => {
  const { data: roleTemplates = [] } = useGetStaffRoleTemplatesQuery(undefined)
  const [createRoleTemplate, { isLoading: isCreatingTemplate }] =
    useCreateStaffRoleTemplateMutation()
  const [updateRoleTemplate, { isLoading: isUpdatingTemplate }] =
    useUpdateStaffRoleTemplateMutation()
  const [deleteRoleTemplate] = useDeleteStaffRoleTemplateMutation()

  const [editingTemplateId, setEditingTemplateId] = useState<string>("")
  const [templateForm, setTemplateForm] = useState({
    key: "",
    name: "",
    staffRole: "CUSTOM",
    customRoleName: "",
    description: "",
    permissions: [] as string[],
  })

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

  const handleSaveTemplate = async (event: React.FormEvent) => {
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
      toast.error("Template save failed", {
        description: error?.data?.message || "Could not save role template",
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

  const handleCancelEdit = () => {
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Templates</h1>
        <p className="text-muted-foreground">
          Manage custom staff role templates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingTemplateId ? "Edit Template" : "Create Template"}
          </CardTitle>
          <CardDescription>
            Define role + permission presets for staff onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={handleSaveTemplate}
          >
            <input
              className="h-10 rounded-md border bg-background px-3"
              placeholder="Template key"
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
              onChange={(event) =>
                setTemplateForm((prev) => ({
                  ...prev,
                  staffRole: event.target.value,
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
              placeholder="Custom role name"
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

            <div className="flex gap-2 md:col-span-3">
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
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
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
                <div className="flex gap-2">
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
        </CardContent>
      </Card>
    </div>
  )
}

export default MerchantHrmRoleTemplates
