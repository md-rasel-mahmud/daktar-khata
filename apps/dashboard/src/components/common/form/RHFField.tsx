import { type Control, type FieldValues, type Path } from "react-hook-form"
import { FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FieldType = "text" | "select" | "textarea"

interface FieldOption {
  label: string
  value: string
}

interface RHFFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  type: FieldType
  placeholder?: string
  options?: FieldOption[]
  disabled?: boolean
}

const RHFField = <T extends FieldValues>({
  control,
  name,
  label,
  type,
  placeholder,
  options,
  disabled,
}: RHFFieldProps<T>) => {
  const inputId = String(name)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="w-full">
          <label htmlFor={inputId} className="text-sm font-medium">
            {label}
          </label>
          {type === "select" ? (
            <Select
              value={(field.value as string) || ""}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger id={inputId} className="w-full">
                <SelectValue placeholder={placeholder || "Select an option"}>
                  {
                    options?.find((option) => option.value === field.value)
                      ?.label
                  }
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {(options || []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {type === "text" ? (
            <Input
              id={inputId}
              value={(field.value as string) || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              disabled={disabled}
            />
          ) : null}

          {type === "textarea" ? (
            <Textarea
              id={inputId}
              value={(field.value as string) || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              disabled={disabled}
            />
          ) : null}

          {fieldState.error?.message ? (
            <p className="text-sm font-medium text-destructive">
              {String(fieldState.error.message)}
            </p>
          ) : null}
        </div>
      )}
    />
  )
}

export default RHFField
