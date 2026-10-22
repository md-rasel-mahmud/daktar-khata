import React from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { UserPlus, X, Loader2 } from "lucide-react"
import { Button } from "@repo/ui/button"
import { useCreatePatientMutation } from "@/lib/store/api/services/patient.service"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export const quickPatientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+ -]+$/, "Please enter a valid phone number"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup: z.string(),
  age: z.string().trim().optional(),
  address: z.string().trim().optional(),
  emergencyContact: z.string().trim().optional(),
})

export type QuickPatientFormData = z.infer<typeof quickPatientSchema>

interface QuickPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (patient: any) => void
}

export const QuickPatientModal: React.FC<QuickPatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const [createPatient, { isLoading }] = useCreatePatientMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickPatientFormData>({
    resolver: zodResolver(quickPatientSchema),
    defaultValues: {
      name: "",
      phone: "",
      gender: "MALE",
      bloodGroup: "O+",
      age: "",
      address: "",
      emergencyContact: "",
    },
  })

  if (!isOpen) return null

  const onSubmit = async (data: QuickPatientFormData) => {
    try {
      const result = await createPatient({
        name: data.name.trim(),
        phone: data.phone.trim(),
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        age: data.age?.trim() || undefined,
        address: data.address?.trim() || undefined,
        emergencyContact: data.emergencyContact?.trim() || undefined,
      }).unwrap()

      const createdPatient = result?.data || result
      toast.success(t("patient_created_success") || "Patient registered successfully!")
      onSuccess?.(createdPatient)
      reset()
      onClose()
    } catch (err: any) {
      toast.error(err?.data?.message || t("patient_create_failed") || "Failed to create patient")
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t("create_new_patient")}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t("quick_add_patient_desc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-muted-foreground hover:bg-muted transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("patient_name_label")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahim Ahmed"
              {...register("name")}
              className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("patient_phone_label")} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="017XXXXXXXX"
              {...register("phone")}
              className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.phone ? "border-red-500 ring-1 ring-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Initial password for patient will be this phone number
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("patient_gender_label")}
              </label>
              <select
                {...register("gender")}
                className="w-full px-2.5 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("patient_blood_group_label")}
              </label>
              <select
                {...register("bloodGroup")}
                className="w-full px-2.5 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("patient_age_label")}
              </label>
              <input
                type="text"
                placeholder="e.g. 32"
                {...register("age")}
                className="w-full px-2.5 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("patient_address_label")}
            </label>
            <input
              type="text"
              placeholder="e.g. Road 12, Dhanmondi, Dhaka"
              {...register("address")}
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("patient_emergency_contact_label")}
            </label>
            <input
              type="tel"
              placeholder="e.g. 018XXXXXXXX"
              {...register("emergencyContact")}
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t("creating") : t("save_patient")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
