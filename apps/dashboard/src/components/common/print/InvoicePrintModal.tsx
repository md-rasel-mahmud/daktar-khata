import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { printHtmlDocument, downloadDocumentAsPdf } from "./print-service"
import {
  Printer,
  Download,
  X,
  Receipt,
  Building,
  User,
  CreditCard,
  CheckCircle2,
} from "lucide-react"

export interface InvoiceLineItem {
  serviceName: string
  category?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoicePrintData {
  invoiceNumber: string
  date: string | Date
  dueDate?: string | Date
  status?: string
  clinicName?: string
  clinicAddress?: string
  clinicPhone?: string
  patient?: {
    name?: string
    mobile?: string
    gender?: string
    age?: number | string
    address?: string
    ward?: string
    room?: string
    bedNumber?: string
  } | null
  doctor?: {
    name?: string
    specialization?: string
  } | null
  lineItems: InvoiceLineItem[]
  subtotal: number
  totalDiscount?: number
  totalTax?: number
  grandTotal: number
  paidAmount: number
  dueAmount: number
  paymentMethod?: string
  notes?: string
}

interface InvoicePrintModalProps {
  open: boolean
  onClose: () => void
  data: InvoicePrintData | null
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const { t } = useTranslation()
  const [printMode, setPrintMode] = useState<"A4" | "POS">("A4")

  if (!open || !data) return null

  const clinicName = data.clinicName || "Daktar Khata Hospital & Diagnostic Complex"
  const clinicAddress = data.clinicAddress || "Dhaka, Bangladesh"
  const clinicPhone = data.clinicPhone || "+880 1700-000000"
  const invNo = data.invoiceNumber || "INV-0001"
  const formattedDate = data.date ? format(new Date(data.date), "dd MMM yyyy") : "—"
  const patientName = data.patient?.name || "Cash Customer"
  const patientMobile = data.patient?.mobile || "N/A"
  const isPaid = data.dueAmount <= 0

  const generateA4Html = () => `
    <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 900; color: #0284c7; margin: 0; text-transform: uppercase;">${clinicName}</h1>
          <p style="font-size: 11px; color: #475569; margin: 2px 0;">${clinicAddress} | Phone: ${clinicPhone}</p>
          <p style="font-size: 11px; color: #0f172a; font-weight: 700; margin-top: 6px;">BILLING INVOICE & MONEY RECEIPT</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: 900; color: #0f172a;">#${invNo}</div>
          <div style="font-size: 11px; color: #475569;"><b>Date:</b> ${formattedDate}</div>
          <div style="margin-top: 6px;">
            <span style="display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; ${
              isPaid
                ? "background: #dcfce7; color: #15803d; border: 1px solid #86efac;"
                : "background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;"
            }">
              ${isPaid ? "FULL PAID" : `DUE: ৳${data.dueAmount.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      <!-- Patient & Doctor Info Box -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Patient Information</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${patientName}</div>
          <div style="font-size: 11px; color: #475569;">Phone: ${patientMobile}</div>
          ${
            data.patient?.ward || data.patient?.bedNumber
              ? `<div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 2px;">
                  Ward: ${data.patient?.ward || "General"} | Bed: #${data.patient?.bedNumber || "N/A"}
                </div>`
              : ""
          }
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Consultant / Doctor</div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${data.doctor?.name || "Hospital Medical Staff"}</div>
          <div style="font-size: 11px; color: #475569;">${data.doctor?.specialization || "Clinical Consultation"}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Payment: ${data.paymentMethod || "CASH / POS"}</div>
        </div>
      </div>

      <!-- Line Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff;">
            <th style="padding: 8px 10px; text-align: center; width: 40px; font-size: 11px;">#</th>
            <th style="padding: 8px 10px; text-align: left; font-size: 11px;">Service / Item Description</th>
            <th style="padding: 8px 10px; text-align: center; width: 100px; font-size: 11px;">Category</th>
            <th style="padding: 8px 10px; text-align: center; width: 60px; font-size: 11px;">Qty</th>
            <th style="padding: 8px 10px; text-align: right; width: 100px; font-size: 11px;">Rate (BDT)</th>
            <th style="padding: 8px 10px; text-align: right; width: 110px; font-size: 11px;">Total (BDT)</th>
          </tr>
        </thead>
        <tbody>
          ${data.lineItems
            .map(
              (item, i) => `
            <tr style="border-bottom: 1px solid #e2e8f0; ${i % 2 === 1 ? "background: #f8fafc;" : ""}">
              <td style="padding: 8px 10px; text-align: center; font-size: 11px; color: #64748b;">${i + 1}</td>
              <td style="padding: 8px 10px; font-size: 12px; font-weight: 600; color: #0f172a;">${item.serviceName}</td>
              <td style="padding: 8px 10px; text-align: center; font-size: 11px; color: #64748b;">${item.category || "Service"}</td>
              <td style="padding: 8px 10px; text-align: center; font-size: 12px;">${item.quantity}</td>
              <td style="padding: 8px 10px; text-align: right; font-size: 12px;">৳${item.unitPrice.toLocaleString()}</td>
              <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 700; color: #0f172a;">৳${item.total.toLocaleString()}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <!-- Calculation Totals Box -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
        <div style="width: 280px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #e2e8f0;">
            <span style="color: #64748b;">Subtotal:</span>
            <span style="font-weight: 600;">৳${data.subtotal.toLocaleString()}</span>
          </div>
          ${
            data.totalDiscount
              ? `
            <div style="display: flex; justify-content: space-between; padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #64748b;">Discount:</span>
              <span style="color: #dc2626; font-weight: 600;">- ৳${data.totalDiscount.toLocaleString()}</span>
            </div>
          `
              : ""
          }
          ${
            data.totalTax
              ? `
            <div style="display: flex; justify-content: space-between; padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #64748b;">Tax / VAT:</span>
              <span style="font-weight: 600;">+ ৳${data.totalTax.toLocaleString()}</span>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; padding: 8px 12px; font-size: 13px; font-weight: 900; background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
            <span>Grand Total:</span>
            <span>৳${data.grandTotal.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #e2e8f0; color: #15803d;">
            <span>Paid Amount:</span>
            <span style="font-weight: 700;">৳${data.paidAmount.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 12px; font-size: 12px; font-weight: 800; background: ${
            data.dueAmount > 0 ? "#fef2f2" : "#f0fdf4"
          }; color: ${data.dueAmount > 0 ? "#b91c1c" : "#15803d"};">
            <span>Net Due:</span>
            <span>৳${data.dueAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Notes / Notice -->
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 8px 12px; font-size: 10px; color: #64748b; margin-bottom: 40px;">
        <div><b>Terms & Notice:</b> All medicines and consumable charges are billed as per hospital policy. This invoice is automatically computer generated and serves as an official money receipt.</div>
      </div>

      <!-- Signatures -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px;">
        <div style="text-align: center; width: 160px;">
          <div style="border-top: 1px solid #64748b; margin-bottom: 4px;"></div>
          <div style="font-size: 11px; font-weight: 700; color: #334155;">Customer / Patient</div>
        </div>
        <div style="text-align: center; width: 160px;">
          <div style="border-top: 1px solid #64748b; margin-bottom: 4px;"></div>
          <div style="font-size: 11px; font-weight: 700; color: #334155;">Accounts In-Charge</div>
        </div>
      </div>
    </div>
  `

  const generatePOSHtml = () => `
    <div style="text-align: center; font-family: monospace, sans-serif; padding: 4px; color: #000;">
      <h2 style="font-size: 15px; font-weight: 900; margin: 0;">${clinicName}</h2>
      <p style="font-size: 10px; margin: 2px 0;">${clinicAddress}</p>
      <p style="font-size: 10px; margin: 0 0 6px 0;">Phone: ${clinicPhone}</p>
      <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>

      <div style="font-size: 12px; font-weight: 800;">MONEY RECEIPT</div>
      <div style="font-size: 11px; margin: 2px 0;"><b>Invoice:</b> #${invNo}</div>
      <div style="font-size: 10px;"><b>Date:</b> ${formattedDate}</div>

      <div style="text-align: left; font-size: 11px; margin-top: 6px;">
        <div><b>Patient:</b> ${patientName}</div>
        <div><b>Mobile:</b> ${patientMobile}</div>
      </div>

      <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>

      <!-- Items List -->
      <table style="width: 100%; font-size: 11px; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px dashed #000;">
            <th style="padding: 2px 0;">Item</th>
            <th style="padding: 2px 0; text-align: center;">Qty</th>
            <th style="padding: 2px 0; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.lineItems
            .map(
              (item) => `
            <tr>
              <td style="padding: 3px 0;">${item.serviceName}</td>
              <td style="padding: 3px 0; text-align: center;">${item.quantity}</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 700;">৳${item.total}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>

      <!-- Totals -->
      <div style="text-align: right; font-size: 11px; line-height: 1.5;">
        <div>Subtotal: ৳${data.subtotal.toLocaleString()}</div>
        ${data.totalDiscount ? `<div>Discount: -৳${data.totalDiscount.toLocaleString()}</div>` : ""}
        <div style="font-size: 13px; font-weight: 900; margin: 2px 0;">TOTAL: ৳${data.grandTotal.toLocaleString()}</div>
        <div>Paid: ৳${data.paidAmount.toLocaleString()}</div>
        <div style="font-weight: 800; font-size: 12px;">DUE: ৳${data.dueAmount.toLocaleString()}</div>
      </div>

      <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
      <p style="font-size: 10px;">Please preserve this receipt for discharge & claims.</p>
      <p style="font-size: 9px; margin-top: 2px;">Thank you for your visit!</p>
    </div>
  `

  const handlePrint = () => {
    const htmlContent = printMode === "POS" ? generatePOSHtml() : generateA4Html()
    printHtmlDocument({
      title: `Invoice-${invNo}-${patientName}`,
      mode: printMode,
      htmlContent,
    })
  }

  const handleDownloadPdf = () => {
    const htmlContent = generateA4Html()
    downloadDocumentAsPdf({
      title: `Invoice-${invNo}-${patientName}.pdf`,
      mode: "A4",
      htmlContent,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t("print_invoice")}</h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-muted p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPrintMode("A4")}
              className={`px-3 py-1.5 rounded-lg transition ${
                printMode === "A4"
                  ? "bg-card text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📄 {t("print_a4")}
            </button>
            <button
              onClick={() => setPrintMode("POS")}
              className={`px-3 py-1.5 rounded-lg transition ${
                printMode === "POS"
                  ? "bg-card text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🧾 {t("print_pos")}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/40 rounded-2xl border flex justify-center">
          {printMode === "A4" ? (
            <div
              className="bg-white text-slate-900 p-6 rounded-xl shadow-lg border w-full max-w-lg text-xs"
              dangerouslySetInnerHTML={{ __html: generateA4Html() }}
            />
          ) : (
            <div
              className="bg-white text-slate-900 p-4 rounded-xl shadow-lg border w-[280px] text-xs"
              dangerouslySetInnerHTML={{ __html: generatePOSHtml() }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t mt-4">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border hover:bg-muted text-xs font-bold transition"
          >
            <Download className="h-4 w-4" />
            {t("download_pdf")}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border hover:bg-muted text-xs font-medium"
            >
              {t("close")}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 transition"
            >
              <Printer className="h-4 w-4" />
              {printMode === "POS" ? t("print_pos") : t("print_a4")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default InvoicePrintModal
