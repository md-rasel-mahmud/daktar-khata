import React, { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import PatientDetailsDialog from "@/features/doctor/components/PatientDetailsDialog"
import {
  useGetPatientAppointmentsQuery,
  useGetPatientByIdQuery,
  useGetPatientMedicalRecordsQuery,
  useGetPatientsQuery,
} from "@/lib/store/api/services/patient.service"
import type { UserStatus } from "@/enums/status.enum"

type PatientRecord = {
  _id?: string
  id?: string
  name: string
  email: string
  mobile: string
  gender?: string
  dob?: string
  dateOfBirth?: Date
  address?: string
  medicalHistory?: string[] | string
  lastVisited?: string
  emergencyContact?: string
  bloodGroup?: string
  status: UserStatus
}

type PatientAppointment = {
  id: string
  date: string
  time: string
  type: string
  status: string
}

type PatientMedicalRecord = {
  id: string
  date: string
  doctorName: string
  diagnosis: string
  prescription: string[]
  notes: string
  followUpDate: string
}

type EnrichedPatient = PatientRecord & {
  medicalRecords: PatientMedicalRecord[]
  appointments: PatientAppointment[]
}

const normalizeMedicalHistory = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value
  }

  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const DoctorPatients: React.FC = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] =
    useState<EnrichedPatient | null>(null)
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false)

  const { data: apiPatients = [], isLoading } = useGetPatientsQuery(undefined)

  const selectedPatientId = selectedPatient?._id || selectedPatient?.id || ""
  const { data: selectedPatientAppointments = [] } =
    useGetPatientAppointmentsQuery(selectedPatientId, {
      skip: !selectedPatientId,
    })
  const { data: selectedPatientMedicalRecords = [] } =
    useGetPatientMedicalRecordsQuery(selectedPatientId, {
      skip: !selectedPatientId,
    })
  const { data: selectedPatientProfile } = useGetPatientByIdQuery(
    selectedPatientId,
    { skip: !selectedPatientId }
  )

  const patients = apiPatients as PatientRecord[]

  const filteredPatients = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return patients
    }

    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(normalizedQuery) ||
        patient.email.toLowerCase().includes(normalizedQuery) ||
        patient.mobile.includes(normalizedQuery)
    )
  }, [searchQuery, patients])

  const handleViewPatient = useCallback((patient: PatientRecord) => {
    setSelectedPatient({
      ...patient,
      medicalHistory: normalizeMedicalHistory(patient.medicalHistory),
      medicalRecords: [],
      appointments: [],
    })
    setIsPatientDetailsOpen(true)
  }, [])

  const handleScheduleAppointment = useCallback(() => {
    toast.success(t("appointment scheduler"), {
      description: t("the appointment scheduler will open here"),
    })
  }, [toast, t])

  const patientColumns = useMemo<DataTableColumn<PatientRecord>[]>(
    () => [
      {
        id: "patient",
        header: t("patient"),
        sortable: true,
        sortValue: (patient) => patient.name,
        cell: (patient) => {
          return (
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    patient.name
                  )}&background=0D8ABC&color=fff`}
                />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.address || t("no address provided")}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        id: "gender",
        header: t("gender"),
        sortable: true,
        sortValue: (patient) => patient.gender,
        cell: (patient) => {
          return <span className="capitalize">{patient.gender}</span>
        },
      },
      {
        id: "bloodGroup",
        header: t("blood group"),
        sortable: false,
        cell: (patient) => patient.bloodGroup || t("not specified"),
      },
      {
        id: "contact",
        header: t("contact"),
        cell: (patient) => (
          <div>
            <p>{patient.email}</p>
            <p className="text-sm text-muted-foreground">{patient.mobile}</p>
          </div>
        ),
      },
      {
        id: "medicalHistory",
        header: t("medical history"),
        cell: (patient) => {
          return (
            <div className="max-w-50">
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {typeof patient.medicalHistory === "string" ? (
                    <>{patient.medicalHistory}</>
                  ) : (
                    patient.medicalHistory.slice(0, 3).map((item, index) => (
                      <Badge
                        key={`${item}-${index}`}
                        variant="outline"
                        className="border-yellow-200 bg-yellow-50 text-yellow-800"
                      >
                        {item}
                      </Badge>
                    ))
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t("none recorded")}
                </span>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: t("actions"),
        headerClassName: "text-right",
        className: "text-right",
        cell: (patient) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewPatient(patient)}
          >
            {t("view details")}
          </Button>
        ),
      },
    ],
    [handleViewPatient, t]
  )

  const dialogPatient = useMemo<EnrichedPatient | null>(() => {
    if (!selectedPatient) {
      return null
    }

    const profile = selectedPatientProfile as Record<string, any> | undefined

    return {
      ...selectedPatient,
      ...(profile
        ? {
            ...profile,
            medicalHistory: normalizeMedicalHistory(profile.medicalHistory),
          }
        : {}),
      appointments: (selectedPatientAppointments as any[]).map(
        (appointment) => ({
          id: appointment._id || appointment.id,
          date: appointment.appointmentDate,
          time: appointment.appointmentSlot,
          type: appointment.reasonFor,
          status: appointment.status,
        })
      ),
      medicalRecords: (selectedPatientMedicalRecords as any[]).map(
        (record) => ({
          id: record.id || record._id,
          date: record.date,
          doctorName: record.doctorName,
          diagnosis: record.diagnosis,
          prescription: record.prescription || [],
          notes: record.notes,
          followUpDate: record.followUpDate,
        })
      ),
    }
  }, [
    selectedPatient,
    selectedPatientAppointments,
    selectedPatientMedicalRecords,
    selectedPatientProfile,
  ])

  return (
    <>
      <div className="fadeIn space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("patients")}</h1>
          <p className="text-muted-foreground">
            {t("view and manage your patients")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("your patients")}</CardTitle>
            <CardDescription>
              {t("you have x patients", { count: filteredPatients.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                {t("loading patients")}
              </div>
            ) : null}

            <ClientDataTable
              data={filteredPatients}
              columns={patientColumns}
              getRowId={(patient, index) =>
                patient._id || patient.id || `${patient.email}-${index}`
              }
              searchPlaceholder={t("search patients")}
              searchKeys={[
                (patient) => patient.name,
                (patient) => patient.email,
                (patient) => patient.mobile,
              ]}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              emptyMessage={t("no patients found matching your search")}
              defaultSort={{ columnId: "patient", direction: "asc" }}
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={10}
            />
          </CardContent>
        </Card>
      </div>

      {dialogPatient && (
        <PatientDetailsDialog
          open={isPatientDetailsOpen}
          onOpenChange={setIsPatientDetailsOpen}
          selectedPatient={dialogPatient}
          onScheduleAppointment={handleScheduleAppointment}
        />
      )}
    </>
  )
}

export default DoctorPatients
