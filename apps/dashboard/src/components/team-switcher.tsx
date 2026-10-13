"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSelector, useDispatch } from "react-redux"
import { Building2, Check } from "lucide-react"
import { IconSelector } from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/sidebar"
import { useGetMyClinicsQuery } from "@/lib/store/api/services/clinic.service"
import { api } from "@/lib/store/api"
import { RolesEnum } from "@/enums/role.enum"
import { type RootState } from "@/lib/store/store"
import { cn } from "@/lib/utils"

const SELECTED_CLINIC_KEY = "daktar_khata_selected_clinic_id"

interface ClinicItem {
  _id: string
  name: string
  address?: string
  logo?: string
  contactNumber?: string
  isMainBranch?: boolean
  active?: boolean
}

export interface TeamSwitcherProps {
  teams?: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { isMobile } = useSidebar()

  const authUser = useSelector((state: RootState) => state.auth.user)
  const currentRole = authUser?.user?.role
  const isMerchantOrStaff =
    currentRole === RolesEnum.MERCHANT || currentRole === RolesEnum.STAFF

  const { data: clinics = [] } = useGetMyClinicsQuery(undefined, {
    skip: !isMerchantOrStaff,
  })

  const normalizedClinics = (clinics || []) as ClinicItem[]

  const [selectedClinicId, setSelectedClinicId] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem(SELECTED_CLINIC_KEY) || ""
  })

  // Restore saved clinic or select default main branch / first clinic
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

  const activeClinic = useMemo(() => {
    if (!normalizedClinics.length) return null
    return (
      normalizedClinics.find(
        (clinic) => String(clinic._id) === selectedClinicId
      ) || normalizedClinics[0]
    )
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

  // Non-merchant or users without clinics: fallback to application name and role
  if (!isMerchantOrStaff || !normalizedClinics.length || !activeClinic) {
    const fallbackName = teams?.[0]?.name || "Daktar Khata"
    const fallbackSubtitle = teams?.[0]?.plan || currentRole || "User"
    const fallbackLogo = teams?.[0]?.logo || (
      <img
        src="/favicon.ico"
        alt="Daktar Khata"
        className="size-5 object-contain"
      />
    )

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary-foreground overflow-hidden">
              {fallbackLogo}
            </div>


            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold">{fallbackName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {fallbackSubtitle}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
  const hasMultipleClinics = normalizedClinics.length > 1

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground",
                  !hasMultipleClinics && "cursor-default"
                )}
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
              {activeClinic.logo ? (
                <img
                  src={activeClinic.logo}
                  alt={activeClinic.name}
                  className="size-full object-cover"
                />
              ) : (
                <Building2 className="size-4" />
              )}
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <span className="truncate font-semibold">{activeClinic.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {activeClinic.address ||
                  (activeClinic.isMainBranch
                    ? `${t("Main Branch")}`
                    : `${t("Clinic")}`)}
              </span>
            </div>

            {hasMultipleClinics && <IconSelector className="ml-auto size-4" />}
          </DropdownMenuTrigger>

          {hasMultipleClinics && (
            <DropdownMenuContent
              className="min-w-60 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("Clinics")}
                </DropdownMenuLabel>
                {normalizedClinics.map((clinic, index) => {
                  const isSelected =
                    String(clinic._id) === String(activeClinic._id)

                  return (
                    <DropdownMenuItem
                      key={clinic._id}
                      onClick={() => handleClinicChange(String(clinic._id))}
                      className={cn(
                        "gap-2 p-2 cursor-pointer",
                        isSelected && "bg-sidebar-accent font-medium"
                      )}
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted overflow-hidden">
                        {clinic.logo ? (
                          <img
                            src={clinic.logo}
                            alt={clinic.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Building2 className="size-3.5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                        <span className="truncate font-medium flex items-center gap-1">
                          {clinic.name}
                          {clinic.isMainBranch && (
                            <span className="text-[10px] text-primary font-normal">
                              ({t("Main")})
                            </span>
                          )}
                        </span>
                        <span className="truncate text-[10px] text-muted-foreground">
                          {clinic.address || t("No address")}
                        </span>
                      </div>

                      {isSelected ? (
                        <Check className="ml-auto size-4 text-primary" />
                      ) : (
                        <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
