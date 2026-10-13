import React, { useCallback, useMemo, useState } from "react"
import { addDays, endOfDay, format, isAfter, isSameDay, startOfDay } from "date-fns"
import { type DateRange } from "react-day-picker"
import { FilterX } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { DateRangePicker } from "@/components/common/DateRangePicker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { toast } from "sonner"
import AppointmentStatusBadge from "@/components/common/AppointmentStatusBadge"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import {
  useGetAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
} from "@/lib/store/api/services/appointment.service"
import { useGetDoctorOptionsQuery } from "@/lib/store/api/services/doctor.service"
import {
  AppointmentDetailsDialog,
  CompleteAppointmentDialog,
} from "@/features/appointments/components"

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED"

interface AppointmentModel {
  _id: string
  transactionId?: string
  createdAt?: string
  appointmentDate: string
  appointmentSlot: string
  reasonFor: string
  paymentStatus?: string
  paymentMethod?: string
  problemDescription?: string
  status: AppointmentStatus
  patient?: {
    _id?: string
    name?: string
    mobile?: string
  } | null
  doctor?: {
    _id?: string
    name?: string
    specialization?: string[]
  } | null
}

interface AppointmentRow {
  id: string
  transactionId: string
  date: string
  slot: string
  patientName: string
  patientMobile: string
  doctorId: string
  doctorName: string
  doctorSpecialization: string
  reasonFor: string
  paymentStatus: string
  paymentMethod: string
  status: AppointmentStatus
  createdAt: string
  raw: AppointmentModel
}

const MerchantAppointmentsPage: React.FC = () => {
  const { t } = useTranslation()

  const { data: appointments = [], isLoading: appointmentsLoading } =
    useGetAppointmentsQuery(undefined)
  const typedAppointments = appointments as AppointmentModel[]
  const [updateStatus, { isLoading: updateLoading }] =
    useUpdateAppointmentStatusMutation()

  const { data: doctorsData = [] } = useGetDoctorOptionsQuery(undefined)
  const doctorOptions = useMemo(() => {
    const list = Array.isArray(doctorsData) ? doctorsData : []
    return list.map((doc: any) => ({
      id: String(doc._id || doc.id || ""),
      name: String(doc.name || t("unknown doctor")),
      specialization: Array.isArray(doc.specialization)
        ? doc.specialization.join(", ")
        : doc.specialization || "",
    }))
  }, [doctorsData, t])

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentModel | null>(null)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [prescription, setPrescription] = useState("")

  const mapToRow = useCallback(
    (appointment: AppointmentModel): AppointmentRow => ({
      id: appointment._id,
      transactionId: appointment.transactionId || t("not available"),
      date: appointment.appointmentDate,
      slot: appointment.appointmentSlot,
      patientName: appointment.patient?.name || t("unknown patient"),
      patientMobile: appointment.patient?.mobile || t("not available"),
      doctorId: appointment.doctor?._id ? String(appointment.doctor._id) : "",
      doctorName: appointment.doctor?.name || t("not assigned"),
      doctorSpecialization: appointment.doctor?.specialization?.length
        ? appointment.doctor.specialization.join(", ")
        : t("not available"),
      reasonFor: appointment.reasonFor,
      paymentStatus: appointment.paymentStatus || t("not available"),
      paymentMethod: appointment.paymentMethod || t("not available"),
      status: appointment.status,
      createdAt: appointment.createdAt || "",
      raw: appointment,
    }),
    [t]
  )

  const filteredAppointments = useMemo(() => {
    return typedAppointments.filter((appointment) => {
      // Doctor filter
      if (selectedDoctorId !== "all") {
        const apptDoctorId = appointment.doctor?._id
          ? String(appointment.doctor._id)
          : ""
        const apptDoctorName = (appointment.doctor?.name || "").trim().toLowerCase()
        const selectedDoctor = doctorOptions.find((d) => d.id === selectedDoctorId)
        const matchId = apptDoctorId && apptDoctorId === selectedDoctorId
        const matchName =
          selectedDoctor &&
          apptDoctorName &&
          apptDoctorName === selectedDoctor.name.trim().toLowerCase()
        if (!matchId && !matchName) {
          return false
        }
      }

      // Date range filter
      if (dateRange?.from) {
        if (!appointment.appointmentDate) return false
        const apptDate = new Date(appointment.appointmentDate)
        const fromDate = startOfDay(dateRange.from)
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)

        if (apptDate < fromDate || apptDate > toDate) {
          return false
        }
      }

      return true
    })
  }, [typedAppointments, selectedDoctorId, dateRange, doctorOptions])

  const selectedDateRows = useMemo(() => {
    const appointmentsForSelectedDate = date
      ? filteredAppointments.filter((appointment) =>
        isSameDay(new Date(appointment.appointmentDate), date)
      )
      : []

    return appointmentsForSelectedDate.map(mapToRow)
  }, [date, filteredAppointments, mapToRow])

  const upcomingRows = useMemo(() => {
    return filteredAppointments
      .filter(
        (appointment) =>
          isAfter(
            new Date(appointment.appointmentDate),
            addDays(new Date(), -1)
          ) && ["PENDING", "CONFIRMED"].includes(appointment.status)
      )
      .sort(
        (a, b) =>
          new Date(a.appointmentDate).getTime() -
          new Date(b.appointmentDate).getTime()
      )
      .map(mapToRow)
  }, [filteredAppointments, mapToRow])

  const pastRows = useMemo(() => {
    return filteredAppointments
      .filter(
        (appointment) =>
          !isAfter(
            new Date(appointment.appointmentDate),
            addDays(new Date(), -1)
          ) || ["COMPLETED", "CANCELLED"].includes(appointment.status)
      )
      .sort(
        (a, b) =>
          new Date(b.appointmentDate).getTime() -
          new Date(a.appointmentDate).getTime()
      )
      .map(mapToRow)
  }, [filteredAppointments, mapToRow])

  const handleOpenDetails = useCallback((row: AppointmentRow) => {
    setSelectedAppointment(row.raw)
    setIsDetailsDialogOpen(true)
  }, [])

  const handleOpenComplete = useCallback((row: AppointmentRow) => {
    setSelectedAppointment(row.raw)
    setIsCompleteDialogOpen(true)
  }, [])

  const handleCompleteAppointment = useCallback(async () => {
    if (!selectedAppointment) return

    try {
      await updateStatus({
        appointmentId: selectedAppointment._id,
        body: {
          status: "COMPLETED",
          notes: prescription,
        },
      }).unwrap()

      toast.success(t("success"), {
        description: t("appointment marked as completed"),
      })

      setIsCompleteDialogOpen(false)
      setSelectedAppointment(null)
      setPrescription("")
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t("failed to update appointment")
      toast.error(t("error"), {
        description: message,
      })
    }
  }, [selectedAppointment, updateStatus, prescription, toast, t])

  const hasActiveFilters = selectedDoctorId !== "all" || Boolean(dateRange?.from)

  const handleResetFilters = useCallback(() => {
    setSelectedDoctorId("all")
    setDateRange(undefined)
  }, [])

  const apiColumns = useMemo<DataTableColumn<AppointmentRow>[]>(
    () => [
      {
        id: "transaction",
        header: t("transaction"),
        sortable: true,
        sortValue: (row) => row.transactionId,
        cell: (row) => (
          <span className="font-mono text-xs">{row.transactionId}</span>
        ),
      },
      {
        id: "patient",
        header: t("patient"),
        sortable: true,
        sortValue: (row) => row.patientName,
        cell: (row) => (
          <div>
            {row.patientName}
            <br />
            <span className="text-xs text-muted-foreground">
              {row.patientMobile}
            </span>
          </div>
        ),
      },
      { id: "doctor", header: t("doctor"), cell: (row) => row.doctorName },
      {
        id: "specialization",
        header: t("specialization"),
        cell: (row) => row.doctorSpecialization,
      },
      {
        id: "date",
        header: t("appointment date"),
        sortable: true,
        sortValue: (row) => row.date,
        cell: (row) => format(new Date(row.date), "MMM dd, yyyy"),
      },
      { id: "slot", header: t("slot"), cell: (row) => row.slot },
      { id: "reason", header: t("reason"), cell: (row) => row.reasonFor },
      {
        id: "payment",
        header: t("payment"),
        cell: (row) => `${row.paymentMethod} / ${row.paymentStatus}`,
      },
      {
        id: "status",
        header: t("status"),
        cell: (row) => <AppointmentStatusBadge status={row.status} />,
      },
      {
        id: "createdAt",
        header: t("created at"),
        sortable: true,
        sortValue: (row) => row.createdAt,
        cell: (row) =>
          row.createdAt
            ? format(new Date(row.createdAt), "MMM dd, yyyy hh:mm a")
            : t("not available"),
      },
      {
        id: "actions",
        header: t("actions"),
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const canComplete =
            row.status === "PENDING" || row.status === "CONFIRMED"

          return (
            <div className="inline-flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenDetails(row)}
              >
                {t("details")}
              </Button>
              {canComplete ? (
                <Button size="sm" onClick={() => handleOpenComplete(row)}>
                  {t("complete")}
                </Button>
              ) : null}
            </div>
          )
        },
      },
    ],
    [handleOpenComplete, handleOpenDetails, t]
  )

  const makeActionColumns = useCallback(
    (options: {
      detailsLabel: string
      showComplete: boolean
      completeLabel?: string
      conditionalComplete?: boolean
    }): DataTableColumn<AppointmentRow>[] => [
        {
          id: "patient",
          header: t("patient"),
          sortable: true,
          sortValue: (row) => row.patientName,
          cell: (row) => <span className="font-medium">{row.patientName}</span>,
        },
        {
          id: "doctor",
          header: t("doctor"),
          sortable: true,
          sortValue: (row) => row.doctorName,
          cell: (row) => row.doctorName,
        },
        {
          id: "date",
          header: t("date"),
          sortable: true,
          sortValue: (row) => row.date,
          cell: (row) => format(new Date(row.date), "MMM dd, yyyy"),
        },
        { id: "slot", header: t("slot"), cell: (row) => row.slot },
        { id: "reason", header: t("reason"), cell: (row) => row.reasonFor },
        {
          id: "payment",
          header: t("payment"),
          cell: (row) => `${row.paymentMethod} / ${row.paymentStatus}`,
        },
        {
          id: "status",
          header: t("status"),
          cell: (row) => <AppointmentStatusBadge status={row.status} />,
        },
        {
          id: "actions",
          header: t("actions"),
          headerClassName: "text-right",
          className: "text-right",
          cell: (row) => {
            const canComplete = options.conditionalComplete
              ? row.status === "PENDING" || row.status === "CONFIRMED"
              : options.showComplete

            return (
              <div className="inline-flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDetails(row)}
                >
                  {options.detailsLabel}
                </Button>
                {canComplete ? (
                  <Button size="sm" onClick={() => handleOpenComplete(row)}>
                    {options.completeLabel || t("complete")}
                  </Button>
                ) : null}
              </div>
            )
          },
        },
      ],
    [handleOpenComplete, handleOpenDetails, t]
  )

  const selectedDateColumns = useMemo(
    () =>
      makeActionColumns({
        detailsLabel: t("details"),
        showComplete: true,
        completeLabel: t("complete"),
        conditionalComplete: true,
      }),
    [makeActionColumns, t]
  )

  const upcomingColumns = useMemo(
    () =>
      makeActionColumns({
        detailsLabel: t("view details"),
        showComplete: true,
        completeLabel: t("complete"),
      }),
    [makeActionColumns, t]
  )

  const pastColumns = useMemo(
    () =>
      makeActionColumns({
        detailsLabel: t("view summary"),
        showComplete: false,
      }),
    [makeActionColumns, t]
  )

  const selectedDoctor = doctorOptions.find((d) => d.id === selectedDoctorId)

  return (
    <>
      <div className="fadeIn space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("appointments")}
          </h1>
          <p className="text-muted-foreground">
            {t("view and manage your appointment schedule")}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Doctor Filter */}
            <div className="flex min-w-[200px] flex-col gap-1.5 sm:w-60">
              <span className="text-xs font-medium text-muted-foreground">
                {t("doctor")}
              </span>
              <Select
                value={selectedDoctorId}
                onValueChange={(val) => setSelectedDoctorId(val || "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("all doctors")}>
                    {selectedDoctor ? selectedDoctor.name : t("all doctors")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">
                    <span>{t("all doctors")}</span>
                  </SelectItem>
                  {doctorOptions.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <span className="truncate">{doctor.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {t("date range")}
              </span>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={t("select date range")}
                className="min-w-[240px]"
              />
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <div className="flex flex-col justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-auto h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <FilterX className="h-4 w-4" />
                  {t("clear filters")}
                </Button>
              </div>
            )}
          </div>

          {/* Active Filter Counter / Info */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
            <span>
              {t("total appointments")}:{" "}
              <strong className="text-foreground">
                {filteredAppointments.length}
              </strong>
              {filteredAppointments.length !== typedAppointments.length && (
                <span> / {typedAppointments.length}</span>
              )}
            </span>
          </div>
        </div>

        {appointmentsLoading && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t("loading appointments")}</p>
          </div>
        )}

        {!appointmentsLoading && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("appointments api data table")}</CardTitle>
                <CardDescription>
                  {t("appointments api data table description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClientDataTable
                  data={filteredAppointments.map(mapToRow)}
                  columns={apiColumns}
                  getRowId={(row) => row.id}
                  searchPlaceholder={t("search appointments")}
                  searchKeys={[
                    (row) => row.transactionId,
                    (row) => row.patientName,
                    (row) => row.doctorName,
                    (row) => row.reasonFor,
                  ]}
                  emptyMessage={t("no appointments found")}
                  pageSizeOptions={[5, 10, 20]}
                  initialPageSize={10}
                  defaultSort={{ columnId: "date", direction: "desc" }}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <AppointmentDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        appointment={selectedAppointment}
      />

      <CompleteAppointmentDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        prescription={prescription}
        onPrescriptionChange={setPrescription}
        onConfirm={handleCompleteAppointment}
        isLoading={updateLoading}
      />
    </>
  )
}

export default MerchantAppointmentsPage
