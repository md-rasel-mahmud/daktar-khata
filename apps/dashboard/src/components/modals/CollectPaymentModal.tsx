import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
} from "lucide-react"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import {
  useGetPatientInvoicesQuery,
  useRecordInvoicePaymentMutation,
  useCreateInvoiceMutation,
} from "@/lib/store/api/services/patient.service"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Please select an invoice"),
  amount: z.number().min(1, "Payment amount must be greater than 0"),
  method: z.enum(["CASH", "BKASH", "NAGAD", "CARD", "BANK_TRANSFER"]),
  transactionId: z.string().trim().optional(),
  note: z.string().trim().optional(),
})

export type PaymentFormData = z.infer<typeof paymentSchema>

interface CollectPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  patient: {
    _id: string
    id?: string
    name: string
    phone?: string
    mobile?: string
  } | null
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { t } = useTranslation()
  const patientId = patient?._id || patient?.id || ""

  const { data: invoices = [], isLoading: isLoadingInvoices, refetch } =
    useGetPatientInvoicesQuery(patientId, { skip: !patientId || !isOpen })

  const [recordPayment, { isLoading: isSubmitting }] =
    useRecordInvoicePaymentMutation()
  const [createInvoice, { isLoading: isCreatingInvoice }] =
    useCreateInvoiceMutation()

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")
  const [isQuickBillOpen, setIsQuickBillOpen] = useState(false)
  const [quickServiceName, setQuickServiceName] = useState("Doctor Consultation / Hospital Service")
  const [quickAmount, setQuickAmount] = useState<number>(500)
  const [quickMethod, setQuickMethod] = useState<"CASH" | "BKASH" | "NAGAD" | "CARD" | "BANK_TRANSFER">("CASH")

  const activeInvoices = invoices.filter(
    (inv: any) => inv.status !== "CANCELLED" && inv.status !== "REFUNDED"
  )

  const selectedInvoice = activeInvoices.find(
    (inv: any) => (inv._id || inv.id) === selectedInvoiceId
  )

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      method: "CASH",
      transactionId: "",
      note: "",
    },
  })

  // When user selects an invoice, default the amount to dueAmount
  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id)
    setValue("invoiceId", id)
    const inv = activeInvoices.find((i: any) => (i._id || i.id) === id)
    if (inv) {
      setValue("amount", inv.dueAmount > 0 ? inv.dueAmount : inv.grandTotal)
    }
  }

  if (!isOpen || !patient) return null

  const onSubmit = async (data: PaymentFormData) => {
    try {
      if (selectedInvoice && data.amount > selectedInvoice.dueAmount && selectedInvoice.dueAmount > 0) {
        toast.error(`Payment amount cannot exceed due amount of ৳${selectedInvoice.dueAmount}`)
        return
      }

      await recordPayment({
        invoiceId: data.invoiceId,
        body: {
          amount: data.amount,
          method: data.method,
          transactionId: data.transactionId?.trim() || undefined,
          note: data.note?.trim() || "Payment collected by merchant",
        },
      }).unwrap()

      toast.success(t("payment_recorded_success") || "Payment recorded successfully!")
      refetch()
      reset()
      setSelectedInvoiceId("")
      onClose()
    } catch (err: any) {
      toast.error(err?.data?.message || t("payment_failed") || "Failed to record payment")
    }
  }

  const handleQuickCreateAndPay = async () => {
    if (!patientId) return
    if (quickAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      await createInvoice({
        patient: patientId,
        lineItems: [
          {
            serviceName: quickServiceName.trim() || "Doctor Consultation / Hospital Service",
            category: "SERVICE",
            quantity: 1,
            unitPrice: quickAmount,
          },
        ],
        paidAmount: quickAmount,
        paymentMethod: quickMethod,
        notes: "Direct payment collected by merchant",
      }).unwrap()

      toast.success("Invoice created and payment recorded successfully!")
      refetch()
      onClose()
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create invoice")
    }
  }

  const handleClose = () => {
    reset()
    setSelectedInvoiceId("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-none">
                {t("collect_payment") || "Collect Patient Payment"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {patient.name} ({patient.phone || patient.mobile || "N/A"})
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

        {/* Invoice list for patient */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2">
              {t("select_invoice_to_pay") || "Select Patient Invoice"}
            </label>
            {isLoadingInvoices ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading invoices...</span>
              </div>
            ) : activeInvoices.length === 0 ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-muted/40 border text-center text-xs text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                  No unpaid or active invoices found for this patient.
                </div>

                {/* Direct payment / Quick invoice card */}
                <div className="p-4 rounded-2xl border bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      Create Direct Invoice & Collect Payment
                    </span>
                    <Badge variant="outline" className="text-[10px]">Instant</Badge>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Service / Bill Description
                    </label>
                    <input
                      type="text"
                      value={quickServiceName}
                      onChange={(e) => setQuickServiceName(e.target.value)}
                      placeholder="Doctor Consultation / Inpatient Service"
                      className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Amount (৳)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        Payment Method
                      </label>
                      <select
                        value={quickMethod}
                        onChange={(e: any) => setQuickMethod(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="CASH">Cash</option>
                        <option value="BKASH">bKash</option>
                        <option value="NAGAD">Nagad</option>
                        <option value="CARD">Card</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={isCreatingInvoice || quickAmount <= 0}
                    onClick={handleQuickCreateAndPay}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow"
                  >
                    {isCreatingInvoice ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Generate Invoice & Collect ৳{quickAmount}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeInvoices.map((inv: any) => {
                  const invId = inv._id || inv.id
                  const isSelected = selectedInvoiceId === invId
                  return (
                    <div
                      key={invId}
                      onClick={() => handleSelectInvoice(invId)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500"
                          : "hover:bg-muted/40 bg-card"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm text-foreground">
                            {inv.invoiceNumber}
                          </span>
                          <Badge
                            variant={
                              inv.status === "PAID"
                                ? "outline"
                                : inv.status === "PARTIALLY_PAID"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          Total: ৳{inv.grandTotal}
                        </div>
                        <div
                          className={`text-xs font-bold ${
                            inv.dueAmount > 0 ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          Due: ৳{inv.dueAmount}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {errors.invoiceId && (
              <p className="text-xs text-red-500 mt-1">{errors.invoiceId.message}</p>
            )}
          </div>

          {/* Payment Form */}
          {selectedInvoice && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("payment_amount") || "Amount (৳)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 500"
                    {...register("amount", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.amount ? "border-red-500 ring-1 ring-red-500" : ""
                    }`}
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Remaining Due: ৳{selectedInvoice.dueAmount}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("payment_method") || "Payment Method"}
                  </label>
                  <select
                    {...register("method")}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("transaction_id_ref") || "Transaction ID / Reference (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-9482718"
                  {...register("transactionId")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("notes") || "Payment Notes (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received at reception counter"
                  {...register("note")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-xl"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting
                    ? t("processing") || "Processing..."
                    : t("confirm_payment") || "Confirm Payment"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
