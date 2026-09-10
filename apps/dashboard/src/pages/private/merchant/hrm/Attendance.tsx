import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  useGetStaffAttendanceQuery,
  useGetStaffListQuery,
  useRecordAttendanceMutation,
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

const MerchantHrmAttendance: React.FC = () => {
  const { data: staffList = [] } = useGetStaffListQuery(undefined)
  const [recordAttendance, { isLoading: isRecording }] =
    useRecordAttendanceMutation()

  const [staffId, setStaffId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState("")

  const effectiveStaffId = staffId || staffList[0]?._id || ""

  const { data: attendanceList = [] } = useGetStaffAttendanceQuery(
    { staffId: effectiveStaffId },
    { skip: !effectiveStaffId }
  )

  const columns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        id: "date",
        header: "Date",
        sortable: true,
        sortValue: (row) => new Date(row.date),
        cell: (row) =>
          row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-",
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => <Badge variant="outline">{row.status}</Badge>,
      },
      {
        id: "checkIn",
        header: "Check In",
        cell: (row) =>
          row.checkIn ? format(new Date(row.checkIn), "hh:mm a") : "-",
      },
      {
        id: "checkOut",
        header: "Check Out",
        cell: (row) =>
          row.checkOut ? format(new Date(row.checkOut), "hh:mm a") : "-",
      },
    ],
    []
  )

  const markAttendance = async (status: "PRESENT" | "ABSENT") => {
    if (!effectiveStaffId) return

    try {
      await recordAttendance({
        staffId: effectiveStaffId,
        body: {
          date: selectedDate || new Date().toISOString(),
          status,
        },
      }).unwrap()

      toast.success(`Marked ${status}`)
    } catch (error: any) {
      toast.error("Attendance failed", {
        description: error?.data?.message || "Could not record attendance",
      })
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Mark attendance and review logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            Select staff and mark present/absent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                disabled={isRecording || !effectiveStaffId}
                onClick={() => markAttendance("PRESENT")}
              >
                Present
              </Button>
              <Button
                variant="outline"
                disabled={isRecording || !effectiveStaffId}
                onClick={() => markAttendance("ABSENT")}
              >
                Absent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientDataTable
            data={attendanceList as any[]}
            columns={columns}
            getRowId={(row) => row._id}
            emptyMessage="No attendance found"
            searchKeys={[(row) => row.status, (row) => row.note]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default MerchantHrmAttendance
