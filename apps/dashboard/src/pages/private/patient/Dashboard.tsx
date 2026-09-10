import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import {
  Calendar,
  FileText,
  Users,
  ArrowRight,
  CalendarPlus,
} from "lucide-react"
import { format } from "date-fns"
import { Link } from "react-router"
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store/store"
import {
  useGetPatientAppointmentsQuery,
  useGetPatientMedicalRecordsQuery,
} from "@/lib/store/api/services/patient.service"

const PatientDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const profile = user?.profile || null
  const patientId = user?.user?._id || ""

  // Fetch data from API
  const { data: appointments = [], isLoading: appointmentsLoading } =
    useGetPatientAppointmentsQuery(patientId, { skip: !patientId })
  const { data: medicalRecords = [], isLoading: recordsLoading } =
    useGetPatientMedicalRecordsQuery(patientId, { skip: !patientId })

  // Sort appointments
  const patientAppointments = Array.isArray(appointments)
    ? [...appointments].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    : []

  // Upcoming appointments
  const upcomingAppointments = patientAppointments.filter(
    (a) => new Date(a.date) >= new Date() && a.status === "scheduled"
  )

  // Most recent appointment
  const nextAppointment = upcomingAppointments[0]

  // Sort medical records
  const patientRecords = Array.isArray(medicalRecords)
    ? [...medicalRecords].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : []

  const latestRecord = patientRecords[0]

  return (
    <div className="fadeIn space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.name || "Patient"}! Here's your health
          summary.
        </p>
      </div>

      {/* Next Appointment Card */}
      <Card className="border-l-clinic-primary border-l-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="text-clinic-primary mr-2 h-6 w-6" />
            {nextAppointment
              ? "Your Next Appointment"
              : "No Upcoming Appointments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextAppointment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(nextAppointment.date), "MMMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{nextAppointment.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{nextAppointment.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {nextAppointment.type || "Consultation"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {nextAppointment.status}
                </Badge>
                <Link to="/patient/appointments">
                  <Button size="sm" variant="outline">
                    View All Appointments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>You don't have any scheduled appointments.</p>
              <Button className="bg-clinic-primary hover:bg-clinic-dark">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Book an Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Calendar className="mr-2 h-4 w-4" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingAppointments.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <FileText className="mr-2 h-4 w-4" />
              Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientRecords.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Users className="mr-2 h-4 w-4" />
              Your Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(patientAppointments.map((a) => a.doctorId)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Medical Record */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="text-clinic-primary mr-2 h-6 w-6" />
            Latest Medical Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestRecord ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(latestRecord.date), "MMMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{latestRecord.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="font-medium">{latestRecord.diagnosis}</p>
                </div>
                {latestRecord.followUpDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Follow-up Date
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(latestRecord.followUpDate),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prescription</p>
                <ul className="list-inside list-disc space-y-1">
                  {latestRecord.prescription.map((med, index) => (
                    <li key={index} className="text-sm">
                      {med}
                    </li>
                  ))}
                </ul>
              </div>
              {latestRecord.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{latestRecord.notes}</p>
                </div>
              )}
              <div className="flex justify-end">
                <Link to="/patient/records">
                  <Button size="sm" variant="outline">
                    View All Records
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No medical records available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientDashboard
