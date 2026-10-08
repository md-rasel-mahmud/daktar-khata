"use client"
import {
  FormInput,
  type FormInputConfig,
} from "@/components/common/form/FormInput"
import { Button } from "@repo/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import { Skeleton } from "@repo/ui/skeleton"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type FC } from "react"
import {
  type Control,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form"

type FormModalProps = {
  control: Control<FieldValues>
  formData: FormInputConfig[]
  inputSize?: "sm" | "md" | "lg"
  isAddDialogOpen: boolean
  setIsAddDialogOpen: (open: boolean) => void
  formSubmitHandler: SubmitHandler<FieldValues>
  handleSubmit: (
    onValid: SubmitHandler<FieldValues>
  ) => (e?: React.BaseSyntheticEvent) => void
  submitText?: string
  title: string
  isLoading?: boolean
  dialogContentClassName?: string
  inputParentClassName?: string
}

const FormModal: FC<FormModalProps> = ({
  title = "",
  control,
  formData,
  inputSize = "sm",
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleSubmit,
  formSubmitHandler,
  submitText = "Submit",
  isLoading = false,
  dialogContentClassName = "",
  inputParentClassName = "",
}) => {
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-x-hidden sm:max-w-5xl",
          dialogContentClassName
        )}
      >
        <form
          onSubmit={handleSubmit(formSubmitHandler)}
          className="flex max-h-[82vh] flex-col overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>

            <DialogDescription className="text-xs">
              Required fields are marked with an asterisk (
              <span className="text-destructive"> * </span>).
            </DialogDescription>
          </DialogHeader>

          <div
            className={cn(
              "my-6 grid min-h-0 grid-cols-1 gap-4 overflow-x-hidden overflow-y-auto pr-1 lg:grid-cols-2",
              inputParentClassName
            )}
          >
            <FormInput
              {...{
                control,
                formData,
                size: inputSize,
              }}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                submitText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default FormModal
