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
} from "lucide-react"
import {
  InvoicePrintModal,
  ReportPrintModal,
} from "@/components/common/print"

export default function ManageDiagnostics() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<TestOrder | null>(null)
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<any>(null)

  const [orderForm, setOrderForm] = useState({
    patient: "",
    referringDoctorName: "Self / Walk-in",
    selectedTests: [] as string[],
  })

  // Queries
  const { data: testOrders = [], isLoading: isLoadingOrders, refetch } = useGetTestOrdersQuery()
  const { data: catalog = [] } = useGetTestCatalogQuery()
  const { data: patientsData } = useGetPatientsQuery(undefined)
  const patientsList = Array.isArray(patientsData) ? patientsData : (patientsData as any)?.data || []

  const [createOrder, { isLoading: isCreating }] = useCreateTestOrderMutation()
  const [updateStatus] = useUpdateTestOrderItemStatusMutation()

  const handleToggleTest = (testId: string) => {
    setOrderForm((prev) => {
      const exists = prev.selectedTests.includes(testId)
      return {
        ...prev,
        selectedTests: exists
          ? prev.selectedTests.filter((id) => id !== testId)
          : [...prev.selectedTests, testId],
      }
    })
  }

  const selectedTestObjects = catalog.filter((c) => orderForm.selectedTests.includes(c._id))
  const totalPrice = selectedTestObjects.reduce((sum, item) => sum + item.price, 0)

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderForm.patient || orderForm.selectedTests.length === 0) {
      toast.error(t("select_patient_and_test"))
      return
    }

    try {
      const items = selectedTestObjects.map((tItem) => ({
        test: tItem._id,
        testName: tItem.name,
        price: tItem.price,
      }))

      const res = await createOrder({
        patient: orderForm.patient,
        referringDoctorName: orderForm.referringDoctorName || "Self / Walk-in",
        isWalkIn: true,
        items,
      }).unwrap()

      toast.success(t("walkin_order_success"))
      setIsOrderModalOpen(false)
      setSelectedReceipt(res)
      setOrderForm({
        patient: "",
        referringDoctorName: "Self / Walk-in",
        selectedTests: [],
      })
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("order_create_failed"))
    }
  }

  const handleUpdateItemStatus = async (orderId: string, itemIndex: number, nextStatus: string) => {
    try {
      await updateStatus({ id: orderId, itemIndex, status: nextStatus }).unwrap()
      toast.success(`${t("test_status_updated")}: ${nextStatus}`)
      refetch()
    } catch {
      toast.error(t("failed"))
    }
  }

  const filteredOrders = testOrders.filter((ord) => {
    const pName = ord.patient?.name?.toLowerCase() || ""
    const oNum = ord.orderNumber?.toLowerCase() || ""
    const term = search.toLowerCase()
    return pName.includes(term) || oNum.includes(term)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("diagnostics_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("diagnostics_desc")}</p>
        </div>

        <button
          onClick={() => setIsOrderModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
        >
          <Plus className="h-4 w-4" />
          {t("walkin_order_btn")}
        </button>
      </div>

      {/* Filter */}
      <div className="bg-card border rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_order_patient")}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Test Orders Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-3">{t("order_token")}</th>
                <th className="px-5 py-3">{t("patient_name")}</th>
                <th className="px-5 py-3">{t("referring_doctor_type")}</th>
                <th className="px-5 py-3">{t("test_items")}</th>
                <th className="px-5 py-3">{t("status")}</th>
                <th className="px-5 py-3 text-right">{t("receipt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">
                        {ord.orderNumber || "TO-PENDING"}
                      </div>
                      <div className="text-xs text-primary font-bold">
                        {t("token_lbl")} #{ord.tokenNumber ?? 1}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{ord.patient?.name}</div>
                      <div className="text-xs text-muted-foreground">{ord.patient?.mobile}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted">
                        {ord.doctor?.name || ord.referringDoctorName || "Direct Walk-in"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {ord.items?.map((itm, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{itm.testName} (৳{itm.price})</span>
                            <span className="text-muted-foreground">→</span>
                            <select
                              value={itm.status}
                              onChange={(e) =>
                                handleUpdateItemStatus(ord._id, idx, e.target.value)
                              }
                              className="px-2 py-0.5 rounded border bg-background text-[11px] font-semibold"
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
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          ord.status === "REPORT_READY" || ord.status === "APPROVED"
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
                          onClick={() =>
                            setSelectedReportForPrint({
                              reportNumber: ord.orderNumber ? `REP-${ord.orderNumber}` : "LAB-2026-001",
                              orderNumber: ord.tokenNumber ? `#${ord.tokenNumber}` : ord.orderNumber,
                              testName: ord.items?.[0]?.testName || "Diagnostic Investigation",
                              date: ord.createdAt || new Date(),
                              patient: {
                                name: ord.patient?.name || "Patient",
                                mobile: ord.patient?.mobile,
                                gender: ord.patient?.gender,
                                age: ord.patient?.age,
                              },
                              referringDoctor: {
                                name: ord.doctor?.name || ord.referringDoctorName || "Direct Walk-in",
                              },
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-xs font-semibold"
                          title={t("view_report")}
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span className="hidden sm:inline">{t("view_report")}</span>
                        </button>
                        <button
                          onClick={() => setSelectedReceipt(ord)}
                          className="px-2.5 py-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-xs font-semibold"
                          title={t("print_invoice")}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t("print_invoice")}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    {t("no_test_orders_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE TEST ORDER */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              {t("walkin_booking_modal")}
            </h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("select_patient_req")}</label>
                <select
                  required
                  value={orderForm.patient}
                  onChange={(e) => setOrderForm({ ...orderForm, patient: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("choose_patient")}</option>
                  {patientsList.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.mobile || p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("referring_doctor_optional")}
                </label>
                <input
                  type="text"
                  value={orderForm.referringDoctorName}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, referringDoctorName: e.target.value })
                  }
                  placeholder={t("referring_doctor_ph")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  {t("select_tests_req")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-2 border rounded-xl bg-muted/20">
                  {catalog.map((cat) => {
                    const isChecked = orderForm.selectedTests.includes(cat._id)
                    return (
                      <div
                        key={cat._id}
                        onClick={() => handleToggleTest(cat._id)}
                        className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition ${
                          isChecked
                            ? "bg-primary/10 border-primary text-foreground font-semibold"
                            : "bg-background border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="line-clamp-1">{cat.name}</span>
                        <span className="font-bold ml-2">৳{cat.price}</span>
                      </div>
                    )
                  })}
                  {catalog.length === 0 && (
                    <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
                      {t("no_tests_in_catalog")}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">{t("selected_tests_count")}</span>
                  <span className="ml-1 font-bold">{orderForm.selectedTests.length}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{t("total_bill_amount")}</span>
                  <span className="ml-2 text-xl font-black text-primary">
                    ৳{totalPrice.toLocaleString()}
                  </span>
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
                  disabled={isCreating || orderForm.selectedTests.length === 0}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
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
                lineItems: (selectedReceipt.items || []).map((itm) => ({
                  serviceName: itm.testName,
                  category: "Diagnostic Test",
                  quantity: 1,
                  unitPrice: itm.price,
                  total: itm.price,
                })),
                subtotal: (selectedReceipt.items || []).reduce((s, itm) => s + itm.price, 0),
                grandTotal: (selectedReceipt.items || []).reduce((s, itm) => s + itm.price, 0),
                paidAmount: (selectedReceipt.items || []).reduce((s, itm) => s + itm.price, 0),
                dueAmount: 0,
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
    </div>
  )
}

