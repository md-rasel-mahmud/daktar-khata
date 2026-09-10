import React from "react"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { Label } from "@repo/ui/label"
import AppointmentStatusBadge from "@/components/common/AppointmentStatusBadge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"

export interface AppointmentDialogModel {
  appointmentDate: string
  appointmentSlot: string
  reasonFor: string
  problemDescription?: string
  paymentStatus?: string
  paymentMethod?: string
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW"
    | "RESCHEDULED"
  patient?: {
    name?: string
  } | null
  doctor?: {
    name?: string
  } | null
}

type AppointmentDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentDialogModel | null
}

const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  open,
  onOpenChange,
  appointment,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("appointment_details")}</DialogTitle>
        </DialogHeader>
        {appointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  {t("patient")}
                </Label>
                <p className="font-semibold">
                  {appointment.patient?.name || t("unknown patient")}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {t("status")}
                </Label>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {t("date")}
                </Label>
                <p className="font-semibold">
                  {format(
                    new Date(appointment.appointmentDate),
                    "MMM dd, yyyy"
                  )}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {t("time")}
                </Label>
                <p className="font-semibold">{appointment.appointmentSlot}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {t("doctor")}
                </Label>
                <p className="font-semibold">
                  {appointment.doctor?.name || t("not assigned")}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  {t("payment")}
                </Label>
                <p className="font-semibold">
                  {appointment.paymentMethod || t("not available")} /{" "}
                  {appointment.paymentStatus || t("not available")}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">
                  {t("reason for visit")}
                </Label>
                <p className="font-semibold">{appointment.reasonFor}</p>
              </div>
              {appointment.problemDescription && (
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    {t("problem description")}
                  </Label>
                  <p className="text-sm">{appointment.problemDescription}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentDetailsDialog
