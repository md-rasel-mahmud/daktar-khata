import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { type RootState } from "@/lib/store/store"
import {
  useGetPatientInvoicesQuery,
  useRecordInvoicePaymentMutation,
} from "@/lib/store/api/services/patient.service"
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  X,
  Smartphone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const onlinePaymentSchema = z.object({
  method: z.enum(["BKASH", "NAGAD", "CARD", "BANK_TRANSFER"]),
  amount: z.number().min(1, "Amount must be at least ৳1"),
  phoneNumber: z
    .string()
    .trim()
    .min(11, "Mobile banking number must be at least 11 digits")
    .optional()
    .or(z.literal("")),
  transactionId: z.string().trim().min(3, "Transaction ID or OTP required"),
})

type OnlinePaymentFormData = z.infer<typeof onlinePaymentSchema>

export default function PatientInvoicesPage() {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.auth.user)
  const patientId = user?.user?._id || ""

  const { data: invoices = [], isLoading, refetch } = useGetPatientInvoicesQuery(
    patientId,
    { skip: !patientId }
  )

  const [recordPayment, { isLoading: isPaying }] = useRecordInvoicePaymentMutation()
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<OnlinePaymentFormData>({
    resolver: zodResolver(onlinePaymentSchema),
    defaultValues: {
      method: "BKASH",
      amount: 0,
      phoneNumber: user?.user?.phone || "",
      transactionId: "",
    },
  })

  const selectedMethod = watch("method")

  const handleOpenPay = (inv: any) => {
    setSelectedInvoice(inv)
    setValue("amount", inv.dueAmount > 0 ? inv.dueAmount : inv.grandTotal)
    setValue("phoneNumber", user?.user?.phone || "")
  }

  const handleClosePay = () => {
    setSelectedInvoice(null)
    reset()
  }

  const onSubmitPayment = async (data: OnlinePaymentFormData) => {
    if (!selectedInvoice) return
    try {
      if (data.amount > selectedInvoice.dueAmount && selectedInvoice.dueAmount > 0) {
        toast.error(`Amount exceeds remaining due of ৳${selectedInvoice.dueAmount}`)
        return
      }

      await recordPayment({
        invoiceId: selectedInvoice._id || selectedInvoice.id,
        body: {
          amount: data.amount,
          method: data.method,
          transactionId: `${data.method}-${data.transactionId.trim()}`,
          note: `Online payment by patient (${data.phoneNumber || "web"})`,
        },
      }).unwrap()

      toast.success(
        t("payment_success_reports_unlocked") ||
          "Payment completed successfully! Your reports are now unlocked."
      )
      refetch()
      handleClosePay()
    } catch (err: any) {
      toast.error(err?.data?.message || t("payment_failed") || "Online payment failed")
    }
  }

  const totalDue = invoices.reduce(
    (sum: number, inv: any) => sum + (inv.dueAmount || 0),
    0
  )
  const totalPaid = invoices.reduce(
    (sum: number, inv: any) => sum + (inv.paidAmount || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          {t("my_invoices_payments") || "My Invoices & Online Payments"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("patient_invoices_desc") ||
            "View clinical bills, settlement status, and pay dues instantly to access your test reports."}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>{t("total_invoices") || "Total Invoices"}</CardDescription>
            <CardTitle className="text-2xl font-bold">{invoices.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>{t("total_paid") || "Total Settled"}</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              ৳{totalPaid.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 font-semibold">
              {t("total_due") || "Outstanding Dues"}
            </CardDescription>
            <CardTitle
              className={`text-2xl font-bold ${
                totalDue > 0 ? "text-amber-600" : "text-slate-700"
              }`}
            >
              ৳{totalDue.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="rounded-2xl overflow-hidden shadow-sm border">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold">
            {t("billing_history") || "Invoice History & Receipts"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading your invoices...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-base mb-1">No Invoices Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You do not have any invoices or hospital dues recorded yet.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map((inv: any) => {
                const isPaid = inv.dueAmount === 0 || inv.status === "PAID"
                return (
                  <div
                    key={inv._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-foreground">
                          {inv.invoiceNumber}
                        </span>
                        <Badge
                          variant={
                            isPaid
                              ? "outline"
                              : inv.status === "PARTIALLY_PAID"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {isPaid ? "PAID" : inv.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(inv.issuedDate || inv.createdAt).toLocaleDateString()}
                        </span>
                        {inv.doctor?.name && (
                          <span>Doctor: {inv.doctor.name}</span>
                        )}
                        {inv.lineItems?.length > 0 && (
                          <span>
                            {inv.lineItems.length} Item(s):{" "}
                            {inv.lineItems[0]?.serviceName}
                            {inv.lineItems.length > 1 ? "..." : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-right">
                        <div className="font-semibold text-foreground text-sm">
                          Total: ৳{inv.grandTotal}
                        </div>
                        <div
                          className={`text-xs font-bold ${
                            inv.dueAmount > 0 ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          {inv.dueAmount > 0
                            ? `Due: ৳${inv.dueAmount}`
                            : "Fully Cleared"}
                        </div>
                      </div>

                      {inv.dueAmount > 0 ? (
                        <Button
                          onClick={() => handleOpenPay(inv)}
                          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 text-xs font-bold"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          {t("pay_online") || "Pay Online"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Cleared</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay Online Modal with RHF + Zod */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-none">
                    {t("pay_invoice_online") || "Online Payment"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoice #{selectedInvoice.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePay}
                className="p-1 rounded-full text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitPayment)} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("invoice_total") || "Invoice Total"}:</span>
                  <span className="font-semibold text-foreground">
                    ৳{selectedInvoice.grandTotal}
                  </span>
                </div>
                {selectedInvoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>{t("discount") || "Discount"}:</span>
                    <span className="font-semibold font-mono">
                      -৳{selectedInvoice.totalDiscount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("already_paid") || "Already Paid"}:</span>
                  <span className="font-semibold text-emerald-600">
                    ৳{selectedInvoice.paidAmount}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t text-sm font-bold">
                  <span>{t("net_payable") || "Payable Due"}:</span>
                  <span className="text-primary font-mono">
                    ৳{selectedInvoice.dueAmount}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  {t("select_gateway") || "Select Payment Method"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-semibold transition ${
                      selectedMethod === "BKASH"
                        ? "border-pink-500 bg-pink-500/10 text-pink-700 ring-1 ring-pink-500"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value="BKASH"
                      {...register("method")}
                      className="hidden"
                    />
                    <Smartphone className="h-4 w-4 text-pink-600" />
                    <span>bKash Payment</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-semibold transition ${
                      selectedMethod === "NAGAD"
                        ? "border-orange-500 bg-orange-500/10 text-orange-700 ring-1 ring-orange-500"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value="NAGAD"
                      {...register("method")}
                      className="hidden"
                    />
                    <Smartphone className="h-4 w-4 text-orange-600" />
                    <span>Nagad Payment</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-semibold transition ${
                      selectedMethod === "CARD"
                        ? "border-blue-500 bg-blue-500/10 text-blue-700 ring-1 ring-blue-500"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value="CARD"
                      {...register("method")}
                      className="hidden"
                    />
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Debit / Credit Card</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 text-xs font-semibold transition ${
                      selectedMethod === "BANK_TRANSFER"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      value="BANK_TRANSFER"
                      {...register("method")}
                      className="hidden"
                    />
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Bank Transfer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("payment_amount") || "Amount to Pay (৳)"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.amount ? "border-red-500 ring-1 ring-red-500" : ""
                  }`}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {selectedMethod === "CARD"
                    ? "Card / Mobile Number"
                    : "Mobile Banking Account Number"}
                </label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  {...register("phoneNumber")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("trx_id_or_otp") || "Transaction TrxID / OTP"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9J4K82L91"
                  {...register("transactionId")}
                  className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.transactionId ? "border-red-500 ring-1 ring-red-500" : ""
                  }`}
                />
                {errors.transactionId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.transactionId.message}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Enter your mobile banking transaction TrxID or gateway confirmation code.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClosePay}
                  disabled={isPaying}
                  className="rounded-xl"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isPaying}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center gap-1.5"
                >
                  {isPaying && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPaying ? t("processing") : t("complete_payment") || "Pay Now"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
