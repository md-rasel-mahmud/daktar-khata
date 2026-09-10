import React from "react"
import { useTranslation } from "react-i18next"
// import DashboardLayout from "@/components/layout/DashboardLayout"
import StatsCard from "@/components/dashboard/StatsCard"
import AppointmentsList from "@/components/dashboard/AppointmentsList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  AlertCircle,
  DollarSign,
} from "lucide-react"
import { mockAppointments, mockStats } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
// import { Outlet } from "react-router"

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation()

  // Filter only today's and upcoming appointments for display
  const recentAppointments = mockAppointments
    .filter((a) => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const appointmentTypeData = mockStats.appointmentsByType
  const doctorAppointmentData = mockStats.appointmentsByDoctor

  return (
    <div className="fadeIn space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin_dashboard")}
        </h1>
        <p className="text-muted-foreground">
          {t("welcome back clinic overview")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatsCard
          title={t("total patients")}
          value={mockStats.totalPatients}
          icon={Users}
          description={t("registered patients")}
          trend={{ value: mockStats.patientGrowthRate, positive: true }}
        />
        <StatsCard
          title={t("total doctors")}
          value={mockStats.totalDoctors}
          icon={UserCheck}
          description={t("medical staff")}
        />
        <StatsCard
          title={t("today's appointments")}
          value={mockStats.appointmentsToday}
          icon={Calendar}
          description={t("completed count", {
            count: mockStats.completedAppointments,
          })}
        />
        <StatsCard
          title={t("monthly revenue")}
          value={`$${mockStats.revenue.thisMonth.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: mockStats.revenue.growth, positive: true }}
        />
      </div>

      {/* Appointments and Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <AppointmentsList
          appointments={recentAppointments}
          title={t("upcoming_appointments")}
          emptyMessage={t("no upcoming appointments")}
        />

        {/* Appointments by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("appointments by type")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={appointmentTypeData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0EA5E9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("appointments by doctor")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={doctorAppointmentData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="doctor" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#38BDF8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
