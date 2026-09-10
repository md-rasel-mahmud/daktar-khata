import React, { useCallback, useMemo, useState } from "react"
import { addDays, format, isAfter, isSameDay } from "date-fns"
import { useTranslation } from "react-i18next"
import { Button } from "@repo/ui/button"
import { Calendar } from "@repo/ui/calendar"
import { Badge } from "@repo/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
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
    name?: string
    mobile?: string
  } | null
  doctor?: {
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
  doctorName: string
  doctorSpecialization: string
  reasonFor: string
  paymentStatus: string
  paymentMethod: string
  status: AppointmentStatus
  createdAt: string
  raw: AppointmentModel
}

const DoctorAppointmentsPage: React.FC = () => {
  const { t } = useTranslation()

  const { data: appointments = [], isLoading: appointmentsLoading } =
    useGetAppointmentsQuery(undefined)
  const typedAppointments = appointments as AppointmentModel[]
  const [updateStatus, { isLoading: updateLoading }] =
    useUpdateAppointmentStatusMutation()

  const [date, setDate] = useState<Date | undefined>(new Date())
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

  const selectedDateRows = useMemo(() => {
    const appointmentsForSelectedDate = date
      ? typedAppointments.filter((appointment) =>
          isSameDay(new Date(appointment.appointmentDate), date)
        )
      : []

    return appointmentsForSelectedDate.map(mapToRow)
  }, [date, typedAppointments, mapToRow])

  const upcomingRows = useMemo(() => {
    return typedAppointments
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
  }, [typedAppointments, mapToRow])

  const pastRows = useMemo(() => {
    return typedAppointments
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
  }, [typedAppointments, mapToRow])

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
                variant={options.showComplete ? "outline" : "outline"}
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

        {appointmentsLoading && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t("loading appointments")}</p>
          </div>
        )}

        {!appointmentsLoading && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">{t("calendar")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {t("appointments for date", {
                      date: date ? format(date, "MMM dd, yyyy") : t("today"),
                    })}
                  </CardTitle>
                  <CardDescription>
                    {t("appointments count", {
                      count: selectedDateRows.length,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientDataTable
                    data={selectedDateRows}
                    columns={selectedDateColumns}
                    getRowId={(row) => row.id}
                    searchPlaceholder={t("search selected date appointments")}
                    searchKeys={[
                      (row) => row.transactionId,
                      (row) => row.patientName,
                      (row) => row.doctorName,
                      (row) => row.reasonFor,
                    ]}
                    emptyMessage={t("no appointments scheduled for this date")}
                    pageSizeOptions={[5, 10]}
                    initialPageSize={5}
                    defaultSort={{ columnId: "date", direction: "asc" }}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("all appointments")}</CardTitle>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">
                      {t("upcoming")}
                      {upcomingRows.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {upcomingRows.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="past">{t("past")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4">
                    <ClientDataTable
                      data={upcomingRows}
                      columns={upcomingColumns}
                      getRowId={(row) => row.id}
                      searchPlaceholder={t("search upcoming appointments")}
                      searchKeys={[
                        (row) => row.patientName,
                        (row) => row.doctorName,
                        (row) => row.reasonFor,
                      ]}
                      emptyMessage={t("no upcoming appointments")}
                      pageSizeOptions={[5, 10]}
                      initialPageSize={5}
                      defaultSort={{ columnId: "date", direction: "asc" }}
                    />
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
                    <ClientDataTable
                      data={pastRows}
                      columns={pastColumns}
                      getRowId={(row) => row.id}
                      searchPlaceholder={t("search past appointments")}
                      searchKeys={[
                        (row) => row.patientName,
                        (row) => row.doctorName,
                        (row) => row.reasonFor,
                      ]}
                      emptyMessage={t("no past appointments")}
                      pageSizeOptions={[5, 10]}
                      initialPageSize={5}
                      defaultSort={{ columnId: "date", direction: "desc" }}
                    />
                  </TabsContent>
                </Tabs>
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

export default DoctorAppointmentsPage
