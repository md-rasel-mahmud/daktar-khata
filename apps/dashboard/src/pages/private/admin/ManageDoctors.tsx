import React, { useCallback, useMemo, useState } from "react"
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
import { Avatar, AvatarFallback } from "@repo/ui/avatar"
import { Plus, Edit, Trash2, MoreHorizontal, Calendar } from "lucide-react"
import { toast } from "sonner"
import {
  useGetAllProfilesQuery,
  useUpdateProfileMutation,
} from "@/lib/store/api/services/profile.service"
import { RolesEnum } from "@/enums/role.enum"
import { type Doctor } from "@/types/doctor.type"
import { type FieldValues, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Gender } from "@/enums/gender.enums"
import { type FormInputConfig } from "@/components/common/form/FormInput"
import { useTranslation } from "react-i18next"
import { useCreateUserMutation } from "@/lib/store/api/services/user.service"
import {
  ClientDataTable,
  type DataTableColumn,
} from "@/components/common/table"
import {
  DoctorAddEditDialog,
  DoctorScheduleDialog,
} from "@/features/admin/components/manage-doctors"
import { BD_MOBILE_NO_REGEX } from "@/constants/regexes"

const getSpecializationLabel = (doctor: Doctor): string => {
  if (!Array.isArray(doctor.specialization)) {
    return String(doctor.specialization || "")
  }

  if (typeof doctor.specialization[0] === "string") {
    return doctor.specialization.join(", ")
  }

  return (doctor.specialization as { value: string }[])
    .map((spec) => spec.value)
    .join(", ")
}

const ManageDoctors: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { t } = useTranslation()

  const [isAddOrEditDoctorDialogOpen, setIsAddOrEditDoctorDialogOpen] =
    useState<boolean>(false)
  const [isEditForm, setIsEditForm] = useState<boolean>(false)

  const [isViewScheduleDialogOpen, setIsViewScheduleDialogOpen] =
    useState(false)
  const [currentDoctorSchedule, setCurrentDoctorSchedule] =
    useState<Doctor | null>(null)

  // RTK HOOKS
  const { data } = useGetAllProfilesQuery<{ data: Doctor[] }>(RolesEnum.DOCTOR)

  const [updateDoctorProfile] = useUpdateProfileMutation()

  const [createDoctor] = useCreateUserMutation()

  // validation schema should be following above Doctor type
  const validationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address").optional(),
    mobile: z
      .string()
      .regex(
        BD_MOBILE_NO_REGEX, // bangladeshi mobile number regex
        "Mobile number must be a valid Bangladeshi number"
      )
      .optional(),
    address: z.string().optional(),
    note: z.string().optional(),
    specialization: z
      .array(z.string().min(2, "Specialization must be at least 2 characters"))
      .or(
        z.array(
          z.object({
            value: z
              .string()
              .min(2, "Specialization must be at least 2 characters"),
          })
        )
      ),
    designation: z.string().min(2, "Designation must be at least 2 characters"),
    experienceInYears: z.number().min(0, "Experience cannot be negative"),
    hospitals: z.array(
      z.object({
        hospitalName: z
          .string()
          .min(2, "Hospital name must be at least 2 characters"),
        chamberAddress: z
          .string()
          .min(2, "Chamber address must be at least 2 characters"),
        location: z.string().min(2, "Location must be at least 2 characters"),
      })
    ),
    degree: z.array(
      z.object({
        name: z.string().min(2, "Degree name must be at least 2 characters"),
        university: z
          .string()
          .min(2, "University must be at least 2 characters"),
        year: z
          .number()
          .min(1900, "Year must be a valid year")
          .max(new Date().getFullYear(), "Year cannot be in the future"),
      })
    ),
    languages: z.array(
      z.string().min(2, "Language must be at least 2 characters")
    ),
    fee: z.number().min(0, "Fee cannot be negative"),
    schedules: z.array(
      z.object({
        days: z.array(z.string().min(3, "Day must be at least 3 characters")),
        startTime: z.string().min(5, "Start time must be in HH:mm format"),
        endTime: z.string().min(5, "End time must be in HH:mm format"),
      })
    ),
  })

  type FormValues = z.infer<typeof validationSchema>

  const DOCTOR_DEFAULT_VALUES = {
    name: "",
    email: "",
    mobile: "",
    address: "",
    note: "",
    specialization: [],
    designation: "",
    experienceInYears: 0,
    hospitals: [],
    degree: [],
    languages: [],
    fee: 0,
    schedules: [],
  }

  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: DOCTOR_DEFAULT_VALUES,
    resolver: zodResolver(validationSchema),
    mode: "all",
  })

  console.log("errors :>> ", errors)

  const {
    append: scheduleAppend,
    remove: scheduleRemove,
    fields: scheduleFields,
  } = useFieldArray({
    control,
    name: "schedules",
  })

  // specialization field array
  const {
    append: specializationAppend,
    remove: specializationRemove,
    fields: specializationFields,
  } = useFieldArray({
    control,
    name: "specialization",
  })

  const doctors = useMemo(() => data ?? [], [data])

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return doctors
    }

    return doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(normalizedQuery) ||
        getSpecializationLabel(doctor)
          .toLowerCase()
          .includes(normalizedQuery) ||
        doctor.email?.toLowerCase().includes(normalizedQuery)
    )
  }, [doctors, searchQuery])

  const handleDeleteDoctor = useCallback(
    (doctorId: string) => {
      // toast({
      //   title: "Doctor Removed",
      //   description: `Doctor ${doctorId} has been removed from the system.`,
      // })

      toast.success(`Doctor ${doctorId} has been removed from the system.`)
    },
    [toast]
  )

  const handleViewSchedule = useCallback(
    (doctor: typeof currentDoctorSchedule) => {
      setCurrentDoctorSchedule(doctor)

      console.log("doctor", doctor)
      setIsViewScheduleDialogOpen(true)
    },
    []
  )

  const handleEditDoctor = useCallback(
    (doctor: Doctor) => {
      reset(doctor)
      setIsAddOrEditDoctorDialogOpen(true)
      setIsEditForm(true)
    },
    [reset]
  )

  const doctorColumns = useMemo<DataTableColumn<Doctor>[]>(
    () => [
      {
        id: "doctor",
        header: "Doctor",
        sortable: true,
        sortValue: (doctor) => doctor.name,
        cell: (doctor) => (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{doctor.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{doctor.name}</p>
            </div>
          </div>
        ),
      },
      {
        id: "specialization",
        header: "Specialization",
        sortable: true,
        sortValue: (doctor) => getSpecializationLabel(doctor),
        cell: (doctor) => getSpecializationLabel(doctor),
      },
      {
        id: "contact",
        header: "Contact",
        cell: (doctor) => (
          <div>
            <p>{doctor.email}</p>
            <p className="text-sm text-muted-foreground">{doctor.mobile}</p>
          </div>
        ),
      },
      {
        id: "schedule",
        header: "Schedule",
        cell: (doctor) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewSchedule(doctor)}
          >
            <Calendar className="mr-1 h-4 w-4" />
            View
          </Button>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-right",
        className: "text-right",
        cell: (doctor) => (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditDoctor(doctor)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDeleteDoctor(doctor._id || doctor.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleViewSchedule, handleEditDoctor, handleDeleteDoctor]
  )

  const handleAddOrEditDoctorSubmit = (data: FieldValues) => {
    // In a real app, we would send data to an API

    if (isEditForm) {
      const body = {
        ...data,
      }

      delete body._id // Remove _id if present, as it should not be sent in the update
      delete body.password // Password should not be updated unless explicitly set

      updateDoctorProfile({
        body: data,
        handleDialogClose: setIsAddOrEditDoctorDialogOpen,
      })
    } else {
      createDoctor({
        body: { ...data, role: RolesEnum.DOCTOR },
        handleDialogClose: setIsAddOrEditDoctorDialogOpen,
      })
    }
  }

  const formData: FormInputConfig[] = [
    {
      name: "name",
      label: t("full name"),
      type: "text",
      placeholder: "Enter full name",
      required: true,
    },
    {
      name: "email",
      label: t("email"),
      type: "email",
      placeholder: "Enter email address",
      required: false,
    },
    {
      name: "mobile",
      label: t("phone number"),
      type: "text",
      placeholder: "Enter phone number",
      required: true,
    },
    {
      name: "address",
      label: t("address"),
      type: "textarea",
      placeholder: "Enter address",
      required: false,
      className: "col-span-2 lg:col-span-3",
    },
    {
      name: "note",
      label: t("note"),
      type: "textarea",
      placeholder: "Enter any additional notes about the doctor",
      required: false,
      className: "col-span-2 lg:col-span-3",
    },
    {
      name: "designation",
      label: t("designation"),
      type: "text",
      placeholder: "Enter designation",
      required: true,
    },
    {
      name: "experienceInYears",
      label: t("years of experience"),
      type: "number",
      placeholder: "Enter years of experience",
      required: true,
    },
    {
      name: "gender",
      label: t("gender"),
      type: "select",
      placeholder: "Select gender",
      required: true,
      options: Object.values(Gender).map((gender) => ({
        value: gender,
        label: gender,
      })),
    },
  ]

  return (
    <>
      <div className="fadeIn space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Doctors
            </h1>
            <p className="text-muted-foreground">
              View and manage all doctors in the clinic.
            </p>
          </div>
          <Button onClick={() => setIsAddOrEditDoctorDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </div>

        {/* Doctors List */}
        <Card>
          <CardHeader>
            <CardTitle>All Doctors</CardTitle>
            <CardDescription>
              Total of {filteredDoctors.length} doctors registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientDataTable
              data={doctors}
              columns={doctorColumns}
              getRowId={(doctor, index) =>
                doctor._id || doctor.email || `${doctor.name}-${index}`
              }
              emptyMessage="No doctors found matching your search."
              searchPlaceholder="Search doctors..."
              searchKeys={[
                (doctor) => doctor.name,
                (doctor) => doctor.email,
                (doctor) => getSpecializationLabel(doctor),
              ]}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              pageSizeOptions={[5, 10, 20]}
              initialPageSize={10}
              defaultSort={{ columnId: "doctor", direction: "asc" }}
            />
          </CardContent>
        </Card>
      </div>

      <DoctorAddEditDialog
        open={isAddOrEditDoctorDialogOpen}
        isEditForm={isEditForm}
        onOpenChange={setIsAddOrEditDoctorDialogOpen}
        handleSubmit={handleSubmit as never}
        onSubmit={handleAddOrEditDoctorSubmit}
        control={control as never}
        register={register as never}
        formData={formData}
        scheduleFields={scheduleFields as never}
        scheduleAppend={scheduleAppend as never}
        scheduleRemove={scheduleRemove}
        specializationFields={specializationFields as never}
        specializationAppend={specializationAppend as never}
        specializationRemove={specializationRemove}
        t={t}
      />

      <DoctorScheduleDialog
        open={isViewScheduleDialogOpen}
        onOpenChange={setIsViewScheduleDialogOpen}
        doctor={currentDoctorSchedule}
      />
    </>
  )
}

export default ManageDoctors
