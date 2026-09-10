import React from "react"
import { Badge } from "@repo/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface AppointmentStatusBadgeProps {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW"
    | "RESCHEDULED"
  className?: string
}

/**
 * Appointment Status Badge Component
 * Displays appointment status with appropriate styling
 */
const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const { t } = useTranslation()
  const statusConfig: Record<
    string,
    {
      variant: "default" | "secondary" | "outline" | "destructive"
      label: string
      className?: string
    }
  > = {
    PENDING: {
      variant: "outline",
      label: t("pending"),
    },
    CONFIRMED: {
      variant: "secondary",
      label: t("confirmed"),
    },
    COMPLETED: {
      variant: "secondary",
      label: t("completed"),
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    CANCELLED: {
      variant: "destructive",
      label: t("cancelled"),
    },
    NO_SHOW: {
      variant: "destructive",
      label: t("no_show"),
    },
    RESCHEDULED: {
      variant: "secondary",
      label: t("rescheduled"),
    },
  }

  const config = statusConfig[status] || statusConfig.PENDING

  return (
    <Badge
      variant={config.variant}
      className={cn("capitalize", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

export default AppointmentStatusBadge
