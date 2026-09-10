import type { FC } from "react"
import {
  type Control,
  type FieldValues,
  type SubmitHandler,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from "react-hook-form"
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

type StaffRoleAddEditDialogProps = {
  open: boolean
  isEditForm: boolean
  isLoading?: boolean
  onOpenChange: (open: boolean) => void
  handleSubmit: UseFormHandleSubmit<FieldValues>
  onSubmit: SubmitHandler<FieldValues>
  control: Control<FieldValues>
  register: UseFormRegister<FieldValues>
  formData: FormInputConfig[]
}

const StaffRoleAddEditDialog: FC<StaffRoleAddEditDialogProps> = ({
  open,
  isEditForm,
  isLoading = false,
  onOpenChange,
  handleSubmit,
  onSubmit,
  control,
  register,
  formData,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isEditForm
              ? "Edit Staff Role Template"
              : "Add Staff Role Template"}
          </DialogTitle>
          <DialogDescription>
            {isEditForm
              ? "Update the template information, permissions, and status."
              : "Create a reusable staff role template."}
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              {...{
                control: control as unknown as Control<FieldValues>,
                formData,
              }}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isEditForm ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default StaffRoleAddEditDialog
