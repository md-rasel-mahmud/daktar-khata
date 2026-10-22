import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { UserPlus, X, Loader2 } from "lucide-react"
import { Button } from "@repo/ui/button"
import { useCreatePatientMutation } from "@/lib/store/api/services/patient.service"

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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "MALE",
    bloodGroup: "O+",
    age: "",
    address: "",
    emergencyContact: "",
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error(t("fill_required_fields"))
      return
    }

    try {
      const result = await createPatient({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        age: formData.age ? formData.age.trim() : undefined,
        address: formData.address ? formData.address.trim() : undefined,
        emergencyContact: formData.emergencyContact ? formData.emergencyContact.trim() : undefined,
      }).unwrap()

      const createdPatient = result?.data || result
      toast.success(t("patient_created_success"))
      onSuccess?.(createdPatient)
      onClose()
      setFormData({
        name: "",
        phone: "",
        gender: "MALE",
        bloodGroup: "O+",
        age: "",
        address: "",
        emergencyContact: "",
      })
    } catch (err: any) {
      toast.error(err?.data?.message || t("patient_create_failed"))
    }
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
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:bg-muted transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("patient_name_label")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahim Ahmed"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t("patient_phone_label")} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="017XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t("patient_gender_label")}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
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
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
