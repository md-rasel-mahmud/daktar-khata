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

type AddStaffDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  resetForm: () => void
  onSubmit: () => void
  control: any
  formData: FormInputConfig[]
  isSubmitting: boolean
}

const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  resetForm,
  onSubmit,
  control,
  formData,
  isSubmitting,
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Staff</DialogTitle>
          <DialogDescription>Create a new staff profile.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormInput control={control} formData={formData} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddStaffDialog
