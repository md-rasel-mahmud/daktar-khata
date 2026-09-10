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

type FinanceEntryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  loadingLabel: string
  isSubmitting: boolean
  onSubmit: () => void
  onReset: () => void
  control: any
  formData: FormInputConfig[]
}

const FinanceEntryDialog: React.FC<FinanceEntryDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loadingLabel,
  isSubmitting,
  onSubmit,
  onReset,
  control,
  formData,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(dialogOpen) => {
        onOpenChange(dialogOpen)
        if (!dialogOpen) {
          onReset()
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
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
              {isSubmitting ? loadingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FinanceEntryDialog
