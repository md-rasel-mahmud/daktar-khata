import React from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react"
import { Button } from "@repo/ui/button"
import { RolesEnum } from "@/enums/role.enum"
import { useGetCurrentUserQuery } from "@/lib/store/api/services/user.service"

export const SubscriptionWarningBanner: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profileData } = useGetCurrentUserQuery(undefined)

  const user = profileData?.data?.user
  const role = user?.role

  // Do not show banner for platform super admins and admins
  if (!role || role === RolesEnum.SUPER_ADMIN || role === RolesEnum.ADMIN) {
    return null
  }

  // Find merchant profile
  const merchant =
    profileData?.data?.user?.merchant ||
    profileData?.data?.merchant ||
    profileData?.data

  const subscriptionStatus =
    merchant?.subscriptionStatus || user?.subscriptionStatus || "DEMO"
  const subscriptionEndDate =
    merchant?.subscriptionEndDate || user?.subscriptionEndDate

  if (!subscriptionEndDate) {
    return null
  }

  const now = new Date().getTime()
  const expiryTime = new Date(subscriptionEndDate).getTime()
  const diffMs = expiryTime - now
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const isExpired = diffMs <= 0 || subscriptionStatus === "EXPIRED"

  // If subscription is paid and has more than 3 days remaining, hide banner
  if (!isExpired && daysLeft > 3 && subscriptionStatus === "ACTIVE") {
    return null
  }

  const handleRenewClick = () => {
    navigate("/merchant/subscription")
  }

  if (isExpired) {
    return (
      <div className="sticky top-14 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-destructive/20 bg-destructive/15 px-4 py-2.5 text-destructive backdrop-blur-md transition-all sm:px-6">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0 animate-pulse text-destructive" />
          <div className="text-sm font-medium">
            <span className="font-semibold">{t("Subscription Expired", "Subscription Expired")}: </span>
            {t(
              "Your clinic subscription has ended. Renew now to restore full operations and access.",
              "Your clinic subscription has ended. Renew now to restore full operations and access."
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRenewClick}
          className="h-8 gap-1.5 font-semibold shadow-sm"
        >
          {t("Renew Now", "Renew Now")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="sticky top-14 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-amber-900 dark:text-amber-200 backdrop-blur-md transition-all sm:px-6">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="text-sm font-medium">
          <span className="font-semibold">
            {subscriptionStatus === "DEMO"
              ? t("Demo Expiring Soon", "Demo Expiring Soon")
              : t("Subscription Warning", "Subscription Warning")}
            :{" "}
          </span>
          {daysLeft <= 0
            ? t("Your subscription expires today. Renew now to continue using the service without disruption.", "Your subscription expires today. Renew now to continue using the service without disruption.")
            : t(
                "Your subscription will expire in {{days}} day(s). Renew now to continue using the service.",
                {
                  days: daysLeft,
                  defaultValue: `Your subscription will expire in ${daysLeft} day${daysLeft > 1 ? "s" : ""}. Renew now to continue using the service.`,
                }
              )}
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleRenewClick}
        className="h-8 gap-1.5 bg-amber-600 text-white hover:bg-amber-700 shadow-sm font-semibold"
      >
        {t("Pay Now", "Pay Now")}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
