import React, { useEffect, useState } from "react"
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns"
import { Calendar as CalendarIcon, Check } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { useTranslation } from "react-i18next"
import { Button } from "@repo/ui/button"
import { Calendar } from "@repo/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/popover"
import { cn } from "@/lib/utils"

export interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  align?: "start" | "center" | "end"
}

interface Preset {
  id: string
  label: string
  getRange: () => { from: Date; to: Date }
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder,
  className,
  align = "start",
}) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value)

  // Keep internal range in sync when prop changes
  useEffect(() => {
    setTempRange(value)
  }, [value])

  const presets: Preset[] = [
    {
      id: "today",
      label: t("today", { defaultValue: "Today" }),
      getRange: () => {
        const today = new Date()
        return { from: today, to: today }
      },
    },
    {
      id: "yesterday",
      label: t("yesterday", { defaultValue: "Yesterday" }),
      getRange: () => {
        const yesterday = subDays(new Date(), 1)
        return { from: yesterday, to: yesterday }
      },
    },
    {
      id: "last7",
      label: t("last 7 days", { defaultValue: "Last 7 days" }),
      getRange: () => ({
        from: subDays(new Date(), 6),
        to: new Date(),
      }),
    },
    {
      id: "last14",
      label: t("last 14 days", { defaultValue: "Last 14 days" }),
      getRange: () => ({
        from: subDays(new Date(), 13),
        to: new Date(),
      }),
    },
    {
      id: "last30",
      label: t("last 30 days", { defaultValue: "Last 30 days" }),
      getRange: () => ({
        from: subDays(new Date(), 29),
        to: new Date(),
      }),
    },
    {
      id: "thisWeek",
      label: t("this week", { defaultValue: "This Week" }),
      getRange: () => {
        const now = new Date()
        return { from: startOfWeek(now), to: endOfWeek(now) }
      },
    },
    {
      id: "thisMonth",
      label: t("this month", { defaultValue: "This Month" }),
      getRange: () => {
        const now = new Date()
        return { from: startOfMonth(now), to: endOfMonth(now) }
      },
    },
    {
      id: "lastMonth",
      label: t("last month", { defaultValue: "Last Month" }),
      getRange: () => {
        const prevMonth = subMonths(new Date(), 1)
        return { from: startOfMonth(prevMonth), to: endOfMonth(prevMonth) }
      },
    },
  ]

  const handleApply = () => {
    onChange?.(tempRange)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempRange(value)
    setOpen(false)
  }

  const handlePresetSelect = (preset: Preset) => {
    const next = preset.getRange()
    setTempRange(next)
  }

  const handleReset = () => {
    setTempRange(undefined)
    onChange?.(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start text-left font-normal",
              !value?.from && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        {value?.from ? (
          value.to ? (
            <span className="truncate">
              {format(value.from, "MMM dd, yyyy")} -{" "}
              {format(value.to, "MMM dd, yyyy")}
            </span>
          ) : (
            <span>{format(value.from, "MMM dd, yyyy")}</span>
          )
        ) : (
          <span>{placeholder || t("select date range")}</span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-auto p-0 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Presets Sidebar */}
          <div className="flex flex-col gap-1 border-b p-3 sm:w-44 sm:border-r sm:border-b-0">
            <span className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {t("presets", { defaultValue: "Presets" })}
            </span>
            <div className="flex flex-wrap gap-1 sm:flex-col">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="ghost"
                  size="sm"
                  className="h-8 justify-start text-xs font-normal"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar Picker */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={setTempRange}
              defaultMonth={tempRange?.from || new Date()}
              numberOfMonths={2}
            />

            {/* Bottom Actions */}
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <div className="text-xs text-muted-foreground">
                {tempRange?.from ? (
                  tempRange.to ? (
                    <span>
                      {format(tempRange.from, "MMM dd, yyyy")} -{" "}
                      {format(tempRange.to, "MMM dd, yyyy")}
                    </span>
                  ) : (
                    <span>
                      {format(tempRange.from, "MMM dd, yyyy")} - {t("select end date", { defaultValue: "Select end date" })}
                    </span>
                  )
                ) : (
                  <span>{t("no date selected", { defaultValue: "No date selected" })}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 text-xs"
                >
                  {t("cancel")}
                </Button>
                {value?.from && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 text-xs"
                  >
                    {t("reset", { defaultValue: "Reset" })}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApply}
                  className="h-8 gap-1.5 text-xs font-medium"
                >
                  <Check className="h-3.5 w-3.5" />
                  {t("apply", { defaultValue: "Apply" })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
