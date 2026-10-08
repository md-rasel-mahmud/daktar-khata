import React from "react"
import { useTranslation } from "react-i18next"
import StatsCard from "@/components/dashboard/StatsCard"
import { Users, Banknote, ShieldCheck } from "lucide-react"
import { useGetSuperAdminDashboardQuery } from "@/lib/store/api/services/dashboard.service"
import { Skeleton } from "@repo/ui/skeleton"

const SuperAdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useGetSuperAdminDashboardQuery()

  if (isLoading) {
    return (
      <div className="space-y-6 p-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fadeIn space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("system_admin_dashboard", "System Admin Dashboard")}
        </h1>
        <p className="text-muted-foreground">
          {t("welcome_back_system_overview", "Overview of platforms, merchants, and subscriptions.")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatsCard
          title={t("total_merchants", "Total Merchants")}
          value={data?.totalMerchants ?? 0}
          icon={Users}
          description={t("registered_clinics", "Registered clinics/merchants")}
        />
        <StatsCard
          title={t("active_subscriptions", "Active Subscriptions")}
          value={data?.activeSubscriptions ?? 0}
          icon={ShieldCheck}
          description={t("currently_active", "Currently active subscriptions")}
        />
        <StatsCard
          title={t("total_revenue", "Total Platform Revenue")}
          value={`৳${(data?.revenue ?? 0).toLocaleString()}`}
          icon={Banknote}
          description={t("all_time_revenue", "All time subscription revenue")}
        />
      </div>
    </div>
  )
}

export default SuperAdminDashboard
