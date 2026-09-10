import React from "react"
import { useTranslation } from "react-i18next"
import StatsCard from "@/components/dashboard/StatsCard"
import AppointmentsList from "@/components/dashboard/AppointmentsList"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Calendar, Clock, Users, CheckCircle } from "lucide-react"
import { mockAppointments, mockPatients } from "@/lib/mock-data"

const DoctorDashboard: React.FC = () => {
  const { t } = useTranslation()

  // We'll simulate that these are the logged-in doctor's appointments
  const doctorId = "d1" // Dr. John Smith
  const doctorName = "Dr. John Smith"

  // Filter appointments for this doctor
  const doctorAppointments = mockAppointments
    .filter((a) => a.doctorId === doctorId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Today's appointments
  const today = new Date()
  const todayStr = today.toDateString()

  const todaysAppointments = doctorAppointments.filter(
    (a) => new Date(a.date).toDateString() === todayStr
  )

  // Completed appointments count
  const completedAppointments = doctorAppointments.filter(
    (a) => a.status === "completed"
  ).length

  // Upcoming appointments
  const upcomingAppointments = doctorAppointments
    .filter((a) => new Date(a.date) >= today && a.status === "scheduled")
    .slice(0, 5)

  // Recent patients (unique from appointments)
  const recentPatientIds = new Set(
    doctorAppointments
      .filter((a) => new Date(a.date) <= today)
      .map((a) => a.patientId)
  )

  // Get the patient objects from the IDs
  const doctorPatients = mockPatients
    .filter((p) => recentPatientIds.has(p.id))
    .slice(0, 5)

  return (
    <div className="fadeIn space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("doctor_dashboard")}
        </h1>
        <p className="text-muted-foreground">
          {t("welcome back doctor day summary", { doctorName })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatsCard
          title={t("today's appointments")}
          value={todaysAppointments.length}
          icon={Calendar}
        />
        <StatsCard
          title={t("upcoming_appointments")}
          value={upcomingAppointments.length}
          icon={Clock}
        />
        <StatsCard
          title={t("patients")}
          value={recentPatientIds.size}
          icon={Users}
        />
        <StatsCard
          title={t("completed visits")}
          value={completedAppointments}
          icon={CheckCircle}
        />
      </div>

      {/* Appointments and Patient Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <AppointmentsList
          appointments={todaysAppointments}
          title={t("today's schedule")}
          emptyMessage={t("no appointments scheduled for today")}
        />

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recent patients")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {doctorPatients.length > 0 ? (
                doctorPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center rounded-md border p-2"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          patient.name
                        )}&background=0D8ABC&color=fff`}
                        alt={patient.name}
                      />
                      <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.email}
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {patient.medicalHistory?.length
                        ? t("medical history list", {
                            history: patient.medicalHistory.join(", "),
                          })
                        : t("no medical history")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  {t("no recent patients")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <AppointmentsList
        appointments={upcomingAppointments}
        title={t("upcoming_appointments")}
        emptyMessage={t("no upcoming appointments")}
      />
    </div>
  )
}

export default DoctorDashboard
