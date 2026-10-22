import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { printHtmlDocument, downloadDocumentAsPdf } from "./print-service"
import {
  Printer,
  Download,
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  FileText,
  Receipt,
  CheckCircle2,
} from "lucide-react"

export interface AppointmentPrintData {
  tokenNumber?: number | string
  appointmentDate: string | Date
  appointmentSlot?: string
  status: string
  reasonFor?: string
  problemDescription?: string
  fee?: number | string
  paymentStatus?: string
  paymentMethod?: string
  clinicName?: string
  clinicAddress?: string
  clinicPhone?: string
  doctor?: {
    name?: string
    designation?: string
    specialization?: string
    room?: string
    floor?: string
  } | null
  patient?: {
    name?: string
    mobile?: string
    gender?: string
    age?: number | string
    address?: string
  } | null
}

interface AppointmentPrintModalProps {
  open: boolean
  onClose: () => void
  data: AppointmentPrintData | null
}

export const AppointmentPrintModal: React.FC<AppointmentPrintModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const { t } = useTranslation()
  const [printMode, setPrintMode] = useState<"A4" | "POS">("A4")

  if (!open || !data) return null

  const clinicName = data.clinicName || "Daktar Khata Health System"
  const clinicAddress = data.clinicAddress || "Dhaka, Bangladesh"
  const clinicPhone = data.clinicPhone || "+880 1700-000000"
  const token = data.tokenNumber || "01"
  const formattedDate = data.appointmentDate
    ? format(new Date(data.appointmentDate), "dd MMM yyyy")
    : "—"
  const doctorName = data.doctor?.name || "Consultant Physician"
  const patientName = data.patient?.name || "Patient"
  const patientMobile = data.patient?.mobile || "N/A"
  const fee = data.fee ? `৳${data.fee}` : "৳500"

  const generateA4Html = () => `
    <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Letterhead -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <h1 style="font-size: 20px; font-weight: 800; color: #0284c7; margin: 0;">${clinicName}</h1>
          <p style="font-size: 11px; color: #475569; margin: 2px 0;">${clinicAddress} | Phone: ${clinicPhone}</p>
          <p style="font-size: 11px; color: #0369a1; font-weight: 600; margin-top: 4px;">OPD APPOINTMENT SLIP & SERIAL TOKEN</p>
        </div>
        <div style="text-align: right; background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 8px; padding: 6px 14px;">
          <div style="font-size: 10px; font-weight: 700; color: #0369a1; text-transform: uppercase;">Serial Token</div>
          <div style="font-size: 26px; font-weight: 900; color: #0284c7; line-height: 1.1;">#${token}</div>
        </div>
      </div>

      <!-- Doctor & Patient Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
        <!-- Doctor Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Doctor Information</div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${doctorName}</div>
          <div style="font-size: 11px; color: #475569;">${data.doctor?.designation || data.doctor?.specialization || "Specialist"}</div>
          <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 4px;">
            Chamber: ${data.doctor?.room || "Room 102"} ${data.doctor?.floor ? `(${data.doctor.floor})` : ""}
          </div>
        </div>

        <!-- Patient Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Patient Details</div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${patientName}</div>
          <div style="font-size: 11px; color: #475569;">Phone: ${patientMobile}</div>
          <div style="font-size: 11px; color: #475569;">
            ${data.patient?.gender ? `Gender: ${data.patient.gender}` : ""} ${data.patient?.age ? `| Age: ${data.patient.age}` : ""}
          </div>
        </div>
      </div>

      <!-- Schedule & Payment Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #cbd5e1;">
        <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
          <th style="padding: 6px 10px; text-align: left; font-size: 11px; color: #475569;">Appointment Date</th>
          <th style="padding: 6px 10px; text-align: left; font-size: 11px; color: #475569;">Time Slot</th>
          <th style="padding: 6px 10px; text-align: left; font-size: 11px; color: #475569;">Consultation Fee</th>
          <th style="padding: 6px 10px; text-align: left; font-size: 11px; color: #475569;">Payment Status</th>
          <th style="padding: 6px 10px; text-align: left; font-size: 11px; color: #475569;">Status</th>
        </tr>
        <tr>
          <td style="padding: 8px 10px; font-size: 12px; font-weight: 600;">${formattedDate}</td>
          <td style="padding: 8px 10px; font-size: 12px;">${data.appointmentSlot || "Scheduled Slot"}</td>
          <td style="padding: 8px 10px; font-size: 12px; font-weight: 700; color: #0f172a;">${fee}</td>
          <td style="padding: 8px 10px; font-size: 11px;"><span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 4px; font-weight: 700;">${data.paymentStatus || "PAID"}</span></td>
          <td style="padding: 8px 10px; font-size: 11px;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 700;">${data.status}</span></td>
        </tr>
      </table>

      ${
        data.reasonFor
          ? `
        <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Reason for Visit</div>
          <div style="font-size: 12px; color: #1e293b; margin-top: 2px;">${data.reasonFor}</div>
        </div>
      `
          : ""
      }

      <!-- Instructions -->
      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 10px 12px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 700; color: #92400e; margin-bottom: 4px;">Important Instructions:</div>
        <ul style="font-size: 11px; color: #b45309; margin: 0; padding-left: 18px; line-height: 1.4;">
          <li>Please arrive at the clinic counter 15 minutes before your scheduled slot.</li>
          <li>Carry your previous prescription, laboratory test reports, and discharge letters (if any).</li>
          <li>Live queue status can be checked on the clinic Waiting Area TV Display.</li>
        </ul>
      </div>

      <!-- Footer Signatures -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 16px; border-top: 1px dashed #cbd5e1;">
        <div style="font-size: 10px; color: #94a3b8;">
          <div>Generated on: ${format(new Date(), "dd-MMM-yyyy hh:mm a")}</div>
          <div>Valid for the scheduled date & session only.</div>
        </div>
        <div style="text-align: center; width: 180px;">
          <div style="border-top: 1px solid #334155; margin-bottom: 4px;"></div>
          <div style="font-size: 11px; font-weight: 700; color: #334155;">Authorized Receptionist</div>
          <div style="font-size: 9px; color: #64748b;">${clinicName}</div>
        </div>
      </div>
    </div>
  `

  const generatePOSHtml = () => `
    <div style="text-align: center; font-family: monospace, sans-serif; padding: 4px; color: #000;">
      <h2 style="font-size: 15px; font-weight: 900; margin: 0;">${clinicName}</h2>
      <p style="font-size: 10px; margin: 2px 0;">${clinicAddress}</p>
      <p style="font-size: 10px; margin: 0 0 6px 0;">Hotline: ${clinicPhone}</p>
      <div style="border-top: 1px dashed #000; margin: 6px 0;"></div>

      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase;">APPOINTMENT TOKEN</div>
      <div style="font-size: 32px; font-weight: 900; margin: 4px 0; border: 2px solid #000; padding: 4px 0; border-radius: 6px;">
        #${token}
      </div>

      <div style="text-align: left; font-size: 11px; margin-top: 8px;">
        <div><b>Date:</b> ${formattedDate}</div>
        <div><b>Slot:</b> ${data.appointmentSlot || "Regular"}</div>
        <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
        <div><b>Doctor:</b> ${doctorName}</div>
        <div><b>Chamber:</b> ${data.doctor?.room || "Room 102"}</div>
        <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
        <div><b>Patient:</b> ${patientName}</div>
        <div><b>Mobile:</b> ${patientMobile}</div>
        <div style="border-top: 1px dashed #000; margin: 5px 0;"></div>
        <div style="display: flex; justify-content: space-between;">
          <span><b>Fee:</b> ${fee}</span>
          <span><b>Status:</b> ${data.paymentStatus || "PAID"}</span>
        </div>
      </div>

      <div style="border-top: 1px dashed #000; margin: 8px 0;"></div>
      <p style="font-size: 10px;">Please watch the TV display for your serial call.</p>
      <p style="font-size: 9px; margin-top: 4px;">Thank you for choosing us!</p>
    </div>
  `

  const handlePrint = () => {
    const htmlContent = printMode === "POS" ? generatePOSHtml() : generateA4Html()
    printHtmlDocument({
      title: `Appointment-Token-${token}-${patientName}`,
      mode: printMode,
      htmlContent,
    })
  }

  const handleDownloadPdf = () => {
    // Generate clean A4 PDF
    const htmlContent = generateA4Html()
    downloadDocumentAsPdf({
      title: `Appointment-Token-${token}-${patientName}.pdf`,
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
            <h2 className="text-lg font-bold">{t("print_slip")}</h2>
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
export default AppointmentPrintModal
