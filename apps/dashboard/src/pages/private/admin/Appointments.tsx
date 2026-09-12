import React, { useMemo, useState } from "react"
import { type FormInputConfig } from "@/components/common/form/FormInput"
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
import { Button } from "@repo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import { Input } from "@repo/ui/input"
import { Badge } from "@repo/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import {
  Search,
  Plus,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useGetAppointmentsQuery } from "@/lib/store/api/services/appointment.service"
import { useGetPatientsQuery } from "@/lib/store/api/services/patient.service"
import { useGetDoctorOptionsQuery } from "@/lib/store/api/services/doctor.service"
import { type FieldValues, useForm } from "react-hook-form"
import NewAppointmentDialog from "@/features/admin/components/appointments/NewAppointmentDialog"

const AdminAppointments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] =
    useState(false)

  const { data: patients = [] } = useGetPatientsQuery(undefined)
  const { data: doctors = [] } = useGetDoctorOptionsQuery(undefined)

  const appointmentDefaultValues = {
    patient: patients[0]?.id || patients[0]?._id || "",
    doctor: doctors[0]?.id || doctors[0]?._id || "",
    date: "",
    time: "09:00 AM",
    type: "Consultation",
    notes: "",
  }

  const { control, handleSubmit, reset } = useForm({
    defaultValues: appointmentDefaultValues,
    mode: "all",
  })

  const { data: appointmentData } = useGetAppointmentsQuery(undefined)

  console.log("appointmentData :>> ", appointmentData)

  const normalizedAppointments = useMemo(
    () =>
      (appointmentData ?? []).map((appointment: any, index: number) => {
        const rawStatus = String(
          appointment.status ?? "scheduled"
        ).toLowerCase()
        const mappedStatus =
          rawStatus === "confirmed" || rawStatus === "pending"
            ? "scheduled"
            : rawStatus

        return {
          id: appointment.id ?? appointment._id ?? `appointment-${index}`,
          patientName:
            appointment.patientName ?? appointment.patient?.name ?? "N/A",
          doctorName:
            appointment.doctorName ?? appointment.doctor?.name ?? "N/A",
          date: appointment.date ?? appointment.appointmentDate,
          time: appointment.time ?? appointment.appointmentSlot ?? "N/A",
          type: appointment.type ?? appointment.reasonFor ?? "Consultation",
          status: mappedStatus,
        }
      }),
    [appointmentData]
  )

  // Apply search and filters
  const filteredAppointments = normalizedAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.doctorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (appointment.type &&
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase()))

    if (statusFilter === "all") {
      return matchesSearch
    }

    return matchesSearch && appointment.status === statusFilter
  })

  const appointmentColumns = useMemo<
    DataTableColumn<(typeof filteredAppointments)[number]>[]
  >(
    () => [
      {
        id: "patient",
        header: "Patient",
        sortable: true,
        sortValue: (appointment) => appointment.patientName,
        cell: (appointment) => appointment.patientName,
      },
      {
        id: "doctor",
        header: "Doctor",
        sortable: true,
        sortValue: (appointment) => appointment.doctorName,
        cell: (appointment) => appointment.doctorName,
      },
      {
        id: "date",
        header: "Date",
        sortable: true,
        sortValue: (appointment) =>
          appointment.date ? new Date(appointment.date) : null,
        cell: (appointment) =>
          appointment.date
            ? format(new Date(appointment.date), "MMM dd, yyyy")
            : "-",
      },
      {
        id: "time",
        header: "Time",
        cell: (appointment) => appointment.time,
      },
      {
        id: "type",
        header: "Type",
        sortable: true,
        sortValue: (appointment) => appointment.type,
        cell: (appointment) => appointment.type,
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        sortValue: (appointment) => appointment.status,
        cell: (appointment) => (
          <Badge
            variant="outline"
            className={cn(
              "font-normal capitalize",
              statusColors[appointment.status as keyof typeof statusColors]
            )}
          >
            {appointment.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        cell: (appointment) => (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {appointment.status === "scheduled" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleMarkCompleted(appointment.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleCancelAppointment(appointment.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Appointment
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  )

  const handleMarkCompleted = (appointmentId: string) => {
    toast.success("Appointment Completed", {
      description: `Appointment ${appointmentId} has been marked as completed.`,
    })
  }

  const handleCancelAppointment = (appointmentId: string) => {
    toast.success("Appointment Cancelled", {
      description: `Appointment ${appointmentId} has been cancelled.`,
    })
  }

  const appointmentFormData: FormInputConfig[] = [
    {
      name: "patient",
      label: "Select Patient",
      type: "select",
      required: true,
      options: patients.map((patient: any) => ({
        label: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`,
        value: patient.id || patient._id,
      })),
      className: "md:col-span-2",
    },
    {
      name: "doctor",
      label: "Select Doctor",
      type: "select",
      required: true,
      options: doctors.map((doctor: any) => ({
        label: `${doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`} ${doctor.specialization ? `(${doctor.specialization})` : ''}`,
        value: doctor.id || doctor._id,
      })),
      className: "md:col-span-2",
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "time",
      label: "Time",
      type: "select",
      required: true,
      options: [
        { label: "09:00 AM", value: "09:00 AM" },
        { label: "09:30 AM", value: "09:30 AM" },
        { label: "10:00 AM", value: "10:00 AM" },
        { label: "10:30 AM", value: "10:30 AM" },
        { label: "11:00 AM", value: "11:00 AM" },
        { label: "11:30 AM", value: "11:30 AM" },
      ],
    },
    {
      name: "type",
      label: "Appointment Type",
      type: "select",
      required: true,
      options: [
        { label: "Check-up", value: "Check-up" },
        { label: "Consultation", value: "Consultation" },
        { label: "Follow-up", value: "Follow-up" },
        { label: "Emergency", value: "Emergency" },
        { label: "Vaccination", value: "Vaccination" },
      ],
      className: "md:col-span-2",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Additional information...",
      className: "md:col-span-2",
    },
  ]

  const handleAddAppointment = (_values: FieldValues) => {
    // In a real app, we would send data to an API
    toast.success("Appointment Scheduled", {
      description: "The new appointment has been scheduled successfully.",
    })

    setIsAddAppointmentDialogOpen(false)
    reset(appointmentDefaultValues)
  }

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    completed: "bg-green-100 text-green-800 hover:bg-green-200",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
  }

  return (
    <>
      <div className="fadeIn space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Appointments
            </h1>
            <p className="text-muted-foreground">
              Schedule and manage appointments for your clinic.
            </p>
          </div>
          <Button onClick={() => setIsAddAppointmentDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm sm:w-45"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>
              Showing {filteredAppointments.length} appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientDataTable
              data={filteredAppointments}
              columns={appointmentColumns}
              getRowId={(appointment) => String(appointment.id)}
              emptyMessage="No appointments found matching your search."
              searchPlaceholder="Search appointments..."
              searchKeys={[
                (appointment) => appointment.patientName,
                (appointment) => appointment.doctorName,
                (appointment) => appointment.type,
              ]}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={10}
              defaultSort={{ columnId: "date", direction: "desc" }}
            />
          </CardContent>
        </Card>
      </div>

      <NewAppointmentDialog
        open={isAddAppointmentDialogOpen}
        onOpenChange={setIsAddAppointmentDialogOpen}
        onSubmit={handleSubmit(handleAddAppointment)}
        resetForm={() => reset(appointmentDefaultValues)}
        control={control}
        formData={appointmentFormData}
      />
    </>
  )
}

export default AdminAppointments
