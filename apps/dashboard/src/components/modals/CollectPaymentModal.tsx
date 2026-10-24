import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Percent,
  BadgePercent,
  Banknote,
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
  amount: z.number().min(0, "Payment amount cannot be negative"),
  discountType: z.enum(["FIXED", "PERCENTAGE"]),
  discountValue: z.number().min(0),
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
  const [quickServiceName, setQuickServiceName] = useState("Doctor Consultation / Hospital Service")
  const [quickAmount, setQuickAmount] = useState<number>(500)
  const [quickDiscountType, setQuickDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED")
  const [quickDiscountValue, setQuickDiscountValue] = useState<number>(0)
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
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      discountType: "FIXED",
      discountValue: 0,
      method: "CASH",
      transactionId: "",
      note: "",
    },
  })

  const watchedDiscountType = watch("discountType")
  const watchedDiscountValue = watch("discountValue") || 0

  // Calculation for existing invoice payment
  const currentInvoiceDue = selectedInvoice
    ? (typeof selectedInvoice.dueAmount === "number" && selectedInvoice.dueAmount > 0
        ? selectedInvoice.dueAmount
        : selectedInvoice.grandTotal)
    : 0

  const calculatedDiscountAmount =
    watchedDiscountType === "PERCENTAGE"
      ? Math.round(((currentInvoiceDue * Math.min(100, Math.max(0, watchedDiscountValue))) / 100) * 100) / 100
      : Math.min(currentInvoiceDue, Math.max(0, watchedDiscountValue))

  const netPayable = Math.max(0, currentInvoiceDue - calculatedDiscountAmount)

  // Calculations for quick direct invoice
  const quickDiscountAmount =
    quickDiscountType === "PERCENTAGE"
      ? Math.round(((quickAmount * Math.min(100, Math.max(0, quickDiscountValue))) / 100) * 100) / 100
      : Math.min(quickAmount, Math.max(0, quickDiscountValue))

  const quickNetPayable = Math.max(0, quickAmount - quickDiscountAmount)

  // When user selects an invoice, default the amount to netPayable and reset discount
  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id)
    setValue("invoiceId", id)
    setValue("discountType", "FIXED")
    setValue("discountValue", 0)
    const inv = activeInvoices.find((i: any) => (i._id || i.id) === id)
    if (inv) {
      const due = inv.dueAmount > 0 ? inv.dueAmount : inv.grandTotal
      setValue("amount", due)
    }
  }

  // Auto-update amount field when discount changes if amount was matching previous netPayable
  useEffect(() => {
    if (selectedInvoice) {
      setValue("amount", netPayable)
    }
  }, [calculatedDiscountAmount, netPayable, selectedInvoice, setValue])

  if (!isOpen || !patient) return null

  const onSubmit = async (data: PaymentFormData) => {
    try {
      if (selectedInvoice && data.amount > netPayable && netPayable > 0) {
        toast.error(
          `${t("payment_cannot_exceed_due") || "Payment amount cannot exceed payable amount of"} ৳${netPayable}`
        )
        return
      }

      await recordPayment({
        invoiceId: data.invoiceId,
        body: {
          amount: data.amount,
          discount: calculatedDiscountAmount > 0 ? calculatedDiscountAmount : undefined,
          discountType: "FIXED",
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
      toast.error(t("enter_valid_amount") || "Please enter a valid amount")
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
            discount: quickDiscountAmount,
          },
        ],
        invoiceDiscount: quickDiscountValue,
        invoiceDiscountType: quickDiscountType,
        paidAmount: quickNetPayable,
        paymentMethod: quickMethod,
        initialPayment: {
          amount: quickNetPayable,
          method: quickMethod,
          note: "Direct payment collected with discount",
        },
        notes: quickDiscountAmount > 0
          ? `Direct payment with ৳${quickDiscountAmount} discount`
          : "Direct payment collected by merchant",
      }).unwrap()

      toast.success(t("invoice_created_payment_recorded") || "Invoice created and payment recorded successfully!")
      refetch()
      onClose()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_create_invoice") || "Failed to create invoice")
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
                <span>{t("loading_invoices") || "Loading invoices..."}</span>
              </div>
            ) : activeInvoices.length === 0 ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-muted/40 border text-center text-xs text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                  {t("no_unpaid_invoices_found") || "No unpaid or active invoices found for this patient."}
                </div>

                {/* Direct payment / Quick invoice card with % and Fixed discount */}
                <div className="p-4 rounded-2xl border bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      {t("quick_bill_title") || "Create Direct Invoice & Collect Payment"}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{t("instant") || "Instant"}</Badge>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      {t("service_description") || "Service / Bill Description"}
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
                        {t("subtotal") || "Amount / Fee"} (৳)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        {t("payment_method") || "Payment Method"}
                      </label>
                      <select
                        value={quickMethod}
                        onChange={(e: any) => setQuickMethod(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="CASH">{t("cash") || "Cash"}</option>
                        <option value="BKASH">bKash</option>
                        <option value="NAGAD">Nagad</option>
                        <option value="CARD">{t("card") || "Card"}</option>
                        <option value="BANK_TRANSFER">{t("bank_transfer") || "Bank Transfer"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Discount Selection (% or Fixed) */}
                  <div className="p-2.5 rounded-xl bg-background border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[11px] flex items-center gap-1">
                        <Percent className="h-3.5 w-3.5 text-primary" />
                        {t("discount") || "Discount"}
                      </span>
                      <div className="flex bg-muted p-0.5 rounded-lg border text-[11px]">
                        <button
                          type="button"
                          onClick={() => setQuickDiscountType("FIXED")}
                          className={`px-2 py-0.5 rounded-md font-medium transition ${
                            quickDiscountType === "FIXED"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          ৳ {t("fixed") || "Fixed"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickDiscountType("PERCENTAGE")}
                          className={`px-2 py-0.5 rounded-md font-medium transition ${
                            quickDiscountType === "PERCENTAGE"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          % {t("percentage") || "Percent"}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={quickDiscountType === "PERCENTAGE" ? 100 : quickAmount}
                        step="0.01"
                        value={quickDiscountValue || ""}
                        onChange={(e) => setQuickDiscountValue(Math.max(0, Number(e.target.value)))}
                        placeholder={
                          quickDiscountType === "PERCENTAGE"
                            ? t("enter_discount_percentage") || "e.g. 10%"
                            : t("enter_discount_fixed") || "e.g. 100 ৳"
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                      />
                      {quickDiscountAmount > 0 && (
                        <div className="text-right whitespace-nowrap text-xs text-rose-600 font-semibold">
                          -৳{quickDiscountAmount.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed">
                      <span className="text-muted-foreground font-medium">
                        {t("net_payable") || "Net Payable"}:
                      </span>
                      <span className="font-bold text-sm text-primary font-mono">
                        ৳{quickNetPayable.toLocaleString()}
                      </span>
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
                    {t("generate_invoice_and_collect") || "Generate Invoice & Collect"} ৳{quickNetPayable.toLocaleString()}
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
                          {t("total") || "Total"}: ৳{inv.grandTotal}
                        </div>
                        <div
                          className={`text-xs font-bold ${
                            inv.dueAmount > 0 ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          {t("due") || "Due"}: ৳{inv.dueAmount}
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

          {/* Payment Form with Discount Options */}
          {selectedInvoice && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2 border-t">
              {/* Discount Section (% or Fixed) */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BadgePercent className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {t("give_discount") || "Apply Discount"}
                    </span>
                  </div>

                  {/* Toggle Type: Fixed or Percentage */}
                  <div className="flex bg-background p-0.5 rounded-lg border text-xs">
                    <button
                      type="button"
                      onClick={() => setValue("discountType", "FIXED")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        watchedDiscountType === "FIXED"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ৳ {t("fixed_amount") || "Fixed (৳)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("discountType", "PERCENTAGE")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        watchedDiscountType === "PERCENTAGE"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      % {t("percentage") || "Percent (%)"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                      {watchedDiscountType === "PERCENTAGE"
                        ? t("discount_percentage_label") || "Discount Percentage (%)"
                        : t("discount_fixed_label") || "Discount Amount (৳)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={watchedDiscountType === "PERCENTAGE" ? 100 : currentInvoiceDue}
                      placeholder={
                        watchedDiscountType === "PERCENTAGE"
                          ? t("enter_discount_percentage") || "e.g. 10"
                          : t("enter_discount_fixed") || "e.g. 100"
                      }
                      {...register("discountValue", { valueAsNumber: true })}
                      className="w-full px-3 py-1.5 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="text-right text-xs space-y-0.5">
                    <div className="text-muted-foreground">
                      {t("original_due") || "Original Due"}:{" "}
                      <span className="font-semibold text-foreground font-mono">
                        ৳{currentInvoiceDue.toLocaleString()}
                      </span>
                    </div>
                    {calculatedDiscountAmount > 0 && (
                      <div className="text-rose-600 font-semibold">
                        {t("discount_applied") || "Discount"}:{" "}
                        <span className="font-mono">-৳{calculatedDiscountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="font-bold text-emerald-600 text-sm">
                      {t("net_payable") || "Net Payable"}:{" "}
                      <span className="font-mono">৳{netPayable.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Amount & Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold">
                      {t("payment_amount") || "Amount to Collect (৳)"} <span className="text-red-500">*</span>
                    </label>
                    {netPayable > 0 && (
                      <button
                        type="button"
                        onClick={() => setValue("amount", netPayable)}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        {t("pay_full_due") || "Pay Full"} (৳{netPayable})
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={`e.g. ${netPayable}`}
                    {...register("amount", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.amount ? "border-red-500 ring-1 ring-red-500" : ""
                    }`}
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t("payable_after_discount") || "Payable after discount"}: ৳{netPayable}
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
                    <option value="CASH">{t("cash") || "Cash"}</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="CARD">{t("card") || "Debit / Credit Card"}</option>
                    <option value="BANK_TRANSFER">{t("bank_transfer") || "Bank Transfer"}</option>
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
                  {t("cancel") || "Cancel"}
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
