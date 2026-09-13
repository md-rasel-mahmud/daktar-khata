import React from "react"
import { useTranslation } from "react-i18next"
import StatsCard from "@/components/dashboard/StatsCard"
import AppointmentsList, { type Appointment } from "@/components/dashboard/AppointmentsList"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  Bed,
  Activity,
  AlertTriangle,
  UserPlus,
  HeartPulse,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useGetMerchantDashboardQuery } from "@/lib/store/api/services/dashboard.service"
import { useGetAppointmentsQuery } from "@/lib/store/api/services/appointment.service"
import { Skeleton } from "@repo/ui/skeleton"

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetMerchantDashboardQuery()
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useGetAppointmentsQuery(undefined)

  const overview = dashboardData?.overview || {}
  const appointmentsStats = dashboardData?.appointments || {}
  const inpatient = dashboardData?.inpatient || {}
  const finances = dashboardData?.finances || {}
  const operations = dashboardData?.operations || {}
  const inventory = dashboardData?.inventory || {}
  const staffAttendance = dashboardData?.staffAttendance || {}

  // Map backend appointments to AppointmentsList format
  const rawAppointments = Array.isArray(appointmentsData) ? appointmentsData : []
  const mappedAppointments: Appointment[] = rawAppointments
    .map((a: any) => {
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
            : a.doctorName || "Doctor",
        date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        time: a.appointmentSlot || a.time || "N/A",
        status: (a.status?.toLowerCase() === "completed"
          ? "completed"
          : a.status?.toLowerCase() === "cancelled"
            ? "cancelled"
            : "scheduled") as "scheduled" | "completed" | "cancelled",
        type: a.reasonFor || a.type || "General Consultation",
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8)

  // Chart data 1: Appointment flow today
  const appointmentFlowData = [
    { stage: t("today_total", "Total"), count: appointmentsStats.todayTotal ?? 0 },
    { stage: t("confirmed", "Confirmed"), count: appointmentsStats.confirmed ?? 0 },
    { stage: t("waiting_queue", "Waiting"), count: appointmentsStats.queueWaiting ?? 0 },
    { stage: t("in_consultation", "Consulting"), count: appointmentsStats.queueInConsultation ?? 0 },
    { stage: t("completed", "Completed"), count: appointmentsStats.completed ?? 0 },
    { stage: t("cancelled", "Cancelled"), count: appointmentsStats.cancelled ?? 0 },
  ]

  // Chart data 2: Inpatient & Clinical Capacity
  const facilityCapacityData = [
    { metric: t("active_admissions", "Admissions"), count: inpatient.activeAdmissions ?? 0 },
    { metric: t("occupied_beds", "Occupied Beds"), count: inpatient.occupiedBeds ?? 0 },
    { metric: t("available_beds", "Available Beds"), count: inpatient.availableBeds ?? 0 },
    { metric: t("surgeries", "Surgeries"), count: operations.upcoming ?? 0 },
    { metric: t("low_stock", "Low Stock"), count: inventory.lowStockItems ?? 0 },
  ]

  if (isDashboardLoading && isAppointmentsLoading) {
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

  return (
    <div className="fadeIn space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin_dashboard", "Clinic Admin Dashboard")}
        </h1>
        <p className="text-muted-foreground">
          {t("welcome_back_clinic_overview", "Live operational metrics, finances, queue, and clinical capacity.")}
        </p>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("total_patients", "Total Patients")}
          value={overview.totalPatients ?? 0}
          icon={Users}
          description={t("registered_patients", "Active registered patients")}
        />
        <StatsCard
          title={t("total_doctors", "Doctors & Specialists")}
          value={overview.totalDoctors ?? 0}
          icon={UserCheck}
          description={t("active_doctors", "Active roster physicians")}
        />
        <StatsCard
          title={t("today_appointments", "Today's Appointments")}
          value={appointmentsStats.todayTotal ?? 0}
          icon={Calendar}
          description={`${appointmentsStats.completed ?? 0} completed · ${appointmentsStats.confirmed ?? 0} confirmed`}
        />
        <StatsCard
          title={t("waiting_queue", "Live Waiting Queue")}
          value={appointmentsStats.queueWaiting ?? 0}
          icon={Clock}
          description={`${appointmentsStats.queueInConsultation ?? 0} currently in consultation`}
        />
      </div>

      {/* Secondary Clinical & Financial KPI Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("bed_occupancy", "Bed Occupancy")}
          value={`${inpatient.occupancyRate ?? 0}%`}
          icon={Bed}
          description={`${inpatient.occupiedBeds ?? 0} of ${inpatient.totalBeds ?? 0} beds occupied`}
        />
        <StatsCard
          title={t("today_income", "Today's Income")}
          value={`৳${(finances.todayIncome ?? 0).toLocaleString()}`}
          icon={DollarSign}
          description={`Expenses: ৳${(finances.todayExpenses ?? 0).toLocaleString()}`}
        />
        <StatsCard
          title={t("net_daily_revenue", "Net Daily Revenue")}
          value={`৳${(finances.netRevenue ?? 0).toLocaleString()}`}
          icon={Activity}
          description={`Pending Dues: ৳${(finances.pendingDues ?? 0).toLocaleString()}`}
        />
        <StatsCard
          title={t("staff_attendance", "Staff Attendance")}
          value={`${staffAttendance.present ?? 0} / ${staffAttendance.totalStaff ?? overview.totalStaff ?? 0}`}
          icon={UserPlus}
          description={`${staffAttendance.absent ?? 0} absent · ${staffAttendance.leave ?? 0} on leave`}
        />
      </div>

      {/* Operational Alerts Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {t("low_stock_alerts", "Low Stock Inventory Alerts")}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {inventory.lowStockItems ?? 0}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {inventory.lowStockItems ? t("items_at_or_below_reorder", "Items needing replenishment") : t("all_stock_healthy", "All inventory levels healthy")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {t("scheduled_operations", "Upcoming OT Surgeries")}
              </CardTitle>
              <HeartPulse className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {operations.upcoming ?? 0}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t("cases_planned_scheduled_or_ready", "Cases planned or ready for OT")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40 sm:col-span-2 lg:col-span-1 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                {t("inpatient_admissions", "Inpatient Active Cases")}
              </CardTitle>
              <Bed className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {inpatient.activeAdmissions ?? 0}
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {`${inpatient.availableBeds ?? 0} beds currently available for admission`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("todays_appointment_flow", "Today's Patient Queue Flow")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentFlowData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="stage" tickLine={false} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("clinical_capacity_metrics", "Clinical & Inpatient Metrics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityCapacityData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="metric" tickLine={false} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Appointments List */}
      <div className="space-y-4">
        <AppointmentsList
          appointments={mappedAppointments}
          title={t("recent_appointments", "Recent Appointments & Queue")}
          emptyMessage={t("no_recent_appointments", "No appointments recorded in the system.")}
        />
      </div>
    </div>
  )
}

export default AdminDashboard
