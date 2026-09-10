import React, { useMemo, useState } from "react"
import {
  useCreateLeaveRequestMutation,
  useGetLeaveRequestsQuery,
  useGetStaffListQuery,
  useUpdateLeaveStatusMutation,
} from "@/lib/store/api/services/staff.service"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Badge } from "@repo/ui/badge"
import { toast } from "sonner"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import { format } from "date-fns"

const MerchantHrmLeaves: React.FC = () => {
  const { data: staffList = [] } = useGetStaffListQuery(undefined)
  const [createLeaveRequest, { isLoading: isCreating }] =
    useCreateLeaveRequestMutation()
  const [updateLeaveStatus] = useUpdateLeaveStatusMutation()

  const [staffId, setStaffId] = useState<string>("")
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "" })

  const effectiveStaffId = staffId || staffList[0]?._id || ""

  const { data: leaves = [] } = useGetLeaveRequestsQuery(
    { staffId: effectiveStaffId },
    { skip: !effectiveStaffId }
  )

  const submitLeave = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!effectiveStaffId) return

    try {
      await createLeaveRequest({
        staffId: effectiveStaffId,
        body: {
          fromDate: form.fromDate,
          toDate: form.toDate,
          reason: form.reason,
        },
      }).unwrap()

      toast.success("Leave request submitted")
      setForm({ fromDate: "", toDate: "", reason: "" })
    } catch (error: any) {
      toast.error("Leave request failed", {
        description: error?.data?.message || "Could not submit leave",
      })
    }
  }

  const setStatus = async (
    leaveId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (!effectiveStaffId) return

    try {
      await updateLeaveStatus({
        staffId: effectiveStaffId,
        leaveId,
        body: { status },
      }).unwrap()

      toast.success(`Leave ${status.toLowerCase()}`)
    } catch (error: any) {
      toast.error("Leave update failed", {
        description: error?.data?.message || "Could not update leave status",
      })
    }
  }

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "from",
        header: "From",
        cell: (row) =>
          row.fromDate ? format(new Date(row.fromDate), "MMM dd, yyyy") : "-",
      },
      {
        id: "to",
        header: "To",
        cell: (row) =>
          row.toDate ? format(new Date(row.toDate), "MMM dd, yyyy") : "-",
      },
      {
        id: "reason",
        header: "Reason",
        cell: (row) => row.reason,
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => <Badge variant="outline">{row.status}</Badge>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (row) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatus(row._id, "APPROVED")}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setStatus(row._id, "REJECTED")}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaves</h1>
        <p className="text-muted-foreground">
          Create and manage staff leave requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Leave</CardTitle>
          <CardDescription>
            Submit leave request for selected staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={submitLeave}>
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={effectiveStaffId}
              onChange={(event) => setStaffId(event.target.value)}
            >
              {(staffList as any[]).map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={form.fromDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fromDate: e.target.value }))
              }
              required
            />
            <Input
              type="date"
              value={form.toDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, toDate: e.target.value }))
              }
              required
            />
            <Input
              placeholder="Reason"
              value={form.reason}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              required
            />
            <div className="md:col-span-4">
              <Button type="submit" disabled={isCreating || !effectiveStaffId}>
                Submit Leave
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientDataTable
            data={leaves as any[]}
            columns={columns}
            getRowId={(row) => row._id}
            emptyMessage="No leave requests"
            searchKeys={[(row) => row.reason, (row) => row.status]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default MerchantHrmLeaves
