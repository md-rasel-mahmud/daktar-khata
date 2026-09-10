import React, { useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarPlus, FileText, Pencil, Trash2 } from "lucide-react"
import { useSelector } from "react-redux"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Badge } from "@repo/ui/badge"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Textarea } from "@repo/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import {
  useAddMedicalRecordMutation,
  useDeleteMedicalRecordMutation,
  useUpdateMedicalRecordMutation,
} from "@/lib/store/api/services/patient.service"
import { toast } from "sonner"
import { type RootState } from "@/lib/store/store"

type PatientDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPatient: any | null
  onScheduleAppointment: () => void
}

const PatientDetailsDialog: React.FC<PatientDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedPatient = {
    _id: "",
    name: "",
    email: "",
    mobile: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    medicalHistory: [],
    appointments: [],
  },
  onScheduleAppointment,
}) => {
  const authUser = useSelector((state: RootState) => state.auth.user)
  const doctorId = authUser?.user?._id || ""
  const [addMedicalRecord, { isLoading: isSavingRecord }] =
    useAddMedicalRecordMutation()
  const [deleteMedicalRecord, { isLoading: isDeletingRecord }] =
    useDeleteMedicalRecordMutation()
  const [updateMedicalRecord, { isLoading: isUpdatingRecord }] =
    useUpdateMedicalRecordMutation()

  const [diagnosis, setDiagnosis] = useState("")
  const [prescriptionText, setPrescriptionText] = useState("")
  const [notes, setNotes] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [recordQuery, setRecordQuery] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [editDiagnosis, setEditDiagnosis] = useState("")
  const [editPrescriptionText, setEditPrescriptionText] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [editFollowUpDate, setEditFollowUpDate] = useState("")

  const patientId = selectedPatient._id || selectedPatient.id || ""
  const birthDateValue = selectedPatient.dateOfBirth || selectedPatient.dob
  const birthDate = birthDateValue ? new Date(birthDateValue) : null
  const canCreateRecord = Boolean(patientId && doctorId)

  const parsedPrescription = useMemo(
    () =>
      prescriptionText
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    [prescriptionText]
  )

  const parsedEditPrescription = useMemo(
    () =>
      editPrescriptionText
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    [editPrescriptionText]
  )

  const filteredRecords = useMemo(() => {
    const records = Array.isArray(selectedPatient.medicalRecords)
      ? selectedPatient.medicalRecords
      : []

    const normalizedQuery = recordQuery.trim().toLowerCase()

    return records.filter((record: any) => {
      const recordDate = record.date ? new Date(record.date) : null

      if (fromDate && recordDate && recordDate < new Date(fromDate)) {
        return false
      }

      if (toDate && recordDate) {
        const endDate = new Date(toDate)
        endDate.setHours(23, 59, 59, 999)
        if (recordDate > endDate) {
          return false
        }
      }

      if (!normalizedQuery) {
        return true
      }

      const prescriptionText = (record.prescription || []).join(" ")

      return (
        (record.diagnosis || "").toLowerCase().includes(normalizedQuery) ||
        (record.notes || "").toLowerCase().includes(normalizedQuery) ||
        (record.doctorName || "").toLowerCase().includes(normalizedQuery) ||
        prescriptionText.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [selectedPatient.medicalRecords, recordQuery, fromDate, toDate])

  const handleAddRecord = async () => {
    if (!canCreateRecord || !diagnosis.trim()) {
      toast.error("Missing required fields", {
        description: "Diagnosis is required to add a medical record.",
      })
      return
    }

    try {
      await addMedicalRecord({
        patientId,
        body: {
          doctorId,
          diagnosis: diagnosis.trim(),
          prescription: parsedPrescription,
          notes: notes.trim() || undefined,
          followUpDate: followUpDate || undefined,
        },
      }).unwrap()

      setDiagnosis("")
      setPrescriptionText("")
      setNotes("")
      setFollowUpDate("")

      toast.success("Medical record added", {
        description: "The patient medical record was saved successfully.",
      })
    } catch (error: any) {
      toast.error("Failed to add record", {
        description:
          error?.data?.message || "Could not save the medical record.",
      })
    }
  }

  const startEditRecord = (record: any) => {
    setEditingRecordId(record.id)
    setEditDiagnosis(record.diagnosis || "")
    setEditPrescriptionText((record.prescription || []).join("\n"))
    setEditNotes(record.notes || "")
    setEditFollowUpDate(
      record.followUpDate
        ? new Date(record.followUpDate).toISOString().slice(0, 10)
        : ""
    )
  }

  const cancelEditRecord = () => {
    setEditingRecordId(null)
    setEditDiagnosis("")
    setEditPrescriptionText("")
    setEditNotes("")
    setEditFollowUpDate("")
  }

  const saveEditRecord = async () => {
    if (!editingRecordId || !editDiagnosis.trim()) {
      toast.error("Missing required fields", {
        description: "Diagnosis is required to update a medical record.",
      })
      return
    }

    try {
      await updateMedicalRecord({
        recordId: editingRecordId,
        body: {
          diagnosis: editDiagnosis.trim(),
          prescription: parsedEditPrescription,
          notes: editNotes.trim() || undefined,
          followUpDate: editFollowUpDate || undefined,
        },
      }).unwrap()

      toast.success("Medical record updated", {
        description: "The selected medical record was updated successfully.",
      })

      cancelEditRecord()
    } catch (error: any) {
      toast.error("Update failed", {
        description:
          error?.data?.message || "Could not update the selected record.",
      })
    }
  }

  const handleDeleteRecord = async () => {
    if (!deleteTargetId) {
      return
    }

    try {
      await deleteMedicalRecord(deleteTargetId).unwrap()
      toast.success("Medical record deleted", {
        description: "The selected record has been removed.",
      })
      setDeleteTargetId(null)
    } catch (error: any) {
      toast.error("Delete failed", {
        description:
          error?.data?.message || "Could not delete the selected record.",
      })
    }
  }

  if (!selectedPatient) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Patient Information</DialogTitle>
        </DialogHeader>

        <div className="no-scrollbar max-h-[80vh] space-y-6 overflow-y-auto px-4">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="md:w-1/3">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedPatient.name
                    )}&background=0D8ABC&color=fff&size=128`}
                  />
                  <AvatarFallback className="text-2xl">
                    {selectedPatient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                {birthDate ? (
                  <p className="text-muted-foreground">
                    {format(birthDate, "MMMM dd, yyyy")} (
                    {new Date().getFullYear() - birthDate.getFullYear()} years)
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Date of Birth not available
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:w-2/3">
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="capitalize">{selectedPatient.gender || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{selectedPatient.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p>{selectedPatient.mobile || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p>{selectedPatient.address || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Medical History</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedPatient.medicalHistory?.length ? (
                    selectedPatient.medicalHistory.map(
                      (item: string, index: number) => (
                        <Badge
                          key={`${item}-${index}`}
                          variant="outline"
                          className="border-yellow-200 bg-yellow-50 text-yellow-800"
                        >
                          {item}
                        </Badge>
                      )
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No medical history recorded
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onScheduleAppointment}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>

          <Tabs defaultValue="records">
            <TabsList className="mb-4">
              <TabsTrigger value="records">Medical Records</TabsTrigger>
              <TabsTrigger value="appointments">
                Appointment History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Add Medical Record
                  </CardTitle>
                  <CardDescription>
                    Create a new clinical note for this patient.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                  <Textarea
                    placeholder="Prescription (comma or newline separated)"
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                  />
                  <Textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">
                      Follow-up Date
                    </p>
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddRecord}
                      disabled={!canCreateRecord || isSavingRecord}
                    >
                      {isSavingRecord ? "Saving..." : "Save Record"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Find Records</CardTitle>
                  <CardDescription>
                    Search by diagnosis, notes, or prescription and filter by
                    date.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <Input
                    placeholder="Search records"
                    value={recordQuery}
                    onChange={(e) => setRecordQuery(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </CardContent>
              </Card>

              {filteredRecords.length ? (
                filteredRecords.map((record: any) => (
                  <Card key={record.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {format(new Date(record.date), "MMMM dd, yyyy")}
                          </CardTitle>
                          <CardDescription>
                            {record.doctorName || "-"}
                          </CardDescription>
                        </div>
                        <FileText className="text-clinic-primary h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editingRecordId === record.id ? (
                        <>
                          <Input
                            placeholder="Diagnosis"
                            value={editDiagnosis}
                            onChange={(e) => setEditDiagnosis(e.target.value)}
                          />
                          <Textarea
                            placeholder="Prescription (comma or newline separated)"
                            value={editPrescriptionText}
                            onChange={(e) =>
                              setEditPrescriptionText(e.target.value)
                            }
                          />
                          <Textarea
                            placeholder="Notes"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                          <div>
                            <p className="mb-1 text-sm text-muted-foreground">
                              Follow-up Date
                            </p>
                            <Input
                              type="date"
                              value={editFollowUpDate}
                              onChange={(e) =>
                                setEditFollowUpDate(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditRecord}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              disabled={isUpdatingRecord}
                              onClick={saveEditRecord}
                            >
                              {isUpdatingRecord ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Diagnosis
                            </p>
                            <p className="font-medium">
                              {record.diagnosis || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Prescription
                            </p>
                            <ul className="list-inside list-disc space-y-1 pl-2">
                              {(record.prescription || []).length > 0 ? (
                                record.prescription.map(
                                  (med: string, index: number) => (
                                    <li
                                      key={`${med}-${index}`}
                                      className="text-sm"
                                    >
                                      {med}
                                    </li>
                                  )
                                )
                              ) : (
                                <li className="text-sm text-muted-foreground">
                                  No prescription recorded
                                </li>
                              )}
                            </ul>
                          </div>
                          {record.notes && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Notes
                              </p>
                              <p className="text-sm">{record.notes}</p>
                            </div>
                          )}
                          {record.followUpDate && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Follow-up Date
                              </p>
                              <p className="text-sm">
                                {format(
                                  new Date(record.followUpDate),
                                  "MMMM dd, yyyy"
                                )}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditRecord(record)}
                            >
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isDeletingRecord}
                              onClick={() => setDeleteTargetId(record.id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No medical records found for this patient.
                </div>
              )}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              {selectedPatient.appointments?.length ? (
                selectedPatient.appointments.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {appointment.date
                          ? format(new Date(appointment.date), "MMMM dd, yyyy")
                          : "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time || "-"} -{" "}
                        {appointment.type || "Consultation"}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 text-xs font-normal capitalize"
                      >
                        {appointment.status || "unknown"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No appointment history found for this patient.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected medical record will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRecord}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecord}
              disabled={isDeletingRecord}
            >
              {isDeletingRecord ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

export default PatientDetailsDialog
