"use client"
import { Label } from "@repo/ui/label"
import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

const colSpansObj: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
}

type ColSpanKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

const colSpansSM_Obj: Record<ColSpanKey, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
}

const colSpansMD_Obj: Record<ColSpanKey, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
}

const colSpansLG_Obj: Record<ColSpanKey, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
}

const colSpansXL_Obj: Record<ColSpanKey, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
}

//  Props Interface
interface FormInputWrapperProps {
  label?: string
  errorMessage?: string
  className?: string
  children: ReactNode
  id?: string
  required?: boolean
  colSpans?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const FormInputWrapper: React.FC<FormInputWrapperProps> = ({
  label,
  errorMessage,
  className,
  colSpans,
  required,
  children,
  id,
}) => {
  return (
    <div
      className={cn(
        "w-full",
        {
          [colSpansObj[(colSpans?.xs ?? 0) as ColSpanKey]]: !!colSpans?.xs,
          [colSpansSM_Obj[(colSpans?.sm ?? 0) as ColSpanKey]]: !!colSpans?.sm,
          [colSpansMD_Obj[(colSpans?.md ?? 0) as ColSpanKey]]: !!colSpans?.md,
          [colSpansLG_Obj[(colSpans?.lg ?? 0) as ColSpanKey]]: !!colSpans?.lg,
          [colSpansXL_Obj[(colSpans?.xl ?? 0) as ColSpanKey]]: !!colSpans?.xl,
        },
        className
      )}
    >
      {label ? (
        <Label htmlFor={id} className="mb-2 inline-flex">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      ) : null}
      <div className="my-2">{children}</div>
      {errorMessage && (
        <div className="text-xs text-destructive italic">
          {errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)}
        </div>
      )}
    </div>
  )
}

export default FormInputWrapper
