import React from "react"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import StatsCard from "@/components/dashboard/StatsCard"
import AppointmentsList, { type Appointment } from "@/components/dashboard/AppointmentsList"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Bed,
  HeartPulse,
  FlaskConical,
  Coins,
} from "lucide-react"
import { Skeleton } from "@repo/ui/skeleton"
import { type RootState } from "@/lib/store/store"
import { useGetDoctorDashboardQuery } from "@/lib/store/api/services/dashboard.service"
import { useGetAppointmentsQuery } from "@/lib/store/api/services/appointment.service"

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const doctorName = authUser?.profile?.name || authUser?.user?.phone || "Doctor"

  const { data: doctorMetrics, isLoading: isMetricsLoading } = useGetDoctorDashboardQuery()
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useGetAppointmentsQuery(undefined)

  const rawAppointments = Array.isArray(appointmentsData) ? appointmentsData : []

  // Map backend appointments
  const mappedAppointments: Appointment[] = rawAppointments.map((a: any) => {
    const parsedDate = a.appointmentDate ? new Date(a.appointmentDate) : new Date()
    return {
      id: a._id || a.id || String(Math.random()),
      patientName:
        typeof a.patient === "object" && a.patient?.name
          ? a.patient.name
          : a.patientName || "Patient",
      doctorName:
        typeof a.doctor === "object" && a.doctor?.name
          ? a.doctor.name
          : a.doctorName || doctorName,
      date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      time: a.appointmentSlot || a.time || "N/A",
      status: (a.status?.toLowerCase() === "completed"
        ? "completed"
        : a.status?.toLowerCase() === "cancelled"
          ? "cancelled"
          : "scheduled") as "scheduled" | "completed" | "cancelled",
      type: a.reasonFor || a.type || "Consultation",
    }
  })

  const todayStr = new Date().toDateString()
  const todaysSchedule = mappedAppointments.filter(
    (a) => a.date.toDateString() === todayStr
  )
  const upcomingAppointments = mappedAppointments
    .filter((a) => a.status === "scheduled" && a.date >= new Date())
    .slice(0, 5)

  // Extract recent unique patients from appointments
  const patientMap = new Map<string, any>()
  rawAppointments.forEach((a: any) => {
    if (a.patient && typeof a.patient === "object" && a.patient._id) {
      if (!patientMap.has(a.patient._id)) {
        patientMap.set(a.patient._id, a.patient)
      }
    }
  })
  const recentPatients = Array.from(patientMap.values()).slice(0, 5)

  if (isMetricsLoading && isAppointmentsLoading) {
    return (
      <div className="space-y-6 p-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const metrics = doctorMetrics || {}

  return (
    <div className="fadeIn space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("doctor_dashboard", "Doctor Workstation")}
        </h1>
        <p className="text-muted-foreground">
          {t("welcome_back_doctor_day_summary", "Welcome back, {{doctorName}}. Here is your clinical summary today.", { doctorName })}
        </p>
      </div>

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("today_appointments", "Today's Appointments")}
          value={metrics.todayAppointments ?? todaysSchedule.length}
          icon={Calendar}
          description={`${metrics.completedToday ?? 0} finished today`}
        />
        <StatsCard
          title={t("waiting_queue", "Waiting Queue")}
          value={metrics.waitingQueue ?? 0}
          icon={Clock}
          description={t("patients_in_waiting_room", "Patients in queue room")}
        />
        <StatsCard
          title={t("completed_today", "Completed Consultations")}
          value={metrics.completedToday ?? 0}
          icon={CheckCircle}
          description={t("concluded_today", "Consultations completed today")}
        />
        <StatsCard
          title={t("unsettled_commissions", "Earned Commissions")}
          value={`৳${(metrics.unsettledCommissions ?? 0).toLocaleString()}`}
          icon={Coins}
          description={t("payable_or_earned", "Approved & payable amount")}
        />
      </div>

      {/* Clinical Care Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {t("inpatient_under_care", "Admitted Patients Under Care")}
              </CardTitle>
              <Bed className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {metrics.activeAdmissions ?? 0}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t("active_ipd_cases", "Active admitted IPD patients")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/40 dark:border-purple-900 dark:bg-purple-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                {t("upcoming_ot_surgeries", "Upcoming OT Surgeries")}
              </CardTitle>
              <HeartPulse className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {metrics.upcomingOperations ?? 0}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              {t("surgical_cases_assigned", "Assigned as lead or assistant")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {t("pending_lab_orders", "Pending Patient Lab Tests")}
              </CardTitle>
              <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {metrics.pendingLabOrders ?? 0}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {t("awaiting_test_results", "Referred tests awaiting lab completion")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments and Patient Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <AppointmentsList
          appointments={todaysSchedule}
          title={t("today_schedule", "Today's Appointment Schedule")}
          emptyMessage={t("no_appointments_today", "No appointments scheduled for today.")}
        />

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_patients", "Recent Patients")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.length > 0 ? (
                recentPatients.map((patient: any) => (
                  <div
                    key={patient._id || patient.id}
                    className="flex items-center rounded-md border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          patient.name || "P"
                        )}&background=0D8ABC&color=fff`}
                        alt={patient.name || "Patient"}
                      />
                      <AvatarFallback>{(patient.name || "P").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-medium">{patient.name || "Patient"}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.phone || patient.email || "No contact info"}
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {patient.gender ? `${patient.gender} · ` : ""}
                      {patient.bloodGroup ? `${patient.bloodGroup}` : "Patient"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  {t("no_recent_patients", "No recent patients found.")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <AppointmentsList
        appointments={upcomingAppointments}
        title={t("upcoming_appointments", "Upcoming Scheduled Appointments")}
        emptyMessage={t("no_upcoming_appointments", "No upcoming appointments scheduled.")}
      />
    </div>
  )
}

export default DoctorDashboard
