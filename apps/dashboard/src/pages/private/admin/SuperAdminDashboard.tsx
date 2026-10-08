import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import StatsCard from "@/components/dashboard/StatsCard"
import {
  Users,
  Banknote,
  ShieldCheck,
  Building2,
  Stethoscope,
  UserCheck,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Ban,
  Shield,
  Loader2,
  Search,
} from "lucide-react"
import { useGetSuperAdminDashboardQuery } from "@/lib/store/api/services/dashboard.service"
import {
  useGetAggregatedMerchantsQuery,
  useUpdateMerchantStatusMutation,
} from "@/lib/store/api/services/merchant.service"
import {
  useGetAllSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} from "@/lib/store/api/services/subscription.service"
import {
  useGetPlatformAdminsQuery,
  useCreatePlatformAdminMutation,
  useUpdateAdminStatusMutation,
  useGetCurrentUserQuery,
} from "@/lib/store/api/services/user.service"
import { Skeleton } from "@repo/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import { RolesEnum } from "@/enums/role.enum"
import { toast } from "sonner"
import { format } from "date-fns"

export const SuperAdminDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { data: stats, isLoading: isLoadingStats } = useGetSuperAdminDashboardQuery()
  const { data: profileData } = useGetCurrentUserQuery(undefined)
  const currentRole = profileData?.data?.user?.role || RolesEnum.ADMIN

  const isSuperAdmin = currentRole === RolesEnum.SUPER_ADMIN

  // Merchant state
  const { data: merchants = [], isLoading: isLoadingMerchants } =
    useGetAggregatedMerchantsQuery()
  const [updateMerchantStatus] = useUpdateMerchantStatusMutation()
  const [merchantSearch, setMerchantSearch] = useState("")

  // Subscription state
  const { data: plans = [], isLoading: isLoadingPlans } =
    useGetAllSubscriptionPlansQuery()
  const [createPlan, { isLoading: isCreatingPlan }] =
    useCreateSubscriptionPlanMutation()
  const [updatePlan, { isLoading: isUpdatingPlan }] =
    useUpdateSubscriptionPlanMutation()
  const [deletePlan, { isLoading: isDeletingPlan }] =
    useDeleteSubscriptionPlanMutation()

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [planForm, setPlanForm] = useState({
    planName: "",
    description: "",
    monthlyPrice: 1500,
    halfYearlyPrice: 8000,
    yearlyPrice: 15000,
    doctorLimit: 5,
    patientLimit: 1000,
    staffLimit: 10,
    status: "ACTIVE",
  })

  // Platform Admins state (Super Admin only)
  const { data: platformAdmins = [], isLoading: isLoadingAdmins } =
    useGetPlatformAdminsQuery(undefined, { skip: !isSuperAdmin })
  const [createAdmin, { isLoading: isCreatingAdmin }] =
    useCreatePlatformAdminMutation()
  const [updateAdminStatus] = useUpdateAdminStatusMutation()

  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
  const [adminForm, setAdminForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  })

  // Handlers for Merchant Status
  const handleMerchantStatusChange = async (merchantId: string, newStatus: string) => {
    try {
      await updateMerchantStatus({ id: merchantId, status: newStatus }).unwrap()
      toast.success(t("Merchant status updated to {{status}}", { status: newStatus }))
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to update merchant status"))
    }
  }

  // Handlers for Plan CRUD
  const handleOpenCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm({
      planName: "",
      description: "",
      monthlyPrice: 1500,
      halfYearlyPrice: 8000,
      yearlyPrice: 15000,
      doctorLimit: 5,
      patientLimit: 1000,
      staffLimit: 10,
      status: "ACTIVE",
    })
    setIsPlanDialogOpen(true)
  }

  const handleOpenEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setPlanForm({
      planName: plan.planName || "",
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice || plan.amount || 0,
      halfYearlyPrice: plan.halfYearlyPrice || 0,
      yearlyPrice: plan.yearlyPrice || 0,
      doctorLimit: plan.doctorLimit || 5,
      patientLimit: plan.patientLimit || 1000,
      staffLimit: plan.staffLimit || 10,
      status: plan.status || "ACTIVE",
    })
    setIsPlanDialogOpen(true)
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan._id, data: planForm }).unwrap()
        toast.success(t("Subscription plan updated successfully"))
      } else {
        await createPlan(planForm).unwrap()
        toast.success(t("Subscription plan created successfully"))
      }
      setIsPlanDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to save subscription plan"))
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm(t("Are you sure you want to delete or archive this plan?"))) return
    try {
      const res = await deletePlan(planId).unwrap()
      toast.success(res?.message || t("Subscription plan deleted/archived successfully"))
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to delete plan"))
    }
  }

  // Handlers for Platform Admin CRUD
  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAdmin(adminForm).unwrap()
      toast.success(t("Platform admin created successfully"))
      setIsAdminDialogOpen(false)
      setAdminForm({ name: "", phone: "", email: "", password: "" })
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to create admin"))
    }
  }

  const handleToggleAdminStatus = async (adminId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await updateAdminStatus({ id: adminId, status: newStatus }).unwrap()
      toast.success(t("Admin status updated to {{status}}", { status: newStatus }))
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to update admin status"))
    }
  }

  const filteredMerchants = merchants.filter((m: any) => {
    if (!merchantSearch) return true
    const q = merchantSearch.toLowerCase()
    return (
      m.clinicName?.toLowerCase().includes(q) ||
      m.name?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.subdomain?.toLowerCase().includes(q) ||
      m.domain?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="fadeIn space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isSuperAdmin
              ? t("Super Admin Platform Control", "Super Admin Platform Control")
              : t("Admin Management Dashboard", "Admin Management Dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "Centralized SaaS platform monitoring, tenant isolation management, and subscription controls.",
              "Centralized SaaS platform monitoring, tenant isolation management, and subscription controls."
            )}
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t("Total Merchants", "Total Merchants")}
            value={stats?.totalMerchants ?? 0}
            icon={Building2}
            description={t("Registered clinic owners")}
          />
          <StatsCard
            title={t("Total Doctors", "Total Doctors")}
            value={stats?.totalDoctors ?? 0}
            icon={Stethoscope}
            description={t("Active & pending doctors")}
          />
          <StatsCard
            title={t("Total Patients", "Total Patients")}
            value={stats?.totalPatients ?? 0}
            icon={Users}
            description={t("Registered patient profiles")}
          />
          <StatsCard
            title={t("Total Staff Members", "Total Staff Members")}
            value={stats?.totalStaff ?? 0}
            icon={UserCheck}
            description={t("Active clinic personnel")}
          />
        </div>
      )}

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard
          title={t("Active Subscriptions", "Active Subscriptions")}
          value={stats?.activeSubscriptions ?? 0}
          icon={ShieldCheck}
          description={t("Currently active merchant plans")}
        />
        <StatsCard
          title={t("Total Platform Revenue", "Total Platform Revenue")}
          value={`৳${(stats?.revenue ?? 0).toLocaleString()}`}
          icon={Banknote}
          description={t("All-time verified subscription revenue")}
        />
      </div>

      {/* Tabbed Management Sections */}
      <Tabs defaultValue="merchants" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="merchants" className="font-semibold">
            <Building2 className="mr-2 h-4 w-4" />
            {t("Merchant Management")}
          </TabsTrigger>
          <TabsTrigger value="plans" className="font-semibold">
            <ShieldCheck className="mr-2 h-4 w-4" />
            {t("Subscription Plans")}
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="admins" className="font-semibold">
              <Shield className="mr-2 h-4 w-4" />
              {t("Platform Admins")}
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB 1: MERCHANTS MANAGEMENT */}
        <TabsContent value="merchants" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("Registered Clinic Merchants")}</CardTitle>
                <CardDescription>
                  {t(
                    "Overview of all multi-tenant merchants with aggregated resource counts and account status controls."
                  )}
                </CardDescription>
              </div>

              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Filter by name, clinic, domain...")}
                  value={merchantSearch}
                  onChange={(e) => setMerchantSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingMerchants ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredMerchants.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {t("No merchants found.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">{t("Clinic & Owner")}</th>
                        <th className="px-4 py-3">{t("Tenant Domain")}</th>
                        <th className="px-4 py-3">{t("Subscription")}</th>
                        <th className="px-4 py-3">{t("Account Status")}</th>
                        <th className="px-4 py-3 text-center">{t("Clinics")}</th>
                        <th className="px-4 py-3 text-center">{t("Doctors")}</th>
                        <th className="px-4 py-3 text-center">{t("Patients")}</th>
                        <th className="px-4 py-3 text-center">{t("Staff")}</th>
                        <th className="px-4 py-3 text-right">{t("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredMerchants.map((m: any) => {
                        const statusColor =
                          m.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : m.status === "BANNED"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"

                        const subStatusColor =
                          m.subscriptionStatus === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : m.subscriptionStatus === "DEMO"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"

                        return (
                          <tr key={m._id} className="hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-foreground">
                                {m.clinicName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {m.name} • {m.phone}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium text-primary">
                                {m.subdomain ? `${m.subdomain}.localhost` : m.domain || "-"}
                              </code>
                            </td>

                            <td className="px-4 py-3.5">
                              <Badge variant="outline" className={`capitalize font-semibold ${subStatusColor}`}>
                                {m.subscriptionStatus || "PENDING"}
                              </Badge>
                              {m.subscriptionEndDate && (
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  Exp: {format(new Date(m.subscriptionEndDate), "MMM dd, yyyy")}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3.5">
                              <Badge variant="outline" className={`capitalize font-semibold ${statusColor}`}>
                                {m.status || "ACTIVE"}
                              </Badge>
                            </td>

                            <td className="px-4 py-3.5 text-center font-medium">
                              {m.totalClinics ?? 1}
                            </td>

                            <td className="px-4 py-3.5 text-center font-medium">
                              {m.totalDoctors ?? 0}
                            </td>

                            <td className="px-4 py-3.5 text-center font-medium">
                              {m.totalPatients ?? 0}
                            </td>

                            <td className="px-4 py-3.5 text-center font-medium">
                              {m.totalStaff ?? 0}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>{t("Change Account Status")}</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleMerchantStatusChange(m._id, "ACTIVE")}
                                    disabled={m.status === "ACTIVE"}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                    {t("Set Active")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleMerchantStatusChange(m._id, "INACTIVE")}
                                    disabled={m.status === "INACTIVE"}
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-amber-600" />
                                    {t("Set Inactive")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleMerchantStatusChange(m._id, "BANNED")}
                                    disabled={m.status === "BANNED"}
                                  >
                                    <Ban className="mr-2 h-4 w-4 text-destructive" />
                                    {t("Ban Merchant")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: SUBSCRIPTION PLANS MANAGEMENT */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("SaaS Subscription Plans")}</CardTitle>
                <CardDescription>
                  {t(
                    "Manage subscription tiers, pricing intervals, quotas, and limits for clinic owners."
                  )}
                </CardDescription>
              </div>
              <Button onClick={handleOpenCreatePlan} className="font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                {t("Create New Plan")}
              </Button>
            </CardHeader>

            <CardContent>
              {isLoadingPlans ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : plans.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {t("No subscription plans created yet.")}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">{t("Plan Name")}</th>
                        <th className="px-4 py-3">{t("Monthly Price")}</th>
                        <th className="px-4 py-3">{t("6-Month Price")}</th>
                        <th className="px-4 py-3">{t("Yearly Price")}</th>
                        <th className="px-4 py-3 text-center">{t("Doctor Limit")}</th>
                        <th className="px-4 py-3 text-center">{t("Patient Limit")}</th>
                        <th className="px-4 py-3 text-center">{t("Staff Limit")}</th>
                        <th className="px-4 py-3">{t("Status")}</th>
                        <th className="px-4 py-3 text-right">{t("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {plans.map((p: any) => (
                        <tr key={p._id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-foreground">{p.planName}</div>
                            {p.description && (
                              <div className="text-xs text-muted-foreground max-w-xs truncate">
                                {p.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-medium">
                            ৳{(p.monthlyPrice || p.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 font-medium">
                            ৳{(p.halfYearlyPrice || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 font-medium">
                            ৳{(p.yearlyPrice || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-center font-medium">
                            {p.doctorLimit === -1 ? "∞" : p.doctorLimit}
                          </td>
                          <td className="px-4 py-3.5 text-center font-medium">
                            {p.patientLimit === -1 ? "∞" : p.patientLimit?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-center font-medium">
                            {p.staffLimit === -1 ? "∞" : p.staffLimit}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              variant={p.status === "ACTIVE" ? "default" : "secondary"}
                              className="capitalize font-semibold"
                            >
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenEditPlan(p)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeletePlan(p._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PLATFORM ADMINS (SUPER ADMIN ONLY) */}
        {isSuperAdmin && (
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{t("Platform Admins Administration")}</CardTitle>
                  <CardDescription>
                    {t(
                      "Super Admin exclusive privilege to manage platform administrators."
                    )}
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAdminDialogOpen(true)} className="font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Add Platform Admin")}
                </Button>
              </CardHeader>

              <CardContent>
                {isLoadingAdmins ? (
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : platformAdmins.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {t("No platform admins found.")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">{t("Name & Contact")}</th>
                          <th className="px-4 py-3">{t("Role")}</th>
                          <th className="px-4 py-3">{t("Status")}</th>
                          <th className="px-4 py-3 text-right">{t("Actions")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {platformAdmins.map((adm: any) => {
                          const isSuper = adm.role === RolesEnum.SUPER_ADMIN
                          return (
                            <tr key={adm._id} className="hover:bg-muted/40 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="font-semibold text-foreground">
                                  {adm.name || t("Admin")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {adm.phone} • {adm.email || t("No email")}
                                </div>
                              </td>

                              <td className="px-4 py-3.5">
                                <Badge
                                  variant={isSuper ? "default" : "outline"}
                                  className="font-semibold"
                                >
                                  {adm.role}
                                </Badge>
                              </td>

                              <td className="px-4 py-3.5">
                                <Badge
                                  variant={
                                    adm.isActive || adm.status === "ACTIVE"
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="capitalize font-semibold"
                                >
                                  {adm.status || (adm.isActive ? "ACTIVE" : "INACTIVE")}
                                </Badge>
                              </td>

                              <td className="px-4 py-3.5 text-right">
                                {!isSuper && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleAdminStatus(
                                        adm._id,
                                        adm.status || (adm.isActive ? "ACTIVE" : "INACTIVE")
                                      )
                                    }
                                  >
                                    {adm.isActive || adm.status === "ACTIVE"
                                      ? t("Deactivate")
                                      : t("Activate")}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* CREATE / EDIT SUBSCRIPTION PLAN MODAL */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? t("Edit Subscription Plan") : t("Create Subscription Plan")}
            </DialogTitle>
            <DialogDescription>
              {t("Set pricing, cycle duration, and quota constraints for this plan.")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePlan} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="planName">{t("Plan Name")} *</Label>
              <Input
                id="planName"
                value={planForm.planName}
                onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                placeholder="e.g. Starter Clinic Plan"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">{t("Description")}</Label>
              <Input
                id="description"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                placeholder="Features overview"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="monthlyPrice">{t("Monthly Price")} *</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  min="0"
                  value={planForm.monthlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, monthlyPrice: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="halfYearlyPrice">{t("6-Month Price")} *</Label>
                <Input
                  id="halfYearlyPrice"
                  type="number"
                  min="0"
                  value={planForm.halfYearlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, halfYearlyPrice: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="yearlyPrice">{t("Yearly Price")} *</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  min="0"
                  value={planForm.yearlyPrice}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, yearlyPrice: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="doctorLimit">{t("Doctor Limit")} (-1: ∞)</Label>
                <Input
                  id="doctorLimit"
                  type="number"
                  value={planForm.doctorLimit}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, doctorLimit: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="patientLimit">{t("Patient Limit")} (-1: ∞)</Label>
                <Input
                  id="patientLimit"
                  type="number"
                  value={planForm.patientLimit}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, patientLimit: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="staffLimit">{t("Staff Limit")} (-1: ∞)</Label>
                <Input
                  id="staffLimit"
                  type="number"
                  value={planForm.staffLimit}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, staffLimit: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPlanDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={isCreatingPlan || isUpdatingPlan}>
                {(isCreatingPlan || isUpdatingPlan) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingPlan ? t("Update Plan") : t("Create Plan")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE PLATFORM ADMIN MODAL (SUPER ADMIN ONLY) */}
      {isSuperAdmin && (
        <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Create Platform Admin")}</DialogTitle>
              <DialogDescription>
                {t("Assign platform administration credentials with trusted access.")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveAdmin} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="adminName">{t("Admin Name")} *</Label>
                <Input
                  id="adminName"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="e.g. Platform Manager"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminPhone">{t("Phone Number")} *</Label>
                <Input
                  id="adminPhone"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  placeholder="018xxxxxxxx"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminEmail">{t("Email Address")}</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminPassword">{t("Password")} *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdminDialogOpen(false)}
                >
                  {t("Cancel")}
                </Button>
                <Button type="submit" disabled={isCreatingAdmin}>
                  {isCreatingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("Create Admin")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SuperAdminDashboard
