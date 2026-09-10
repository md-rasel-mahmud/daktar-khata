import React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CompleteAppointmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: string
  onPrescriptionChange: (value: string) => void
  onConfirm: () => void
  isLoading: boolean
}

const CompleteAppointmentDialog: React.FC<CompleteAppointmentDialogProps> = ({
  open,
  onOpenChange,
  prescription,
  onPrescriptionChange,
  onConfirm,
  isLoading,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("complete_appointment")}</DialogTitle>
          <DialogDescription>
            {t("enter diagnosis and prescription notes")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="prescription">{t("prescription notes")}</Label>
            <Textarea
              id="prescription"
              placeholder={t("enter prescription and medical notes")}
              value={prescription}
              onChange={(e) => onPrescriptionChange(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t("saving") : t("complete_appointment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CompleteAppointmentDialog
