import React, { useEffect, useMemo, useState } from "react"
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

const SELECTED_CLINIC_KEY = "daktar_khata_selected_clinic_id"

interface Clinic {
  _id: string
  name: string
  isMainBranch?: boolean
}

export const ClinicSwitcher: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const authUser = useSelector((state: RootState) => state.auth.user)
  const role = authUser?.user?.role

  const isMerchantOrStaff =
    role === RolesEnum.MERCHANT || role === RolesEnum.STAFF

  const { data: clinics = [], isLoading } = useGetMyClinicsQuery(undefined, {
    skip: !isMerchantOrStaff,
  })

  const [selectedClinicId, setSelectedClinicId] = useState<string>(() => {
    if (typeof window === "undefined") return ""

    return localStorage.getItem(SELECTED_CLINIC_KEY) || ""
  })

  const normalizedClinics = clinics as Clinic[]

  // Resolve the selected clinic using its ID.
  const selectedClinic = useMemo(
    () =>
      normalizedClinics.find(
        (clinic) => String(clinic._id) === selectedClinicId
      ),
    [normalizedClinics, selectedClinicId]
  )

  // Restore the saved clinic or select the main branch by default.
  useEffect(() => {
    if (!normalizedClinics.length) return

    const storedClinicId =
      typeof window !== "undefined"
        ? localStorage.getItem(SELECTED_CLINIC_KEY)
        : null

    const storedClinic = normalizedClinics.find(
      (clinic) => String(clinic._id) === storedClinicId
    )

    const defaultClinic =
      storedClinic ||
      normalizedClinics.find((clinic) => clinic.isMainBranch) ||
      normalizedClinics[0]

    const defaultClinicId = String(defaultClinic._id)

    if (selectedClinicId !== defaultClinicId) {
      setSelectedClinicId(defaultClinicId)
    }

    if (
      typeof window !== "undefined" &&
      storedClinicId !== defaultClinicId
    ) {
      localStorage.setItem(SELECTED_CLINIC_KEY, defaultClinicId)
    }
  }, [normalizedClinics, selectedClinicId])

  const handleClinicChange = (clinicId: string) => {
    if (!clinicId || clinicId === selectedClinicId) return

    setSelectedClinicId(clinicId)

    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_CLINIC_KEY, clinicId)
    }

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

  if (!isMerchantOrStaff || isLoading || !normalizedClinics.length) {
    return null
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Building2 className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:inline-block" />

      <Select
        value={selectedClinicId}
        onValueChange={handleClinicChange}
      >
        <SelectTrigger className="h-8 min-w-[140px] max-w-[220px] bg-muted/40 text-xs font-medium hover:bg-muted/70">
          <SelectValue placeholder={t("Select Clinic")}>
            {selectedClinic ? (
              <span className="block truncate">
                {selectedClinic.name}
                {selectedClinic.isMainBranch ? ` (${t("Main")})` : ""}
              </span>
            ) : (
              t("Select Clinic")
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent align="start">
          {normalizedClinics.map((clinic) => (
            <SelectItem
              key={clinic._id}
              value={String(clinic._id)}
              className="text-xs"
            >
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