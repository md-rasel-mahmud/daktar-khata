import React, { useState } from "react"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"
import { Label } from "@repo/ui/label"
import { Printer } from "lucide-react"
import AppointmentStatusBadge from "@/components/common/AppointmentStatusBadge"
import { AppointmentPrintModal } from "@/components/common/print"
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
  const [isPrintOpen, setIsPrintOpen] = useState(false)

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

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPrintOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 transition"
              >
                <Printer className="h-4 w-4" />
                {t("print_slip")}
              </button>
            </div>
          </div>
        )}
      </DialogContent>

      <AppointmentPrintModal
        open={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        data={
          appointment
            ? {
                appointmentDate: appointment.appointmentDate,
                appointmentSlot: appointment.appointmentSlot,
                status: appointment.status,
                reasonFor: appointment.reasonFor,
                problemDescription: appointment.problemDescription,
                paymentStatus: appointment.paymentStatus,
                paymentMethod: appointment.paymentMethod,
                doctor: appointment.doctor,
                patient: appointment.patient,
              }
            : null
        }
      />
    </Dialog>
  )
}

export default AppointmentDetailsDialog
