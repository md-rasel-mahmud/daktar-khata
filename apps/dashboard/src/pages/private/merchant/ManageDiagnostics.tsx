import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetTestOrdersQuery,
  useCreateTestOrderMutation,
  useUpdateTestOrderItemStatusMutation,
} from "@/lib/store/api/services/diagnostics.service"
import type { TestOrder } from "@/lib/store/api/services/diagnostics.service"
import { useGetTestCatalogQuery } from "@/lib/store/api/services/service-catalog.service"
import { useGetPatientsQuery } from "@/lib/store/api/services/patient.service"
import { toast } from "sonner"
import {
  TestTube,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  User,
  AlertCircle,
  CreditCard,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import {
  InvoicePrintModal,
  ReportPrintModal,
} from "@/components/common/print"
import { CollectPaymentModal } from "@/components/modals/CollectPaymentModal"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const walkInOrderSchema = z.object({
  patient: z.string().min(1, "Please select a patient"),
  referringDoctorName: z.string().trim(),
  paidAmount: z.number().optional(),
})

type WalkInOrderFormData = z.infer<typeof walkInOrderSchema>

export default function ManageDiagnostics() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [patientFilter, setPatientFilter] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<TestOrder | null>(null)
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<any>(null)
  const [selectedPatientForPayment, setSelectedPatientForPayment] = useState<any>(null)
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([])

  // Queries with server-side search and pagination
  const {
    data: ordersResponse,
    isLoading: isLoadingOrders,
    refetch,
  } = useGetTestOrdersQuery({
    search: search.trim() || undefined,
    patientId: patientFilter || undefined,
    page,
    limit,
  })

  const testOrders = ordersResponse?.data || []
  const total = ordersResponse?.total ?? testOrders.length
  const totalPages =
    ordersResponse?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  const { data: catalog = [] } = useGetTestCatalogQuery()
  const { data: patientsData } = useGetPatientsQuery(undefined)
  const patientsList = Array.isArray(patientsData)
    ? patientsData
    : (patientsData as any)?.data || []

  const [createOrder, { isLoading: isCreating }] = useCreateTestOrderMutation()
  const [updateStatus] = useUpdateTestOrderItemStatusMutation()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<WalkInOrderFormData>({
    resolver: zodResolver(walkInOrderSchema),
    defaultValues: {
      patient: "",
      referringDoctorName: "Self / Walk-in",
      paidAmount: 0,
    },
  })

  const handleToggleTest = (testId: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    )
  }

  const selectedTestObjects = catalog.filter((c) =>
    selectedTestIds.includes(c._id)
  )
  const totalPrice = selectedTestObjects.reduce((sum, item) => sum + item.price, 0)

  const onConfirmCreateOrder = async (data: WalkInOrderFormData) => {
    if (selectedTestIds.length === 0) {
      toast.error(t("select_patient_and_test") || "Please select at least one test")
      return
    }

    try {
      const items = selectedTestObjects.map((tItem) => ({
        test: tItem._id,
        testName: tItem.name,
        price: tItem.price,
      }))

      const res = await createOrder({
        patient: data.patient,
        referringDoctorName: data.referringDoctorName || "Self / Walk-in",
        isWalkIn: true,
        paidAmount:
          typeof data.paidAmount === "number" ? data.paidAmount : totalPrice,
        items,
      }).unwrap()

      toast.success(t("walkin_order_success") || "Walk-in order created successfully!")
      setIsOrderModalOpen(false)
      setSelectedReceipt(res)
      setSelectedTestIds([])
      reset()
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("order_create_failed"))
    }
  }

  const handleUpdateItemStatus = async (
    orderId: string,
    itemIndex: number,
    nextStatus: string
  ) => {
    try {
      await updateStatus({ id: orderId, itemIndex, status: nextStatus }).unwrap()
      toast.success(`${t("test_status_updated")}: ${nextStatus}`)
      refetch()
    } catch {
      toast.error(t("failed"))
    }
  }

  const handleOpenReport = (ord: any) => {
    const isDue =
      (ord.dueAmount && ord.dueAmount > 0) ||
      (ord.paymentStatus && ord.paymentStatus !== "PAID")

    if (isDue) {
      toast.error(
        `Payment of ৳${ord.dueAmount || "due balance"} is outstanding on this order. Please collect payment to unlock official laboratory report.`
      )
      return
    }

    setSelectedReportForPrint({
      reportNumber: ord.orderNumber ? `REP-${ord.orderNumber}` : "LAB-2026-001",
      orderNumber: ord.tokenNumber ? `#${ord.tokenNumber}` : ord.orderNumber,
      testName: ord.items?.[0]?.testName || "Diagnostic Investigation",
      date: ord.createdAt || new Date(),
      patient: {
        name: ord.patient?.name || "Patient",
        mobile: ord.patient?.mobile || ord.patient?.phone,
        gender: ord.patient?.gender,
        age: ord.patient?.age,
      },
      referringDoctor: {
        name: ord.doctor?.name || ord.referringDoctorName || "Direct Walk-in",
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("diagnostics_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("diagnostics_desc")}
          </p>
        </div>

        <button
          onClick={() => {
            reset()
            setSelectedTestIds([])
            setIsOrderModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
        >
          <Plus className="h-4 w-4" />
          {t("walkin_order_btn")}
        </button>
      </div>

      {/* Filter Bar with Search and Patient Filter */}
      <div className="bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="relative max-w-sm w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search patient, token, or order ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {t("patient")}:
          </span>
          <select
            value={patientFilter}
            onChange={(e) => {
              setPatientFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary max-w-[220px]"
          >
            <option value="">{t("all_patients") || "All Patients"}</option>
            {patientsList.map((p: any) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.mobile || p.phone || "No phone"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-3">{t("token_order")}</th>
                <th className="px-5 py-3">{t("patient_name")}</th>
                <th className="px-5 py-3">{t("ordered_tests")}</th>
                <th className="px-5 py-3">{t("payment_status") || "Billing / Payment"}</th>
                <th className="px-5 py-3">{t("order_status") || "Status"}</th>
                <th className="px-5 py-3 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoadingOrders ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    <span>Loading test orders...</span>
                  </td>
                </tr>
              ) : testOrders.length > 0 ? (
                testOrders.map((ord: any) => {
                  const hasDue =
                    (ord.dueAmount && ord.dueAmount > 0) ||
                    (ord.paymentStatus && ord.paymentStatus !== "PAID")
                  return (
                    <tr key={ord._id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-primary text-base">
                            #{ord.tokenNumber || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {ord.orderNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">
                          {ord.patient?.name || "Patient"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ord.patient?.mobile || ord.patient?.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1.5 max-w-xs">
                          {ord.items?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs gap-2 p-1 rounded-lg bg-muted/40 border"
                            >
                              <span className="font-medium truncate">
                                {item.testName}
                              </span>
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleUpdateItemStatus(
                                    ord._id,
                                    idx,
                                    e.target.value
                                  )
                                }
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border focus:outline-none ${
                                  item.status === "APPROVED"
                                    ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/30"
                                    : item.status === "REPORT_READY"
                                    ? "bg-blue-500/20 text-blue-700 border-blue-500/30"
                                    : item.status === "PROCESSING"
                                    ? "bg-indigo-500/20 text-indigo-700 border-indigo-500/30"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <option value="ORDERED">ORDERED</option>
                                <option value="SAMPLE_COLLECTED">COLLECTED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="REPORT_READY">READY</option>
                                <option value="APPROVED">APPROVED</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              hasDue
                                ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}
                          >
                            {hasDue
                              ? `Due: ৳${ord.dueAmount || ord.price || 0}`
                              : "Paid in Full"}
                          </span>
                          {hasDue && (
                            <button
                              onClick={() =>
                                setSelectedPatientForPayment(ord.patient)
                              }
                              className="block text-[11px] font-bold text-primary hover:underline mt-1"
                            >
                              Collect Due
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            ord.status === "REPORT_READY" ||
                            ord.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-600"
                              : ord.status === "PROCESSING"
                              ? "bg-indigo-500/20 text-indigo-600"
                              : "bg-amber-500/20 text-amber-600"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReport(ord)}
                            className={`px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1 text-xs font-semibold ${
                              hasDue
                                ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                            title={
                              hasDue
                                ? `Due Payment of ৳${ord.dueAmount} required to view report`
                                : t("view_report")
                            }
                          >
                            {hasDue ? (
                              <Lock className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 text-primary" />
                            )}
                            <span className="hidden sm:inline">
                              {hasDue ? "Locked" : t("view_report")}
                            </span>
                          </button>
                          <button
                            onClick={() => setSelectedReceipt(ord)}
                            className="px-2.5 py-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-xs font-semibold"
                            title={t("print_invoice")}
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              {t("print_invoice")}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    {t("no_test_orders")}
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
            {Math.min(page * limit, total)} of {total} test orders
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

      {/* MODAL 1: CREATE WALK-IN TEST ORDER (WITH RHF + ZOD) */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              {t("walkin_order_title")}
            </h2>

            <form onSubmit={handleSubmit(onConfirmCreateOrder)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("select_patient")} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("patient")}
                  className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.patient ? "border-red-500" : ""
                  }`}
                >
                  <option value="">{t("choose_patient")}</option>
                  {patientsList.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.mobile || p.phone} ({p.gender || "N/A"})
                    </option>
                  ))}
                </select>
                {errors.patient && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.patient.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("referring_doctor")}
                </label>
                <input
                  type="text"
                  placeholder="Dr. Self / Walk-in"
                  {...register("referringDoctorName")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Investigation / Test Catalog Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold">
                    {t("choose_investigations")} <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedTestIds.length} Selected
                  </span>
                </div>

                <div className="border rounded-2xl p-2.5 max-h-48 overflow-y-auto space-y-1 bg-muted/20">
                  {catalog.map((c) => {
                    const isSelected = selectedTestIds.includes(c._id)
                    return (
                      <div
                        key={c._id}
                        onClick={() => handleToggleTest(c._id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "hover:bg-muted/50 bg-card text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded pointer-events-none"
                          />
                          <span>{c.name}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({c.category})
                          </span>
                        </div>
                        <span className="font-mono">৳{c.price}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Total and Initial Payment */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-3">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{t("total_payable")}:</span>
                  <span className="text-primary text-base font-mono">
                    ৳{totalPrice.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("initial_payment_collected") || "Initial Payment Collected (৳)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`e.g. ${totalPrice} for full payment`}
                    {...register("paidAmount", { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Leave blank or enter full amount for 100% paid receipt.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreating || selectedTestIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition flex items-center gap-1.5"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("confirm_order_print_token")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INVOICE / RECEIPT PRINT PREVIEW (A4 & POS) */}
      <InvoicePrintModal
        open={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        data={
          selectedReceipt
            ? {
                invoiceNumber: selectedReceipt.orderNumber || "TO-COUNTER",
                date: selectedReceipt.createdAt || new Date(),
                patient: {
                  name: selectedReceipt.patient?.name || "Walk-in Patient",
                  mobile: selectedReceipt.patient?.mobile || "N/A",
                },
                doctor: {
                  name:
                    selectedReceipt.doctor?.name ||
                    selectedReceipt.referringDoctorName ||
                    "Direct Walk-in",
                },
                lineItems: (selectedReceipt.items || []).map((itm: any) => ({
                  serviceName: itm.testName,
                  category: "Diagnostic Test",
                  quantity: 1,
                  unitPrice: itm.price,
                  total: itm.price,
                })),
                subtotal: (selectedReceipt.items || []).reduce(
                  (s: number, itm: any) => s + itm.price,
                  0
                ),
                grandTotal: (selectedReceipt.items || []).reduce(
                  (s: number, itm: any) => s + itm.price,
                  0
                ),
                paidAmount:
                  typeof selectedReceipt.paidAmount === "number"
                    ? selectedReceipt.paidAmount
                    : (selectedReceipt.items || []).reduce(
                        (s: number, itm: any) => s + itm.price,
                        0
                      ),
                dueAmount: selectedReceipt.dueAmount || 0,
                paymentMethod: "CASH / POS",
              }
            : null
        }
      />

      {/* MODAL 3: DIAGNOSTIC LAB REPORT PRINT PREVIEW (A4 & PDF) */}
      <ReportPrintModal
        open={Boolean(selectedReportForPrint)}
        onClose={() => setSelectedReportForPrint(null)}
        data={selectedReportForPrint}
      />

      {/* MODAL 4: COLLECT PAYMENT MODAL FOR PATIENT */}
      <CollectPaymentModal
        isOpen={Boolean(selectedPatientForPayment)}
        onClose={() => {
          setSelectedPatientForPayment(null)
          refetch()
        }}
        patient={selectedPatientForPayment}
      />
    </div>
  )
}
