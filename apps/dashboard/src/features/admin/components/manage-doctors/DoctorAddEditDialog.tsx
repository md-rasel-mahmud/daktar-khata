import React from "react"
import { Controller, type Control, type FieldValues } from "react-hook-form"
import type { TFunction } from "i18next"
import { Button } from "@repo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import {
  FormInput,
  type FormInputConfig,
} from "@/components/common/form/FormInput"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/popover"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@repo/ui/command"
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react"
import type {
  FieldArrayWithId,
  SubmitHandler,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form"
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

type ScheduleInput = {
  days: string[]
  startTime: string
  endTime: string
}

type SpecializationInput = {
  value: string
}

type DoctorAddEditDialogProps = {
  open: boolean
  isEditForm: boolean
  onOpenChange: (open: boolean) => void
  handleSubmit: UseFormHandleSubmit<FieldValues>
  onSubmit: SubmitHandler<FieldValues>
  control: Control<FieldValues>
  register: UseFormRegister<FieldValues>
  formData: FormInputConfig[]
  scheduleFields: FieldArrayWithId<FieldValues, "schedules", "id">[]
  scheduleAppend: UseFieldArrayAppend<FieldValues, "schedules">
  scheduleRemove: UseFieldArrayRemove
  specializationFields: FieldArrayWithId<FieldValues, "specialization", "id">[]
  specializationAppend: UseFieldArrayAppend<FieldValues, "specialization">
  specializationRemove: UseFieldArrayRemove
  t: TFunction
}

const DoctorAddEditDialog: React.FC<DoctorAddEditDialogProps> = ({
  open,
  isEditForm,
  onOpenChange,
  handleSubmit,
  onSubmit,
  control,
  register,
  formData,
  scheduleFields,
  scheduleAppend,
  scheduleRemove,
  specializationFields,
  specializationAppend,
  specializationRemove,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditForm ? "Edit Doctor Profile" : "Add New Doctor"}
          </DialogTitle>
          <DialogDescription>
            {isEditForm
              ? "Update the doctor's information below."
              : "Enter the doctor's information below."}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormInput
              {...{
                control: control as unknown as Control<FieldValues>,
                formData,
              }}
            />

            <h6 className="font-bold md:col-span-2 lg:col-span-3">
              {t("weekly schedule")}
            </h6>
            <div className="space-y-4 md:col-span-2 lg:col-span-3">
              {scheduleFields.map((scheduleField, index) => (
                <div
                  key={scheduleField.id}
                  className="flex items-end justify-between space-x-2"
                >
                  <div className="flex-1 space-y-2">
                    <Label>Day</Label>

                    <Controller
                      control={control}
                      name={`schedules.${index}.days`}
                      render={({ field }) => {
                        const value: string[] = field.value || []

                        const toggleDay = (day: string) => {
                          if (value.includes(day)) {
                            field.onChange(value.filter((d) => d !== day))
                          } else {
                            field.onChange([...value, day])
                          }
                        }

                        return (
                          <Popover>
                            <PopoverTrigger
                              className="inline-flex h-8 w-full items-center justify-between rounded-lg border border-input bg-background px-2.5 text-sm"
                              aria-label="Select days"
                            >
                              {value.length ? value.join(", ") : "Select days"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </PopoverTrigger>

                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search day..." />

                                <CommandGroup>
                                  {DAYS.map((day) => (
                                    <CommandItem
                                      key={day}
                                      onSelect={() => toggleDay(day)}
                                    >
                                      {day}

                                      <Check
                                        className={`ml-auto h-4 w-4 ${
                                          value.includes(day)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`schedules.${index}.startTime`}>
                      Start Time
                    </Label>
                    <Input
                      id={`schedules.${index}.startTime`}
                      type="time"
                      {...register(`schedules.${index}.startTime`)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`schedules.${index}.endTime`}>
                      End Time
                    </Label>
                    <Input
                      id={`schedules.${index}.endTime`}
                      type="time"
                      {...register(`schedules.${index}.endTime`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => scheduleRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/20 hover:text-primary"
                onClick={() =>
                  scheduleAppend({
                    days: [],
                    startTime: "",
                    endTime: "",
                  } as ScheduleInput)
                }
              >
                <PlusCircle /> Add Schedule
              </Button>
            </div>

            <h6 className="font-bold md:col-span-2 lg:col-span-3">
              {t("specialization")}
            </h6>

            <div className="md:col-span-2 lg:col-span-3">
              {specializationFields.map((specializationField, index) => (
                <div
                  key={specializationField.id}
                  className="mb-2 flex items-center space-x-2"
                >
                  <Input
                    id={`specialization.${index}`}
                    placeholder="Enter specialization"
                    {...register(`specialization.${index}.value`)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => specializationRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/20 hover:text-primary"
                onClick={() =>
                  specializationAppend({
                    value: "",
                  } as SpecializationInput)
                }
              >
                <PlusCircle /> Add Specialization
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">
              {isEditForm ? "Update Doctor" : "Add Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DoctorAddEditDialog
