import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Badge } from "@repo/ui/badge"
import { MoreHorizontal, UserCheck, UserX, Loader2 } from "lucide-react"
import { useGetPatientsQuery } from "@/lib/store/api/services/patient.service"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"

type PatientRow = any;

const ManageUsers: React.FC = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const { data: patients = [], isLoading, isError } = useGetPatientsQuery(undefined)

  const filteredPatients = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) {
      return patients
    }

    return patients.filter(
      (patient: any) =>
        (patient?.name || "").toLowerCase().includes(normalizedQuery) ||
        (patient?.email || "").toLowerCase().includes(normalizedQuery) ||
        (patient?.phone || "").toLowerCase().includes(normalizedQuery)
    )
  }, [patients, searchQuery])

  const handleDeactivateUser = (_userId: string) => {
    // In a real app, this would call an API to deactivate the user
    toast.success(t("user deactivated"), {
      description: t("the user has been deactivated from the system"),
    })
  }

  const handleActivateUser = (_userId: string) => {
    // In a real app, this would call an API to activate the user
    toast.success(t("user activated"), {
      description: t("the user has been activated in the system"),
    })
  }

  const patientColumns = useMemo<DataTableColumn<PatientRow>[]>(
    () => [
      {
        id: "patient",
        header: t("patient"),
        sortable: true,
        sortValue: (patient) => patient.name,
        cell: (patient) => (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  patient.name
                )}&background=0D8ABC&color=fff`}
              />
              <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{patient.name || `${patient.firstName} ${patient.lastName}`}</p>
              <p className="text-sm text-muted-foreground">{patient.id || patient._id}</p>
            </div>
          </div>
        ),
      },
      {
        id: "gender",
        header: t("gender"),
        sortable: true,
        sortValue: (patient) => patient.gender,
        cell: (patient) => <span className="capitalize">{patient.gender}</span>,
      },
      {
        id: "dob",
        header: t("date of birth"),
        sortable: true,
        sortValue: (patient) => patient.dateOfBirth,
        cell: (patient) =>
          patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM dd, yyyy") : "-",
      },
      {
        id: "contact",
        header: t("contact"),
        cell: (patient) => (
          <div>
            <p>{patient.email}</p>
            <p className="text-sm text-muted-foreground">{patient.phone}</p>
          </div>
        ),
      },
      {
        id: "medicalHistory",
        header: t("medical history"),
        cell: (patient) => (
          <div className="max-w-50">
            {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {patient.medicalHistory.map((item, index) => (
                  <Badge
                    key={`${item}-${index}`}
                    variant="outline"
                    className="border-yellow-200 bg-yellow-50 text-yellow-800"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t("none recorded")}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: t("actions"),
        headerClassName: "text-right",
        className: "text-right",
        cell: (patient) => (
          <DropdownMenu>
            {/* @ts-expect-error Base UI doesn't support asChild prop */}
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleActivateUser(patient.id || patient._id)}>
                <UserCheck className="mr-2 h-4 w-4" />
                {t("activate")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDeactivateUser(patient.id || patient._id)}
              >
                <UserX className="mr-2 h-4 w-4" />
                {t("deactivate")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleActivateUser, handleDeactivateUser, t]
  )

  return (
    <div className="fadeIn space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("manage_users")}
        </h1>
        <p className="text-muted-foreground">
          {t("view and manage all patients registered in the system")}
        </p>
      </div>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("all patients")}</CardTitle>
          <CardDescription>
            {t("total patients registered", { count: filteredPatients.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex justify-center p-8 text-red-500">
              {t("Failed to load patients.")}
            </div>
          ) : (
            <ClientDataTable
              data={filteredPatients}
              columns={patientColumns}
              getRowId={(patient) => patient.id || patient._id}
              searchPlaceholder={t("search patients")}
              searchKeys={[(patient) => patient.name || `${patient.firstName} ${patient.lastName}`, (patient) => patient.email]}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              emptyMessage={t("no patients found matching your search")}
              defaultSort={{ columnId: "patient", direction: "asc" }}
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ManageUsers
