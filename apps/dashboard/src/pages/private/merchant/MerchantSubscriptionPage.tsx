import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Skeleton } from "@repo/ui/skeleton"
import {
  Check,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Loader2,
  Calendar,
  Users,
  UserCheck,
  Stethoscope,
} from "lucide-react"
import {
  useGetPublicSubscriptionPlansQuery,
  useInitiateSubscriptionPaymentMutation,
} from "@/lib/store/api/services/subscription.service"
import { useGetCurrentUserQuery } from "@/lib/store/api/services/user.service"
import { toast } from "sonner"
import { format } from "date-fns"

type BillingCycle = "monthly" | "half_yearly" | "yearly"

export const MerchantSubscriptionPage: React.FC = () => {
  const { t } = useTranslation()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")

  const { data: plans = [], isLoading: isLoadingPlans } =
    useGetPublicSubscriptionPlansQuery()
  const { data: profileData, isLoading: isLoadingProfile } =
    useGetCurrentUserQuery(undefined)

  const [initiatePayment, { isLoading: isInitiatingPayment }] =
    useInitiateSubscriptionPaymentMutation()

  const merchant =
    profileData?.data?.user?.merchant ||
    profileData?.data?.merchant ||
    profileData?.data

  const subscriptionStatus = merchant?.subscriptionStatus || "DEMO"
  const subscriptionEndDate = merchant?.subscriptionEndDate

  const daysLeft = subscriptionEndDate
    ? Math.ceil(
        (new Date(subscriptionEndDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  const handleSubscribe = async (planId: string) => {
    setSelectedPlanId(planId)
    try {
      const res = await initiatePayment({
        subscriptionId: planId,
        billingCycle,
      }).unwrap()

      if (res?.gatewayUrl) {
        toast.success(t("Redirecting to SSLCommerz payment gateway..."))
        window.location.href = res.gatewayUrl
      } else {
        toast.error(t("Failed to obtain payment gateway URL."))
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || t("Payment initiation failed.")
      )
    }
  }

  const getPrice = (plan: any) => {
    if (billingCycle === "half_yearly") {
      return plan.halfYearlyPrice || (plan.monthlyPrice || plan.amount) * 6
    }
    if (billingCycle === "yearly") {
      return plan.yearlyPrice || (plan.monthlyPrice || plan.amount) * 12
    }
    return plan.monthlyPrice || plan.amount || 0
  }

  const getDurationDays = () => {
    if (billingCycle === "half_yearly") return 180
    if (billingCycle === "yearly") return 360
    return 30
  }

  return (
    <div className="fadeIn space-y-8">
      {/* Current Subscription Status Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  {merchant?.clinicName || t("My Clinic")}
                </h2>
                <Badge
                  variant={
                    subscriptionStatus === "ACTIVE"
                      ? "default"
                      : subscriptionStatus === "DEMO"
                      ? "secondary"
                      : "destructive"
                  }
                  className="capitalize font-semibold"
                >
                  {subscriptionStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {subscriptionEndDate ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("Expires on")}:{" "}
                    <strong className="text-foreground">
                      {format(new Date(subscriptionEndDate), "MMMM dd, yyyy")}
                    </strong>{" "}
                    ({daysLeft <= 0 ? t("Expired") : `${daysLeft} days remaining`})
                  </span>
                ) : (
                  t("No active subscription end date assigned")
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {subscriptionStatus === "DEMO" && (
              <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900 py-1 px-3">
                <Clock className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                {t("3-Day Demo Period Active")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Header & Billing Cycle Selector */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {t("Flexible Clinic SaaS Plans")}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("Choose the Right Plan for Your Clinic")}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {t(
            "Upgrade or renew your subscription to access all features, manage unlimited branches, and expand your healthcare service capacity."
          )}
        </p>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex rounded-xl border bg-muted/60 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("Monthly (30 Days)")}
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("half_yearly")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                billingCycle === "half_yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("6 Months (180 Days)")}
              <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
                {t("Popular")}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("Yearly (360 Days)")}
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800">
                {t("Best Value")}
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {isLoadingPlans ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-6" />
              <Skeleton className="h-10 w-24 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {t("No subscription plans are currently available. Please contact administration.")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan: any, index: number) => {
            const price = getPrice(plan)
            const isPopular = index === 1
            const isProcessing =
              isInitiatingPayment && selectedPlanId === plan._id

            return (
              <Card
                key={plan._id}
                className={`relative flex flex-col justify-between transition-all hover:shadow-lg ${
                  isPopular
                    ? "border-primary shadow-md ring-1 ring-primary"
                    : "border-border"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
                      {t("Most Recommended")}
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {plan.planName}
                  </CardTitle>
                  <CardDescription className="min-h-10">
                    {plan.description ||
                      t("Full clinic management package with comprehensive quota support.")}
                  </CardDescription>

                  <div className="pt-4">
                    <span className="text-4xl font-extrabold">
                      ৳{price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1.5 font-medium">
                      / {getDurationDays()} {t("days")}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5 font-medium">
                      <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        {plan.doctorLimit === -1
                          ? t("Unlimited Doctors")
                          : `${plan.doctorLimit} ${t("Doctors Allowed")}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 font-medium">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        {plan.patientLimit === -1
                          ? t("Unlimited Patients")
                          : `${plan.patientLimit.toLocaleString()} ${t("Patients Maximum")}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 font-medium">
                      <UserCheck className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        {plan.staffLimit === -1
                          ? t("Unlimited Staff Members")
                          : `${plan.staffLimit} ${t("Staff Members")}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 font-medium text-muted-foreground">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{t("Multi-Branch Clinic Management")}</span>
                    </div>

                    <div className="flex items-center gap-2.5 font-medium text-muted-foreground">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{t("Appointments & Prescription Management")}</span>
                    </div>

                    <div className="flex items-center gap-2.5 font-medium text-muted-foreground">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{t("Invoicing, Payroll & Finance Modules")}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t">
                  <Button
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={isProcessing}
                    className="w-full font-semibold py-5"
                    variant={isPopular ? "default" : "outline"}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Initiating...")}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4 fill-current" />
                        {t("Pay with SSLCommerz")}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MerchantSubscriptionPage
