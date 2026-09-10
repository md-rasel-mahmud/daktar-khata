import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import { useSelector } from "react-redux"
import { Search, FileText, Calendar, Download, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import RecordDetailsDialog from "@/features/patient/components/RecordDetailsDialog"
import { useGetPatientMedicalRecordsQuery } from "@/lib/store/api/services/patient.service"
import { type RootState } from "@/lib/store/store"

type MedicalRecord = {
  id: string
  appointmentId?: string
  patientId?: string
  patientName?: string
  doctorId?: string
  doctorName?: string
  date: string | Date
  diagnosis?: string
  prescription?: string[]
  notes?: string
  followUpDate?: string | Date
}

const PatientMedicalRecords: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const patientId = user?.user?._id || ""

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  )
  const [isRecordDetailsOpen, setIsRecordDetailsOpen] = useState(false)

  const { data: medicalRecords = [], isLoading } =
    useGetPatientMedicalRecordsQuery(patientId, { skip: !patientId })

  const filteredRecords = useMemo(() => {
    const records = Array.isArray(medicalRecords)
      ? (medicalRecords as MedicalRecord[])
      : []

    const normalizedQuery = searchQuery.trim().toLowerCase()

    return records
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((record) => {
        if (!normalizedQuery) {
          return true
        }

        const prescriptionText = (record.prescription || []).join(" ")

        return (
          (record.diagnosis || "").toLowerCase().includes(normalizedQuery) ||
          (record.doctorName || "").toLowerCase().includes(normalizedQuery) ||
          (record.notes || "").toLowerCase().includes(normalizedQuery) ||
          prescriptionText.toLowerCase().includes(normalizedQuery)
        )
      })
  }, [medicalRecords, searchQuery])

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsRecordDetailsOpen(true)
  }

  const handleDownloadRecord = (_recordId: string) => {
    toast.success("Download Started", {
      description: "Your medical record is being downloaded.",
    })
  }

  return (
    <>
      <div className="fadeIn space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">
            View and manage your medical history.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search records..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading records...
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <Card
                  key={record.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">
                          {format(new Date(record.date), "MMMM dd, yyyy")}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {record.doctorName || "Doctor"}
                        </div>
                      </div>
                      <FileText className="text-clinic-primary h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Diagnosis
                        </p>
                        <p className="font-medium">
                          {record.diagnosis || "Consultation"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(record.prescription || []).length > 0 ? (
                          record.prescription!.map((med, index) => (
                            <Badge
                              key={`${med}-${index}`}
                              variant="outline"
                              className="border-blue-200 bg-blue-50 text-blue-800"
                            >
                              {med.split(",")[0]}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No prescription recorded
                          </span>
                        )}
                      </div>
                      {record.followUpDate && (
                        <div className="text-clinic-primary flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span>
                            Follow-up on{" "}
                            {format(
                              new Date(record.followUpDate),
                              "MMMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadRecord(record.id)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleViewRecord(record)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-1">
                    <h3 className="font-medium">No records found</h3>
                    {searchQuery ? (
                      <p className="text-sm text-muted-foreground">
                        We couldn't find any records matching "{searchQuery}"
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        You don't have any medical records yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <RecordDetailsDialog
        open={isRecordDetailsOpen}
        onOpenChange={setIsRecordDetailsOpen}
        selectedRecord={selectedRecord}
        onDownloadRecord={handleDownloadRecord}
      />
    </>
  )
}

export default PatientMedicalRecords
