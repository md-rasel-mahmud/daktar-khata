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
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import {
  InvoicePrintModal,
  type InvoicePrintData,
} from "@/components/common/print"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  quickPatientSchema,
  type QuickPatientFormData,
} from "@/components/modals/QuickPatientModal"

const admissionFormSchema = z.object({
  patient: z.string().optional(),
  doctor: z.string().optional(),
  ward: z.string().optional(),
  room: z.string().optional(),
  bed: z.string().min(1, "Please select an available bed"),
  reason: z.string().optional(),
  diagnosis: z.string().optional(),
})

type AdmissionFormData = z.infer<typeof admissionFormSchema>

const chargeFormSchema = z.object({
  serviceName: z.string().trim().min(1, "Service name is required"),
  category: z.string(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  notes: z.string().trim().optional(),
})

type ChargeFormData = z.infer<typeof chargeFormSchema>

const quickWardFormSchema = z.object({
  name: z.string().trim().min(2, "Ward name must be at least 2 characters"),
})

type QuickWardFormData = z.infer<typeof quickWardFormSchema>

export default function ManageAdmissions() {
  const { t, i18n } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>("")
  const [search, setSearch] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const limit = 10

  // Modals state
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false)
  const [patientTab, setPatientTab] = useState<"select" | "create">("select")

  // Daily charge modal state
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
  const [selectedAdmissionForCharge, setSelectedAdmissionForCharge] =
    useState<AdmissionItem | null>(null)

  // Discharge modal state
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false)
  const [selectedAdmissionForDischarge, setSelectedAdmissionForDischarge] =
    useState<AdmissionItem | null>(null)
  const [dischargeNotes, setDischargeNotes] = useState("")

  // Quick Ward modal state
  const [isQuickWardModalOpen, setIsQuickWardModalOpen] = useState(false)

  // API Queries with server-side pagination & filtering
  const {
    data: admissionsData,
    isLoading: isLoadingAdmissions,
    refetch,
  } = useGetAdmissionsQuery({
    status: statusFilter || undefined,
    patient: selectedPatientFilter || undefined,
    search: search.trim() || undefined,
    page,
    limit,
  })

  const admissions = admissionsData?.data || []
  const total = admissionsData?.total ?? admissions.length
  const totalPages =
    admissionsData?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  const { data: patientsData } = useGetPatientsQuery(undefined)
  const patientsList = Array.isArray(patientsData)
    ? patientsData
    : (patientsData as any)?.data || []

  const { data: doctorsData } = useGetDoctorOptionsQuery(undefined)
  const doctorsList = Array.isArray(doctorsData)
    ? doctorsData
    : (doctorsData as any)?.data || []

  const { data: wards = [], refetch: refetchWards } = useGetWardsQuery()

  // React Hook Forms
  const {
    register: registerAdmission,
    handleSubmit: handleAdmissionSubmitForm,
    setValue: setAdmissionValue,
    watch: watchAdmission,
    reset: resetAdmission,
    formState: { errors: admissionErrors },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      patient: "",
      doctor: "",
      ward: "",
      room: "",
      bed: "",
      reason: "",
      diagnosis: "",
    },
  })

  const watchedWard = watchAdmission("ward")
  const watchedRoom = watchAdmission("room")
  const watchedBed = watchAdmission("bed")
  const watchedPatient = watchAdmission("patient")

  const {
    register: registerQuickPatient,
    handleSubmit: handleQuickPatientFormSubmit,
    reset: resetQuickPatient,
    formState: { errors: quickPatientErrors },
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

  const {
    register: registerCharge,
    handleSubmit: handleChargeSubmitForm,
    watch: watchCharge,
    reset: resetCharge,
    formState: { errors: chargeErrors },
  } = useForm<ChargeFormData>({
    resolver: zodResolver(chargeFormSchema),
    defaultValues: {
      serviceName: "",
      category: "INJECTION",
      quantity: 1,
      unitPrice: 0,
      notes: "",
    },
  })

  const watchedChargeQuantity = watchCharge("quantity") || 1
  const watchedChargePrice = watchCharge("unitPrice") || 0

  const {
    register: registerWard,
    handleSubmit: handleWardSubmitForm,
    reset: resetWard,
    formState: { errors: wardErrors },
  } = useForm<QuickWardFormData>({
    resolver: zodResolver(quickWardFormSchema),
    defaultValues: { name: "" },
  })

  const { data: rooms = [] } = useGetRoomsQuery(
    watchedWard ? { wardId: watchedWard } : undefined
  )
  const { data: beds = [] } = useGetBedsQuery(
    watchedRoom
      ? { roomId: watchedRoom, status: "AVAILABLE" }
      : watchedWard
      ? { wardId: watchedWard, status: "AVAILABLE" }
      : { status: "AVAILABLE" }
  )

  const [createAdmission, { isLoading: isCreatingAdmission }] =
    useCreateAdmissionMutation()
  const [createPatient, { isLoading: isCreatingPatient }] =
    useCreatePatientMutation()
  const [dischargePatient, { isLoading: isDischarging }] =
    useDischargePatientMutation()
  const [addDailyCharge, { isLoading: isAddingCharge }] =
    useAddAdmissionDailyChargeMutation()
  const [createWard, { isLoading: isCreatingWard }] = useCreateWardMutation()
  const [triggerGetInvoice] = useLazyGetAdmissionInvoiceQuery()

  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] =
    useState<InvoicePrintData | null>(null)

  const handleOpenAdmissionInvoice = async (adm: AdmissionItem) => {
    try {
      const res = await triggerGetInvoice(adm._id).unwrap()
      const invoiceData = res?.data || res
      if (
        invoiceData &&
        invoiceData.lineItems &&
        invoiceData.lineItems.length > 0
      ) {
        setSelectedInvoiceForPrint({
          invoiceNumber:
            invoiceData.invoiceNumber ||
            `INV-${adm._id.slice(-6).toUpperCase()}`,
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
            total: li.total || li.quantity * li.unitPrice || 0,
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
              serviceName: `Bed & Ward Charges (${daysAdmitted} Day(s) - Bed #${
                adm.bed?.bedNumber || "N/A"
              })`,
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

  // Handle Quick Ward Submit
  const onQuickWardSubmit = async (data: QuickWardFormData) => {
    try {
      const newWard = await createWard({ name: data.name.trim() }).unwrap()
      toast.success(t("ward_created_success") || "Ward created successfully!")
      setAdmissionValue("ward", (newWard as any)._id || "")
      resetWard()
      setIsQuickWardModalOpen(false)
      refetchWards()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_to_update"))
    }
  }

  // Handle Admission Submit (with either existing patient or inline quick create)
  const onAdmissionSubmit = async (admissionData: AdmissionFormData) => {
    let patientId = admissionData.patient

    if (patientTab === "create") {
      let createdPatientId = ""
      await handleQuickPatientFormSubmit(async (patientFormData) => {
        try {
          const newPatientRes = await createPatient({
            name: patientFormData.name.trim(),
            phone: patientFormData.phone.trim(),
            gender: patientFormData.gender,
            bloodGroup: patientFormData.bloodGroup,
            age: patientFormData.age?.trim() || undefined,
            address: patientFormData.address?.trim() || undefined,
            emergencyContact:
              patientFormData.emergencyContact?.trim() || undefined,
          }).unwrap()

          const createdPatient = newPatientRes?.data || newPatientRes
          createdPatientId = createdPatient?._id || createdPatient?.id
        } catch (err: any) {
          toast.error(err?.data?.message || t("patient_create_failed"))
          throw err
        }
      })()

      patientId = createdPatientId
      if (!patientId) return
    }

    if (!patientId) {
      toast.error(t("select_patient_req") || "Please select or create a patient")
      return
    }

    if (!admissionData.bed) {
      toast.error(t("select_available_bed") || "Please select an available bed")
      return
    }

    try {
      await createAdmission({
        patient: patientId,
        doctor: admissionData.doctor || undefined,
        ward: admissionData.ward || undefined,
        room: admissionData.room || undefined,
        bed: admissionData.bed,
        reason: admissionData.reason || undefined,
        diagnosis: admissionData.diagnosis || undefined,
      }).unwrap()

      toast.success(t("admission_success") || "Patient admitted successfully!")
      setIsAdmissionModalOpen(false)
      resetAdmission()
      resetQuickPatient()
      setPatientTab("select")
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("admission_failed"))
    }
  }

  // Handle Daily Charge Submit
  const onChargeSubmit = async (data: ChargeFormData) => {
    if (!selectedAdmissionForCharge) return

    try {
      await addDailyCharge({
        id: selectedAdmissionForCharge._id,
        body: {
          serviceName: data.serviceName.trim(),
          category: data.category,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          notes: data.notes?.trim() || "",
        },
      }).unwrap()

      toast.success(t("charge_added_msg") || "Daily charge added to admission invoice")
      setIsChargeModalOpen(false)
      setSelectedAdmissionForCharge(null)
      resetCharge()
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("inpatient_admissions")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("inpatient_desc")}</p>
        </div>

        <button
          onClick={() => {
            resetAdmission()
            resetQuickPatient()
            setPatientTab("select")
            setIsAdmissionModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
        >
          <Plus className="h-4 w-4" />
          {t("new_admission")}
        </button>
      </div>

      {/* Filter Bar with Search, Patient Filter & Status */}
      <div className="bg-card border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="relative max-w-sm w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search patient name, phone, or invoice..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {t("patient")}:
            </span>
            <select
              value={selectedPatientFilter}
              onChange={(e) => {
                setSelectedPatientFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary max-w-[210px]"
            >
              <option value="">{t("all_patients") || "All Patients"}</option>
              {patientsList.map((p: any) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.mobile || p.phone || "No phone"})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {t("status")}:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("all_admissions")}</option>
              <option value="ADMITTED">{t("admitted_active")}</option>
              <option value="DISCHARGED">{t("discharged")}</option>
            </select>
          </div>
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
              {isLoadingAdmissions ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    <span>Loading admissions...</span>
                  </td>
                </tr>
              ) : admissions.length > 0 ? (
                admissions.map((adm) => (
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
                        {adm.doctor?.specialization?.join(", ") ||
                          "General Medicine"}
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
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          adm.status === "ADMITTED" ||
                          adm.status === "ON_TREATMENT"
                            ? "bg-emerald-500/20 text-emerald-600"
                            : adm.status === "DISCHARGED"
                            ? "bg-slate-500/20 text-slate-600"
                            : "bg-amber-500/20 text-amber-600"
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {adm.status !== "DISCHARGED" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAdmissionForCharge(adm)
                                resetCharge()
                                setIsChargeModalOpen(true)
                              }}
                              className="px-2.5 py-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-xs font-semibold"
                              title={t("add_daily_nursing_charge")}
                            >
                              <Syringe className="h-3.5 w-3.5 text-amber-500" />
                              <span className="hidden sm:inline">
                                {t("charge_action_btn")}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAdmissionForDischarge(adm)
                                setIsDischargeModalOpen(true)
                              }}
                              className="px-2.5 py-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-xs font-semibold"
                              title={t("discharge_btn")}
                            >
                              <LogOut className="h-3.5 w-3.5 text-red-500" />
                              <span className="hidden sm:inline">
                                {t("discharge_btn")}
                              </span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenAdmissionInvoice(adm)}
                          className="px-2.5 py-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-xs font-semibold"
                          title={t("print_invoice")}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">
                            {t("invoice_print_btn")}
                          </span>
                        </button>
                      </div>
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

        {/* Server-Side Pagination Bar */}
        <div className="p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} admissions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border hover:bg-muted font-medium disabled:opacity-50 disabled:pointer-events-none transition flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-semibold px-2">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border hover:bg-muted font-medium disabled:opacity-50 disabled:pointer-events-none transition flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: NEW INPATIENT ADMISSION (WITH RHF + ZOD) */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              {t("inpatient_admissions")}
            </h2>

            <form
              onSubmit={handleAdmissionSubmitForm(onAdmissionSubmit)}
              className="space-y-4"
            >
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
                      value={watchedPatient}
                      onChange={(e) => setAdmissionValue("patient", e.target.value)}
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
                          {t("patient_name_label")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rahim Ahmed"
                          {...registerQuickPatient("name")}
                          className={`w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary ${
                            quickPatientErrors.name ? "border-red-500" : ""
                          }`}
                        />
                        {quickPatientErrors.name && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {quickPatientErrors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_phone_label")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="017XXXXXXXX"
                          {...registerQuickPatient("phone")}
                          className={`w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary ${
                            quickPatientErrors.phone ? "border-red-500" : ""
                          }`}
                        />
                        {quickPatientErrors.phone && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {quickPatientErrors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">
                          {t("patient_gender_label")}
                        </label>
                        <select
                          {...registerQuickPatient("gender")}
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
                          {...registerQuickPatient("bloodGroup")}
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
                          {...registerQuickPatient("age")}
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
                          {...registerQuickPatient("address")}
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
                          {...registerQuickPatient("emergencyContact")}
                          className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("attending_ref_doctor")}
                </label>
                <select
                  value={watchAdmission("doctor") || ""}
                  onChange={(e) => setAdmissionValue("doctor", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("choose_doctor")}</option>
                  {doctorsList.map((doc: any) => (
                    <option
                      key={doc.value || doc._id}
                      value={doc.value || doc._id}
                    >
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
                    value={watchedWard || ""}
                    onChange={(e) => {
                      setAdmissionValue("ward", e.target.value)
                      setAdmissionValue("room", "")
                      setAdmissionValue("bed", "")
                    }}
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
                  <label className="block text-xs font-semibold mb-1">
                    {t("room")}
                  </label>
                  <select
                    value={watchedRoom || ""}
                    onChange={(e) => {
                      setAdmissionValue("room", e.target.value)
                      setAdmissionValue("bed", "")
                    }}
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
                  {t("select_available_bed")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={watchedBed || ""}
                  onChange={(e) => setAdmissionValue("bed", e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-emerald-600 ${
                    admissionErrors.bed ? "border-red-500" : ""
                  }`}
                >
                  <option value="">{t("choose_bed")}</option>
                  {beds.map((b) => (
                    <option key={b._id} value={b._id}>
                      #{b.bedNumber} ({b.ward?.name || "General"} — ৳
                      {b.dailyCharge ?? 500})
                    </option>
                  ))}
                </select>
                {admissionErrors.bed && (
                  <p className="text-xs text-red-500 mt-1">
                    {admissionErrors.bed.message}
                  </p>
                )}
                {beds.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    {t("no_beds_available_here")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("admission_reason")}
                </label>
                <input
                  type="text"
                  {...registerAdmission("reason")}
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
                  disabled={isCreatingAdmission || isCreatingPatient}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition flex items-center gap-1.5"
                >
                  {(isCreatingAdmission || isCreatingPatient) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isCreatingAdmission || isCreatingPatient
                    ? t("submitting")
                    : t("confirm_admission")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DAILY SERVICE / INJECTION CHARGE (WITH RHF + ZOD) */}
      {isChargeModalOpen && selectedAdmissionForCharge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold text-lg">
              <Syringe className="h-5 w-5" />
              {t("add_daily_nursing_charge")}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t("patient_name")}:{" "}
              <b>{selectedAdmissionForCharge.patient?.name}</b> (#
              {selectedAdmissionForCharge.bed?.bedNumber})
            </p>

            <form
              onSubmit={handleChargeSubmitForm(onChargeSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("category_label")}
                </label>
                <select
                  {...registerCharge("category")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="INJECTION">
                    {t("injection_saline_charge")}
                  </option>
                  <option value="NURSING">{t("nursing_care")}</option>
                  <option value="DRESSING">{t("dressing_wound")}</option>
                  <option value="MEDICINE">{t("medicines")}</option>
                  <option value="MEDICAL_SUPPLY">{t("other_service")}</option>
                  <option value="OTHER">{t("other_service")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("charge_desc")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Inj. Ceftriaxone / Normal Saline"
                  {...registerCharge("serviceName")}
                  className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    chargeErrors.serviceName ? "border-red-500" : ""
                  }`}
                />
                {chargeErrors.serviceName && (
                  <p className="text-xs text-red-500 mt-1">
                    {chargeErrors.serviceName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("quantity")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...registerCharge("quantity", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      chargeErrors.quantity ? "border-red-500" : ""
                    }`}
                  />
                  {chargeErrors.quantity && (
                    <p className="text-xs text-red-500 mt-1">
                      {chargeErrors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("charge_amount_label")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="৳"
                    {...registerCharge("unitPrice", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      chargeErrors.unitPrice ? "border-red-500" : ""
                    }`}
                  />
                  {chargeErrors.unitPrice && (
                    <p className="text-xs text-red-500 mt-1">
                      {chargeErrors.unitPrice.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border text-xs flex justify-between items-center font-bold">
                <span>{t("final_charges")}:</span>
                <span className="text-foreground text-sm">
                  ৳
                  {(
                    watchedChargeQuantity * watchedChargePrice
                  ).toLocaleString()}
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
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold shadow hover:bg-amber-500 transition flex items-center gap-1.5"
                >
                  {isAddingCharge && <Loader2 className="h-4 w-4 animate-spin" />}
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
                <label className="block text-xs font-semibold mb-1">
                  {t("remarks")}
                </label>
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
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow hover:bg-red-500 transition flex items-center gap-1.5"
                >
                  {isDischarging && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("confirm_discharge")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD WARD (WITH RHF + ZOD) */}
      {isQuickWardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {t("new_ward_btn")}
            </h2>
            <form
              onSubmit={handleWardSubmitForm(onQuickWardSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("ward_name_req")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={t("ward_name_ph")}
                  {...registerWard("name")}
                  className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    wardErrors.name ? "border-red-500" : ""
                  }`}
                />
                {wardErrors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {wardErrors.name.message}
                  </p>
                )}
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
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 transition flex items-center gap-1.5"
                >
                  {isCreatingWard && <Loader2 className="h-4 w-4 animate-spin" />}
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
