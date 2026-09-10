import React from "react"
import { Clock } from "lucide-react"
import type { Doctor } from "@/types/doctor.type"
import { Badge } from "@repo/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"

type DoctorScheduleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: Doctor | null
}

const DoctorScheduleDialog: React.FC<DoctorScheduleDialogProps> = ({
  open,
  onOpenChange,
  doctor,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Doctor's Schedule</DialogTitle>
          <DialogDescription>
            {doctor?.name}'s weekly availability
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {doctor?.schedules?.map((slot, index) => (
            <div
              key={`${slot.startTime}-${slot.endTime}-${index}`}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <div>
                  {slot.days.map((day) => (
                    <Badge key={day} variant="secondary" className="mr-1 mb-1">
                      {day}
                    </Badge>
                  ))}
                </div>

                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={15} /> {slot.startTime} - {slot.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DoctorScheduleDialog
