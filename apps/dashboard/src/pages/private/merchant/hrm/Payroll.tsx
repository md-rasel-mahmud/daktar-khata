import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  useCreatePayrollMutation,
  useGetPayrollQuery,
  useGetStaffListQuery,
} from "@/lib/store/api/services/staff.service"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"

const MerchantHrmPayroll: React.FC = () => {
  const { data: staffList = [] } = useGetStaffListQuery(undefined)
  const [createPayroll, { isLoading: isCreating }] = useCreatePayrollMutation()

  const [staffId, setStaffId] = useState<string>("")
  const [form, setForm] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    basicSalary: "",
    bonus: "0",
    deduction: "0",
    status: "PENDING",
    note: "",
  })

  const effectiveStaffId = staffId || staffList[0]?._id || ""

  const { data: payrollList = [] } = useGetPayrollQuery(effectiveStaffId, {
    skip: !effectiveStaffId,
  })

  const submitPayroll = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!effectiveStaffId) return

    try {
      await createPayroll({
        staffId: effectiveStaffId,
        body: {
          month: Number(form.month),
          year: Number(form.year),
          basicSalary: Number(form.basicSalary),
          bonus: Number(form.bonus || 0),
          deduction: Number(form.deduction || 0),
          status: form.status,
          note: form.note || undefined,
        },
      }).unwrap()

      toast.success("Payroll created")
    } catch (error: any) {
      toast.error("Payroll failed", {
        description: error?.data?.message || "Could not create payroll",
      })
    }
  }

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "period",
        header: "Period",
        sortable: true,
        sortValue: (row) => `${row.year}-${row.month}`,
        cell: (row) => `${row.month}/${row.year}`,
      },
      {
        id: "basic",
        header: "Basic",
        cell: (row) => `৳${Number(row.basicSalary || 0).toLocaleString()}`,
      },
      {
        id: "net",
        header: "Net Pay",
        className: "font-medium",
        cell: (row) => `৳${Number(row.netPay || 0).toLocaleString()}`,
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => <Badge variant="outline">{row.status}</Badge>,
      },
      {
        id: "created",
        header: "Created",
        cell: (row) =>
          row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "-",
      },
    ],
    []
  )

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">
          Generate and review payroll records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Payroll</CardTitle>
          <CardDescription>Generate payroll for selected staff</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" onSubmit={submitPayroll}>
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
              type="number"
              placeholder="Month"
              value={form.month}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, month: e.target.value }))
              }
              required
            />
            <Input
              type="number"
              placeholder="Year"
              value={form.year}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, year: e.target.value }))
              }
              required
            />
            <Input
              type="number"
              placeholder="Basic Salary"
              value={form.basicSalary}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, basicSalary: e.target.value }))
              }
              required
            />
            <Input
              type="number"
              placeholder="Bonus"
              value={form.bonus}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bonus: e.target.value }))
              }
            />
            <Input
              type="number"
              placeholder="Deduction"
              value={form.deduction}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deduction: e.target.value }))
              }
            />
            <select
              className="h-10 rounded-md border bg-background px-3"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
            </select>
            <Input
              placeholder="Note"
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, note: e.target.value }))
              }
              className="md:col-span-4"
            />
            <div className="md:col-span-4">
              <Button type="submit" disabled={isCreating || !effectiveStaffId}>
                Create Payroll
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientDataTable
            data={payrollList as any[]}
            columns={columns}
            getRowId={(row, index) => `${row._id || index}`}
            emptyMessage="No payroll records"
            searchKeys={[
              (row) => row.status,
              (row) => `${row.month}/${row.year}`,
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default MerchantHrmPayroll
