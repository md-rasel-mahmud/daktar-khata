import React from "react"
import { format } from "date-fns"
import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type RecordDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRecord: any | null
  onDownloadRecord: (recordId: string) => void
}

const RecordDetailsDialog: React.FC<RecordDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedRecord,
  onDownloadRecord,
}) => {
  if (!selectedRecord) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Medical Record Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(selectedRecord.date), "MMMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="font-medium">{selectedRecord.doctorName}</p>
            </div>
            {selectedRecord.followUpDate && (
              <div>
                <p className="text-sm text-muted-foreground">Follow-up Date</p>
                <p className="font-medium">
                  {format(
                    new Date(selectedRecord.followUpDate),
                    "MMMM dd, yyyy"
                  )}
                </p>
              </div>
            )}
          </div>

          <div>
            <p className="mb-1 text-sm text-muted-foreground">Diagnosis</p>
            <div className="rounded-md bg-blue-50 p-3">
              <p>{selectedRecord.diagnosis}</p>
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm text-muted-foreground">Prescription</p>
            <div className="rounded-md bg-blue-50 p-3">
              <ul className="list-inside list-disc space-y-2">
                {(selectedRecord.prescription || []).length > 0 ? (
                  selectedRecord.prescription.map(
                    (med: string, index: number) => (
                      <li key={`${med}-${index}`}>{med}</li>
                    )
                  )
                ) : (
                  <li className="text-muted-foreground">
                    No prescription recorded
                  </li>
                )}
              </ul>
            </div>
          </div>

          {selectedRecord.notes && (
            <div>
              <p className="mb-1 text-sm text-muted-foreground">
                Doctor's Notes
              </p>
              <div className="rounded-md bg-blue-50 p-3">
                <p>{selectedRecord.notes}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onDownloadRecord(selectedRecord.id)}
            >
              <Download className="mr-1 h-4 w-4" />
              Download Record
            </Button>
            {selectedRecord.followUpDate &&
              new Date(selectedRecord.followUpDate) > new Date() && (
                <Button>
                  Book Follow-up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RecordDetailsDialog
