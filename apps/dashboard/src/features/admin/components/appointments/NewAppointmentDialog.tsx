import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FormInput,
  type FormInputConfig,
} from "@/components/common/form/FormInput"

type NewAppointmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  resetForm: () => void
  control: any
  formData: FormInputConfig[]
}

const NewAppointmentDialog: React.FC<NewAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  resetForm,
  control,
  formData,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(dialogOpen) => {
        onOpenChange(dialogOpen)
        if (!dialogOpen) {
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details for the new appointment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput control={control} formData={formData} />
          </div>
          <DialogFooter>
            <Button type="submit">Schedule Appointment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewAppointmentDialog
