import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSelector, useDispatch } from "react-redux"
import { Building2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { useGetMyClinicsQuery } from "@/lib/store/api/services/clinic.service"
import { api } from "@/lib/store/api"
import { RolesEnum } from "@/enums/role.enum"
import { type RootState } from "@/lib/store/store"

export const ClinicSwitcher: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const role = authUser?.user?.role

  // Only merchants and staff need to switch clinics in their multi-branch dashboard
  const isMerchantOrStaff =
    role === RolesEnum.MERCHANT || role === RolesEnum.STAFF

  const { data: clinics = [], isLoading } = useGetMyClinicsQuery(undefined, {
    skip: !isMerchantOrStaff,
  })

  const [selectedClinicId, setSelectedClinicId] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("daktar_khata_selected_clinic_id") || ""
    }
    return ""
  })

  // Sync initial clinic selection when clinics load
  useEffect(() => {
    if (!clinics || clinics.length === 0) return

    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("daktar_khata_selected_clinic_id")
        : null

    const clinicExists = stored && clinics.some((c: any) => c._id === stored)

    if (clinicExists) {
      if (selectedClinicId !== stored) {
        setSelectedClinicId(stored)
      }
    } else {
      // Pick main branch or first clinic
      const defaultClinic =
        clinics.find((c: any) => c.isMainBranch) || clinics[0]
      if (defaultClinic?._id) {
        setSelectedClinicId(defaultClinic._id)
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "daktar_khata_selected_clinic_id",
            defaultClinic._id
          )
        }
      }
    }
  }, [clinics])

  const handleClinicChange = (clinicId: string) => {
    if (!clinicId || clinicId === selectedClinicId) return

    setSelectedClinicId(clinicId)
    if (typeof window !== "undefined") {
      localStorage.setItem("daktar_khata_selected_clinic_id", clinicId)
    }

    // Invalidate queries so that all clinic-scoped data refreshes instantly
    dispatch(
      api.util.invalidateTags([
        "Appointments",
        "Profiles",
        "DoctorOptions",
        "PendingDoctors",
        "Patients",
        "Patient",
        "Clinics",
      ])
    )
  }

  if (!isMerchantOrStaff || isLoading || clinics.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:inline-block" />
      <Select value={selectedClinicId} onValueChange={handleClinicChange}>
        <SelectTrigger className="h-8 min-w-[140px] max-w-[220px] text-xs font-medium bg-muted/40 hover:bg-muted/70">
          <SelectValue placeholder={t("Select Clinic")} />
        </SelectTrigger>
        <SelectContent align="start">
          {clinics.map((clinic: any) => (
            <SelectItem key={clinic._id} value={clinic._id} className="text-xs">
              <span className="truncate">
                {clinic.name}
                {clinic.isMainBranch ? ` (${t("Main")})` : ""}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
