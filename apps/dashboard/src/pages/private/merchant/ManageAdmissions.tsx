import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetAdmissionsQuery,
  useCreateAdmissionMutation,
  useDischargePatientMutation,
  useAddAdmissionDailyChargeMutation,
  useGetWardsQuery,
  useCreateWardMutation,
  useGetRoomsQuery,
  useGetBedsQuery,
  useLazyGetAdmissionInvoiceQuery,
} from "@/lib/store/api/services/admission.service"
import type { AdmissionItem } from "@/lib/store/api/services/admission.service"
import {
  useGetPatientsQuery,
  useCreatePatientMutation,
} from "@/lib/store/api/services/patient.service"
import { useGetDoctorOptionsQuery } from "@/lib/store/api/services/doctor.service"
import { toast } from "sonner"
import {
  Bed,
  Plus,
  Search,
  CheckCircle2,
  Syringe,
  FileText,
  LogOut,
  Calendar,
  User,
  UserPlus,
  Stethoscope,
  Clock,
  Layers,
  Building,
  Printer,
} from "lucide-react"
import {
  InvoicePrintModal,
  type InvoicePrintData,
} from "@/components/common/print"

export default function ManageAdmissions() {
  const { t, i18n } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [search, setSearch] = useState<string>("")

  // Modals state
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false)
  const [patientTab, setPatientTab] = useState<"select" | "create">("select")
  const [quickPatientForm, setQuickPatientForm] = useState({
    name: "",
    phone: "",
    gender: "MALE",
    bloodGroup: "O+",
    age: "",
    address: "",
    emergencyContact: "",
  })
  const [admissionForm, setAdmissionForm] = useState({
    patient: "",
    doctor: "",
    ward: "",
    room: "",
    bed: "",
    reason: "",
    diagnosis: "",
  })

  // Daily charge modal state
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
  const [selectedAdmissionForCharge, setSelectedAdmissionForCharge] = useState<AdmissionItem | null>(null)
  const [chargeForm, setChargeForm] = useState({
    serviceName: "",
    category: "INJECTION",
    quantity: "1",
    unitPrice: "",
    notes: "",
  })

  // Discharge modal state
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false)
  const [selectedAdmissionForDischarge, setSelectedAdmissionForDischarge] = useState<AdmissionItem | null>(null)
  const [dischargeNotes, setDischargeNotes] = useState("")

  // API Queries
  const { data: admissions = [], isLoading: isLoadingAdmissions, refetch } = useGetAdmissionsQuery({
    status: statusFilter || undefined,
  })
  const { data: patientsData } = useGetPatientsQuery(undefined)
  const patientsList = Array.isArray(patientsData) ? patientsData : (patientsData as any)?.data || []

  const { data: doctorsData } = useGetDoctorOptionsQuery(undefined)
  const doctorsList = Array.isArray(doctorsData) ? doctorsData : (doctorsData as any)?.data || []

  const { data: wards = [], refetch: refetchWards } = useGetWardsQuery()
  const { data: rooms = [] } = useGetRoomsQuery(
    admissionForm.ward ? { wardId: admissionForm.ward } : undefined
  )
  const { data: beds = [] } = useGetBedsQuery(
    admissionForm.room
      ? { roomId: admissionForm.room, status: "AVAILABLE" }
      : admissionForm.ward
      ? { wardId: admissionForm.ward, status: "AVAILABLE" }
      : { status: "AVAILABLE" }
  )

  const [createAdmission, { isLoading: isCreatingAdmission }] = useCreateAdmissionMutation()
  const [createPatient, { isLoading: isCreatingPatient }] = useCreatePatientMutation()
  const [dischargePatient, { isLoading: isDischarging }] = useDischargePatientMutation()
  const [addDailyCharge, { isLoading: isAddingCharge }] = useAddAdmissionDailyChargeMutation()
  const [createWard, { isLoading: isCreatingWard }] = useCreateWardMutation()
  const [triggerGetInvoice] = useLazyGetAdmissionInvoiceQuery()

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] =
    useState<InvoicePrintData | null>(null)

  const handleOpenAdmissionInvoice = async (adm: AdmissionItem) => {
    try {
      const res = await triggerGetInvoice(adm._id).unwrap()
      const invoiceData = res?.data || res
      if (invoiceData && invoiceData.lineItems && invoiceData.lineItems.length > 0) {
        setSelectedInvoiceForPrint({
          invoiceNumber: invoiceData.invoiceNumber || `INV-${adm._id.slice(-6).toUpperCase()}`,
          date: invoiceData.issuedDate || new Date(),
          patient: {
            name: adm.patient?.name || "Patient",
            mobile: adm.patient?.mobile || adm.patient?.phone || "N/A",
            ward: adm.ward?.name,
            bedNumber: adm.bed?.bedNumber,
            room: adm.room?.name,
          },
          doctor: {
            name: adm.doctor?.name,
            specialization: adm.doctor?.specialization?.join(", "),
          },
          lineItems: invoiceData.lineItems.map((li: any) => ({
            serviceName: li.serviceName,
            category: li.category,
            quantity: li.quantity || 1,
            unitPrice: li.unitPrice || 0,
            total: li.total || (li.quantity * li.unitPrice) || 0,
          })),
          subtotal: invoiceData.subtotal || 0,
          totalDiscount: invoiceData.totalDiscount || 0,
          totalTax: invoiceData.totalTax || 0,
          grandTotal: invoiceData.grandTotal || 0,
          paidAmount: invoiceData.paidAmount || 0,
          dueAmount: invoiceData.dueAmount ?? invoiceData.grandTotal ?? 0,
          paymentMethod: "CASH / POS",
        })
      } else {
        const daysAdmitted = Math.max(
          1,
          Math.ceil(
            (new Date().getTime() - new Date(adm.admissionDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
        const dailyCharge = adm.bed?.dailyCharge || 500
        const bedTotal = daysAdmitted * dailyCharge

        setSelectedInvoiceForPrint({
          invoiceNumber: `INV-ADM-${adm._id.slice(-6).toUpperCase()}`,
          date: new Date(),
          patient: {
            name: adm.patient?.name || "Patient",
            mobile: adm.patient?.mobile || adm.patient?.phone || "N/A",
            ward: adm.ward?.name,
            bedNumber: adm.bed?.bedNumber,
            room: adm.room?.name,
          },
          doctor: {
            name: adm.doctor?.name,
            specialization: adm.doctor?.specialization?.join(", "),
          },
          lineItems: [
            {
              serviceName: `Bed & Ward Charges (${daysAdmitted} Day(s) - Bed #${adm.bed?.bedNumber || "N/A"})`,
              category: "ACCOMMODATION",
              quantity: daysAdmitted,
              unitPrice: dailyCharge,
              total: bedTotal,
            },
          ],
          subtotal: bedTotal,
          grandTotal: bedTotal,
          paidAmount: 0,
          dueAmount: bedTotal,
          paymentMethod: "CASH / POS",
        })
      }
    } catch {
      toast.error(t("failed"))
    }
  }

  const [isQuickWardModalOpen, setIsQuickWardModalOpen] = useState(false)
  const [quickWardName, setQuickWardName] = useState("")

  const handleQuickWardCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickWardName.trim()) {
      toast.error(t("ward_name_req"))
      return
    }

    try {
      const newWard = await createWard({ name: quickWardName.trim() }).unwrap()
      toast.success(t("ward_created_success"))
      setAdmissionForm((prev) => ({ ...prev, ward: (newWard as any)._id || "" }))
      setQuickWardName("")
      setIsQuickWardModalOpen(false)
      refetchWards()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_to_update"))
    }
  }

  // Handle Admission Submit
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let patientId = admissionForm.patient

    if (patientTab === "create") {
      if (!quickPatientForm.name.trim() || !quickPatientForm.phone.trim()) {
        toast.error(t("fill_required_fields"))
        return
      }

      try {
        const newPatientRes = await createPatient({
          name: quickPatientForm.name.trim(),
          phone: quickPatientForm.phone.trim(),
          gender: quickPatientForm.gender,
          bloodGroup: quickPatientForm.bloodGroup,
          age: quickPatientForm.age ? quickPatientForm.age.trim() : undefined,
          address: quickPatientForm.address ? quickPatientForm.address.trim() : undefined,
          emergencyContact: quickPatientForm.emergencyContact ? quickPatientForm.emergencyContact.trim() : undefined,
        }).unwrap()

        const createdPatient = newPatientRes?.data || newPatientRes
        patientId = createdPatient?._id || createdPatient?.id
      } catch (err: any) {
        toast.error(err?.data?.message || t("patient_create_failed"))
        return
      }
    }

    if (!patientId || !admissionForm.bed) {
      toast.error(t("select_patient_and_bed"))
      return
    }

    try {
      await createAdmission({
        patient: patientId,
        doctor: admissionForm.doctor || undefined,
        ward: admissionForm.ward || undefined,
        room: admissionForm.room || undefined,
        bed: admissionForm.bed,
        reason: admissionForm.reason,
        diagnosis: admissionForm.diagnosis,
      }).unwrap()

      toast.success(t("admission_success"))
      setIsAdmissionModalOpen(false)
      setAdmissionForm({
        patient: "",
        doctor: "",
        ward: "",
        room: "",
        bed: "",
        reason: "",
        diagnosis: "",
      })
      setQuickPatientForm({
        name: "",
        phone: "",
        gender: "MALE",
        bloodGroup: "O+",
        age: "",
        address: "",
        emergencyContact: "",
      })
      setPatientTab("select")
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("admission_failed"))
    }
  }

  // Handle Daily Charge Submit
  const handleChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmissionForCharge || !chargeForm.serviceName || !chargeForm.unitPrice) {
      toast.error(t("enter_charge_details"))
      return
    }

    try {
      await addDailyCharge({
        id: selectedAdmissionForCharge._id,
        body: {
          serviceName: chargeForm.serviceName,
          category: chargeForm.category,
          quantity: parseInt(chargeForm.quantity) || 1,
          unitPrice: parseFloat(chargeForm.unitPrice) || 0,
          notes: chargeForm.notes,
        },
      }).unwrap()

      toast.success(t("charge_added_msg"))
      setIsChargeModalOpen(false)
      setSelectedAdmissionForCharge(null)
      setChargeForm({
        serviceName: "",
        category: "INJECTION",
        quantity: "1",
        unitPrice: "",
        notes: "",
      })
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed"))
    }
  }

  // Handle Discharge Submit
  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmissionForDischarge) return

    try {
      await dischargePatient({
        id: selectedAdmissionForDischarge._id,
        body: { dischargeNotes },
      }).unwrap()

      toast.success(t("discharge_success_msg"))
      setIsDischargeModalOpen(false)
      setSelectedAdmissionForDischarge(null)
      setDischargeNotes("")
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed"))
    }
  }

  const filteredAdmissions = admissions.filter((adm) => {
    const pName = adm.patient?.name?.toLowerCase() || ""
    const dName = adm.doctor?.name?.toLowerCase() || ""
    const term = search.toLowerCase()
    return pName.includes(term) || dName.includes(term)
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("inpatient_admissions")}</h1>
          <p className="text-sm text-muted-foreground">{t("inpatient_desc")}</p>
        </div>

        <button
          onClick={() => setIsAdmissionModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
        >
          <Plus className="h-4 w-4" />
          {t("new_admission")}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_patient_doctor")}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">{t("status")}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("all_admissions")}</option>
            <option value="ADMITTED">{t("admitted_active")}</option>
            <option value="DISCHARGED">{t("discharged")}</option>
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-3">{t("patient_name")}</th>
                <th className="px-5 py-3">{t("assigned_doctor")}</th>
                <th className="px-5 py-3">{t("ward_bed")}</th>
                <th className="px-5 py-3">{t("admission_date")}</th>
                <th className="px-5 py-3">{t("status")}</th>
                <th className="px-5 py-3 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAdmissions.length > 0 ? (
                filteredAdmissions.map((adm) => (
                  <tr key={adm._id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {adm.patient?.name || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {adm.patient?.phone || adm.patient?.mobile || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {adm.doctor?.name || t("medical_officer")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {adm.doctor?.specialization?.join(", ") || "General Medicine"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 font-bold text-xs border border-cyan-500/20">
                        <Bed className="h-3.5 w-3.5" />
                        {adm.ward?.name || "General"} — #{adm.bed?.bedNumber || "N/A"}
                      </div>
                      {adm.room?.name && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {adm.room.name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(adm.admissionDate).toLocaleDateString(
                        i18n.language === "bn" ? "bn-BD" : "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          adm.status === "ADMITTED"
                            ? "bg-emerald-500/20 text-emerald-600"
                            : "bg-slate-500/20 text-slate-600"
                        }`}
                      >
                        {adm.status === "ADMITTED" ? t("admitted_active") : t("discharged")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAdmissionInvoice(adm)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs font-semibold"
                        title={t("view_invoice")}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        {t("view_invoice")}
                      </button>
                      {adm.status === "ADMITTED" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAdmissionForCharge(adm)
                              setIsChargeModalOpen(true)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold"
                            title={t("add_daily_nursing_charge")}
                          >
                            <Syringe className="h-3.5 w-3.5" />
                            {t("add_charge")}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAdmissionForDischarge(adm)
                              setIsDischargeModalOpen(true)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold"
                            title={t("confirm_discharge")}
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            {t("discharge")}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    {t("no_admissions_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: NEW INPATIENT ADMISSION */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              {t("inpatient_admissions")}
            </h2>
            <form onSubmit={handleAdmissionSubmit} className="space-y-4">
              {/* PATIENT SELECTION / QUICK REGISTRATION TAB */}
              <div className="p-3.5 rounded-2xl border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" />
                    {t("patient")}
                  </span>
                  <div className="flex p-0.5 rounded-xl bg-muted border text-xs">
                    <button
                      type="button"
                      onClick={() => setPatientTab("select")}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        patientTab === "select"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t("select_existing_patient")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientTab("create")}
                      className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                        patientTab === "create"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {t("quick_add_patient")}
                    </button>
                  </div>
                </div>

                {patientTab === "select" ? (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t("select_patient_req")}
                    </label>
                    <select
                      required={patientTab === "select"}
                      value={admissionForm.patient}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, patient: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">{t("choose_patient")}</option>
                      {patientsList.map((p: any) => (
                        <option key={p._id} value={p._id}>
                          {p.name} — {p.mobile || p.phone} ({p.gender || "N/A"})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_name_label")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required={patientTab === "create"}
                          placeholder="e.g. Rahim Ahmed"
                          value={quickPatientForm.name}
                          onChange={(e) =>
                            setQuickPatientForm({ ...quickPatientForm, name: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_phone_label")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required={patientTab === "create"}
                          placeholder="017XXXXXXXX"
                          value={quickPatientForm.phone}
                          onChange={(e) =>
                            setQuickPatientForm({ ...quickPatientForm, phone: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_gender_label")}
                        </label>
                        <select
                          value={quickPatientForm.gender}
                          onChange={(e) =>
                            setQuickPatientForm({ ...quickPatientForm, gender: e.target.value })
                          }
                          className="w-full px-2 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_blood_group_label")}
                        </label>
                        <select
                          value={quickPatientForm.bloodGroup}
                          onChange={(e) =>
                            setQuickPatientForm({ ...quickPatientForm, bloodGroup: e.target.value })
                          }
                          className="w-full px-2 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_age_label")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 35"
                          value={quickPatientForm.age}
                          onChange={(e) =>
                            setQuickPatientForm({ ...quickPatientForm, age: e.target.value })
                          }
                          className="w-full px-2 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_address_label")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dhanmondi, Dhaka"
                          value={quickPatientForm.address}
                          onChange={(e) =>
                            setQuickPatientForm({ ...quickPatientForm, address: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_emergency_contact_label")}
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 018XXXXXXXX"
                          value={quickPatientForm.emergencyContact}
                          onChange={(e) =>
                            setQuickPatientForm({
                              ...quickPatientForm,
                              emergencyContact: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t("attending_ref_doctor")}</label>
                <select
                  value={admissionForm.doctor}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, doctor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("choose_doctor")}</option>
                  {doctorsList.map((doc: any) => (
                    <option key={doc.value || doc._id} value={doc.value || doc._id}>
                      {doc.label || doc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold">{t("ward")}</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickWardModalOpen(true)}
                      className="text-[11px] text-primary font-semibold hover:underline"
                    >
                      {t("quick_add_ward")}
                    </button>
                  </div>
                  <select
                    value={admissionForm.ward}
                    onChange={(e) =>
                      setAdmissionForm({ ...admissionForm, ward: e.target.value, room: "", bed: "" })
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("filter_ward")}</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("room")}</label>
                  <select
                    value={admissionForm.room}
                    onChange={(e) =>
                      setAdmissionForm({ ...admissionForm, room: e.target.value, bed: "" })
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("filter_room")}</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name || `Room ${r.roomNumber}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("select_available_bed")}
                </label>
                <select
                  required
                  value={admissionForm.bed}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, bed: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-emerald-600"
                >
                  <option value="">{t("choose_bed")}</option>
                  {beds.map((b) => (
                    <option key={b._id} value={b._id}>
                      #{b.bedNumber} ({b.ward?.name || "General"} — ৳{b.dailyCharge ?? 500})
                    </option>
                  ))}
                </select>
                {beds.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    {t("no_beds_available_here")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t("admission_reason")}</label>
                <input
                  type="text"
                  value={admissionForm.reason}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, reason: e.target.value })}
                  placeholder={t("admission_reason")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdmissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmission || isCreatingPatient || !admissionForm.bed}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  {isCreatingAdmission || isCreatingPatient ? t("submitting") : t("confirm_admission")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DAILY SERVICE / INJECTION CHARGE */}
      {isChargeModalOpen && selectedAdmissionForCharge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold text-lg">
              <Syringe className="h-5 w-5" />
              {t("add_daily_nursing_charge")}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t("patient_name")}: <b>{selectedAdmissionForCharge.patient?.name}</b> (#{selectedAdmissionForCharge.bed?.bedNumber})
            </p>

            <form onSubmit={handleChargeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("category_label")}</label>
                <select
                  value={chargeForm.category}
                  onChange={(e) => setChargeForm({ ...chargeForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="INJECTION">{t("injection_saline_charge")}</option>
                  <option value="NURSING">{t("nursing_care")}</option>
                  <option value="DRESSING">{t("dressing_wound")}</option>
                  <option value="MEDICINE">{t("medicines")}</option>
                  <option value="MEDICAL_SUPPLY">{t("other_service")}</option>
                  <option value="OTHER">{t("other_service")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t("charge_desc")}</label>
                <input
                  type="text"
                  required
                  value={chargeForm.serviceName}
                  onChange={(e) => setChargeForm({ ...chargeForm, serviceName: e.target.value })}
                  placeholder="Inj. Ceftriaxone / Normal Saline"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t("quantity")}</label>
                  <input
                    type="number"
                    min="1"
                    value={chargeForm.quantity}
                    onChange={(e) => setChargeForm({ ...chargeForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("charge_amount_label")}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={chargeForm.unitPrice}
                    onChange={(e) => setChargeForm({ ...chargeForm, unitPrice: e.target.value })}
                    placeholder="৳"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border text-xs flex justify-between items-center font-bold">
                <span>{t("final_charges")}:</span>
                <span className="text-foreground text-sm">
                  ৳{((parseInt(chargeForm.quantity) || 1) * (parseFloat(chargeForm.unitPrice) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsChargeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isAddingCharge}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold shadow hover:bg-amber-500 transition"
                >
                  {t("add_to_invoice")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISCHARGE PATIENT */}
      {isDischargeModalOpen && selectedAdmissionForDischarge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              {t("confirm_discharge")}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("discharge_confirm_desc")}
            </p>

            <form onSubmit={handleDischargeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("remarks")}</label>
                <textarea
                  rows={3}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDischargeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isDischarging}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow hover:bg-red-500 transition"
                >
                  {t("confirm_discharge")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD WARD */}
      {isQuickWardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {t("new_ward_btn")}
            </h2>
            <form onSubmit={handleQuickWardCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("ward_name_req")}</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickWardName}
                  onChange={(e) => setQuickWardName(e.target.value)}
                  placeholder={t("ward_name_ph")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsQuickWardModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border hover:bg-muted text-xs font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWard}
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 transition"
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: INVOICE PRINT PREVIEW (A4 & POS) */}
      <InvoicePrintModal
        open={Boolean(selectedInvoiceForPrint)}
        onClose={() => setSelectedInvoiceForPrint(null)}
        data={selectedInvoiceForPrint}
      />
    </div>
  )
}
