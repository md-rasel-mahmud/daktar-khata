import React, { useEffect, useMemo, useState } from "react"
import { format, isFuture, isPast, isToday } from "date-fns"
import { useTranslation } from "react-i18next"
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  Check,
  Clock,
  X,
} from "lucide-react"
import {
  useCancelAppointmentMutation,
  useCreateAppointmentMutation,
  useGetAppointmentsQuery,
  useGetAvailableSlotsQuery,
} from "@/lib/store/api/services/appointment.service"
import { useGetDoctorOptionsQuery } from "@/lib/store/api/services/doctor.service"
import { APPOINTMENT_TYPE } from "@/enums/appointment.enum"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import AppointmentStatusBadge from "@/components/common/AppointmentStatusBadge"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import BookAppointmentDialog from "@/features/patient/components/BookAppointmentDialog"

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED"

interface DoctorOption {
  _id: string
  name: string
  specialization?: string[]
}

interface AppointmentItem {
  _id: string
  appointmentDate: string
  appointmentSlot: string
  reasonFor: string
  status: AppointmentStatus
  cancellationReason?: string
  doctor?: {
    name?: string
  }
}

const bookingSchema = z.object({
  doctor: z.string().min(1, "Doctor is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentSlot: z.string().min(1, "Appointment slot is required"),
  reasonFor: z.nativeEnum(APPOINTMENT_TYPE),
  problemDescription: z.string().optional(),
  paymentMethod: z.enum(["CASH", "SSL_COMMERZ"]),
})

type BookingFormValues = z.infer<typeof bookingSchema>

const PatientAppointmentsPage: React.FC = () => {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState("upcoming")
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false)

  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      doctor: "",
      appointmentDate: "",
      appointmentSlot: "",
      reasonFor: APPOINTMENT_TYPE.CHECK_UP,
      problemDescription: "",
      paymentMethod: "CASH",
    },
    mode: "onChange",
  })

  const { control, watch, handleSubmit, setValue, setError, reset, formState } =
    bookingForm

  const watchedDoctorId = watch("doctor")
  const watchedAppointmentDate = watch("appointmentDate")
  const watchedAppointmentSlot = watch("appointmentSlot")
  const watchedPaymentMethod = watch("paymentMethod")

  const { data: appointments = [], isLoading: appointmentsLoading } =
    useGetAppointmentsQuery(undefined)
  const typedAppointments = appointments as AppointmentItem[]
  const { data: doctorOptions = [] } = useGetDoctorOptionsQuery(undefined)
  const typedDoctorOptions = doctorOptions as DoctorOption[]

  console.log("doctorOptions :>> ", doctorOptions)

  const [createAppointment, { isLoading: createLoading }] =
    useCreateAppointmentMutation()
  const [cancelAppointment, { isLoading: cancelling }] =
    useCancelAppointmentMutation()

  const { data: slotsData, isLoading: slotsLoading } =
    useGetAvailableSlotsQuery(
      watchedDoctorId && watchedAppointmentDate
        ? {
            doctorId: watchedDoctorId,
            appointmentDate: watchedAppointmentDate,
            slotDuration: 30,
          }
        : null,
      { skip: !watchedDoctorId || !watchedAppointmentDate }
    )

  const availableSlots = useMemo(() => {
    if (!slotsData) return []
    return slotsData.availableSlots || slotsData.slots || []
  }, [slotsData])

  const selectedDate = useMemo(() => {
    if (!watchedAppointmentDate) return undefined

    const [year, month, day] = watchedAppointmentDate.split("-").map(Number)
    if (!year || !month || !day) return undefined

    return new Date(year, month - 1, day)
  }, [watchedAppointmentDate])

  useEffect(() => {
    setValue("appointmentSlot", "", { shouldValidate: true })
  }, [watchedDoctorId, watchedAppointmentDate, setValue])

  useEffect(() => {
    if (
      watchedAppointmentSlot &&
      !availableSlots.includes(watchedAppointmentSlot)
    ) {
      setValue("appointmentSlot", "", { shouldValidate: true })
    }
  }, [availableSlots, watchedAppointmentSlot, setValue])

  const upcomingAppointments = typedAppointments
    .filter((apt) => {
      const aptDate = new Date(apt.appointmentDate)
      return (
        (isFuture(aptDate) || isToday(aptDate)) &&
        ["PENDING", "CONFIRMED", "RESCHEDULED"].includes(apt.status)
      )
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
    )

  const pastAppointments = typedAppointments
    .filter((apt) => {
      const aptDate = new Date(apt.appointmentDate)
      return (
        (isPast(aptDate) && !isToday(aptDate)) ||
        ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(apt.status)
      )
    })
    .sort(
      (a, b) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime()
    )

  const doctorFieldOptions = useMemo(
    () =>
      typedDoctorOptions.map((doctor) => ({
        label: doctor.specialization?.length
          ? `${doctor.name} (${doctor.specialization.join(", ")})`
          : doctor.name,
        value: doctor._id,
      })),
    [typedDoctorOptions]
  )

  const reasonFieldOptions = useMemo(
    () => [
      { label: t("check-up"), value: APPOINTMENT_TYPE.CHECK_UP },
      { label: t("consultation"), value: APPOINTMENT_TYPE.CONSULTATION },
      { label: t("follow-up"), value: APPOINTMENT_TYPE.FOLLOW_UP },
      { label: t("emergency"), value: APPOINTMENT_TYPE.EMERGENCY },
      { label: t("vaccination"), value: APPOINTMENT_TYPE.VACCINATION },
    ],
    [t]
  )

  const paymentFieldOptions = useMemo(
    () => [
      { label: t("cash"), value: "CASH" },
      { label: "SSL Commerz", value: "SSL_COMMERZ" },
    ],
    [t]
  )

  const handleBookAppointment = handleSubmit(async (values) => {
    if (!availableSlots.includes(values.appointmentSlot)) {
      setError("appointmentSlot", {
        type: "validate",
        message: t("please select an available slot"),
      })
      return
    }

    try {
      await createAppointment({
        doctor: values.doctor,
        appointmentDate: new Date(values.appointmentDate).toISOString(),
        appointmentSlot: values.appointmentSlot,
        reasonFor: values.reasonFor,
        problemDescription: values.problemDescription || undefined,
        paymentMethod: values.paymentMethod,
      }).unwrap()

      toast.success(t("appointment booked"), {
        description: t("your appointment has been created successfully"),
      })

      setIsBookDialogOpen(false)
      reset()
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t("could not book appointment")

      toast.error(t("booking failed"), {
        description: message,
      })
    }
  })

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId).unwrap()
      // toast({ title: t("appointment cancelled") })
      toast.warning(t("appointment cancelled"), {
        description: t("your appointment has been cancelled successfully"),
      })
    } catch (error: unknown) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        t("could not cancel appointment")
      toast.error(t("cancellation failed"), {
        description: message,
      })
    }
  }

  return (
    <>
      <div className="fadeIn space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("my appointments")}
            </h1>
            <p className="text-muted-foreground">
              {t("view and manage your scheduled appointments")}
            </p>
          </div>
          <Button onClick={() => setIsBookDialogOpen(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            {t("book appointment")}
          </Button>
        </div>

        {appointmentsLoading && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t("loading appointments")}</p>
          </div>
        )}

        {!appointmentsLoading && (
          <Card>
            <CardHeader>
              <CardTitle>{t("your appointments")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">
                    {t("upcoming")}
                    {upcomingAppointments.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {upcomingAppointments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="past">{t("past")}</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="rounded-lg border bg-primary/20 p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex flex-1 items-start space-x-4">
                            <div className="shrink-0 rounded-full bg-background p-3">
                              <CalendarIcon className="text-clinic-primary h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {appointment.doctor?.name || t("doctor")}
                                </h3>
                                <AppointmentStatusBadge
                                  status={appointment.status}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {appointment.reasonFor}
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <CalendarIcon className="mr-1 h-4 w-4" />
                                  {format(
                                    new Date(appointment.appointmentDate),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  {appointment.appointmentSlot}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 self-end md:self-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              disabled={cancelling}
                              onClick={() =>
                                handleCancelAppointment(appointment._id)
                              }
                            >
                              {t("cancel")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-1">
                          <h3 className="font-medium">
                            {t("no upcoming appointments")}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t("you don't have any scheduled appointments yet")}
                          </p>
                        </div>
                        <Button onClick={() => setIsBookDialogOpen(true)}>
                          {t("book an appointment")}
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                  {pastAppointments.length > 0 ? (
                    pastAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className={cn(
                          "rounded-lg border p-4",
                          appointment.status === "COMPLETED"
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-red-500/20 bg-red-500/5"
                        )}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex flex-1 items-start space-x-4">
                            <div
                              className={cn(
                                "shrink-0 rounded-full p-3",
                                appointment.status === "COMPLETED"
                                  ? "bg-green-500/20"
                                  : "bg-red-500/20"
                              )}
                            >
                              {appointment.status === "COMPLETED" ? (
                                <Check className="h-6 w-6 text-green-700" />
                              ) : (
                                <X className="h-6 w-6 text-red-700" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">
                                  {appointment.doctor?.name || t("doctor")}
                                </h3>
                                <AppointmentStatusBadge
                                  status={appointment.status}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {appointment.reasonFor}
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <CalendarIcon className="mr-1 h-4 w-4" />
                                  {format(
                                    new Date(appointment.appointmentDate),
                                    "MMM dd, yyyy"
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  {appointment.appointmentSlot}
                                </div>
                              </div>
                              {appointment.cancellationReason && (
                                <p className="mt-2 text-xs text-red-700">
                                  <strong>{t("reason")}:</strong>{" "}
                                  {appointment.cancellationReason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      {t("you don't have any past appointments")}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      <BookAppointmentDialog
        open={isBookDialogOpen}
        onOpenChange={setIsBookDialogOpen}
        reset={reset}
        handleBookAppointment={handleBookAppointment}
        control={control}
        bookingForm={bookingForm}
        setValue={setValue}
        selectedDate={selectedDate}
        formState={formState}
        watchedDoctorId={watchedDoctorId}
        watchedAppointmentDate={watchedAppointmentDate}
        availableSlots={availableSlots}
        watchedAppointmentSlot={watchedAppointmentSlot}
        slotsLoading={slotsLoading}
        reasonFieldOptions={reasonFieldOptions}
        paymentFieldOptions={paymentFieldOptions}
        doctorFieldOptions={doctorFieldOptions}
        watchedPaymentMethod={watchedPaymentMethod}
        createLoading={createLoading}
      />
    </>
  )
}

export default PatientAppointmentsPage
