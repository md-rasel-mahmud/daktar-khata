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

export default function ManageDiagnostics() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<TestOrder | null>(null)

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
                      <button
                        onClick={() => setSelectedReceipt(ord)}
                        className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground"
                        title={t("print_receipt")}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
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

      {/* MODAL 2: RECEIPT / TOKEN PRINT PREVIEW */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="text-center pb-4 border-b">
              <h3 className="text-xl font-black text-slate-900">{t("receipt_header")}</h3>
              <p className="text-xs text-slate-500">{t("receipt_sub")}</p>
            </div>

            <div className="my-4 text-center p-4 rounded-2xl bg-slate-50 border">
              <span className="text-xs uppercase text-slate-500 font-bold">{t("waiting_token_number")}</span>
              <div className="text-5xl font-black text-indigo-600 my-1">
                #{selectedReceipt.tokenNumber ?? 1}
              </div>
              <div className="text-xs font-mono text-slate-600 font-semibold">
                {t("order_number_lbl")} {selectedReceipt.orderNumber}
              </div>
            </div>

            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">{t("patient_name")}:</span>
                <span className="font-bold">{selectedReceipt.patient?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t("referring_doctor_type")}:</span>
                <span className="font-medium">
                  {selectedReceipt.doctor?.name || selectedReceipt.referringDoctorName || "Direct Walk-in"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t("report_date")}:</span>
                <span>{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-3 space-y-1">
              <span className="text-xs font-bold text-slate-700 block mb-1">{t("test_details")}</span>
              {selectedReceipt.items?.map((itm, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{itm.testName}</span>
                  <span className="font-semibold">৳{itm.price}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>{t("final_charges")}:</span>
                <span>
                  ৳{selectedReceipt.items?.reduce((s, itm) => s + itm.price, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {t("close")}
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="h-4 w-4" />
                {t("print_receipt")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
