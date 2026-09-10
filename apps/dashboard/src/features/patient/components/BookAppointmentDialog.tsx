import React from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import RHFField from "@/components/common/form/RHFField"
import SlotPicker from "@/components/common/SlotPicker"

type Option = { label: string; value: string }

type BookAppointmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reset: () => void
  handleBookAppointment: (event?: React.BaseSyntheticEvent) => void
  control: any
  bookingForm: any
  setValue: any
  selectedDate: Date | undefined
  formState: any
  watchedDoctorId: string
  watchedAppointmentDate: string
  availableSlots: string[]
  watchedAppointmentSlot: string
  slotsLoading: boolean
  reasonFieldOptions: Option[]
  paymentFieldOptions: Option[]
  doctorFieldOptions: Option[]
  watchedPaymentMethod: string
  createLoading: boolean
}

const BookAppointmentDialog: React.FC<BookAppointmentDialogProps> = ({
  open,
  onOpenChange,
  reset,
  handleBookAppointment,
  control,
  bookingForm,
  setValue,
  selectedDate,
  formState,
  watchedDoctorId,
  watchedAppointmentDate,
  availableSlots,
  watchedAppointmentSlot,
  slotsLoading,
  reasonFieldOptions,
  paymentFieldOptions,
  doctorFieldOptions,
  watchedPaymentMethod,
  createLoading,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(dialogOpen) => {
        onOpenChange(dialogOpen)
        if (!dialogOpen) {
          reset()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
          <DialogDescription>
            Select doctor, date and slot to confirm appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleBookAppointment} className="space-y-4">
          <RHFField
            control={control}
            name="doctor"
            label="Select Doctor *"
            type="select"
            placeholder="Select doctor"
            options={doctorFieldOptions}
          />

          <div className="space-y-2">
            <Label>Appointment Date *</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (!date) {
                  bookingForm.setValue("appointmentDate", "", {
                    shouldValidate: true,
                  })
                  return
                }

                setValue("appointmentDate", format(date, "yyyy-MM-dd"), {
                  shouldValidate: true,
                })
              }}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              className="w-fit rounded-md border"
            />
            {formState.errors.appointmentDate?.message ? (
              <p className="text-sm font-medium text-destructive">
                {formState.errors.appointmentDate.message}
              </p>
            ) : null}
          </div>

          {watchedDoctorId && watchedAppointmentDate && (
            <div className="space-y-2">
              <Label>Time Slot *</Label>
              <SlotPicker
                slots={availableSlots}
                selectedSlot={watchedAppointmentSlot}
                onSelectSlot={(slot) => {
                  if (!availableSlots.includes(slot)) return
                  setValue("appointmentSlot", slot, {
                    shouldValidate: true,
                  })
                }}
                isLoading={slotsLoading}
              />
              {formState.errors.appointmentSlot?.message ? (
                <p className="text-sm font-medium text-destructive">
                  {formState.errors.appointmentSlot.message}
                </p>
              ) : null}
            </div>
          )}

          <RHFField
            control={control}
            name="reasonFor"
            label="Reason for Visit *"
            type="select"
            placeholder="Select reason"
            options={reasonFieldOptions}
          />

          <RHFField
            control={control}
            name="problemDescription"
            label="Problem Description"
            type="textarea"
            placeholder="Briefly describe your issue"
          />

          <RHFField
            control={control}
            name="paymentMethod"
            label="Payment Method *"
            type="select"
            options={paymentFieldOptions}
          />

          {watchedPaymentMethod === "SSL_COMMERZ" && (
            <Alert>
              <AlertDescription>
                You will be redirected to complete online payment after booking.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLoading}>
              {createLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BookAppointmentDialog
