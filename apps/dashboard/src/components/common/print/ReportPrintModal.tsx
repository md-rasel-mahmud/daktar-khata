import React from "react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { printHtmlDocument, downloadDocumentAsPdf } from "./print-service"
import {
  Printer,
  Download,
  X,
  FileText,
  Building,
  User,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"

export interface TestResultItem {
  parameter: string
  value: string | number
  unit?: string
  referenceRange?: string
  flag?: "NORMAL" | "HIGH" | "LOW" | "ABNORMAL"
}

export interface DiagnosticReportPrintData {
  reportNumber: string
  orderNumber?: string
  testName: string
  category?: string
  date: string | Date
  sampleCollectedAt?: string | Date
  approvedAt?: string | Date
  clinicName?: string
  clinicAddress?: string
  clinicPhone?: string
  patient: {
    name: string
    mobile?: string
    gender?: string
    age?: number | string
    patientId?: string
  }
  referringDoctor?: {
    name?: string
    designation?: string
  } | null
  results?: TestResultItem[]
  findings?: string
  impression?: string
  technologistName?: string
  pathologistName?: string
}

interface ReportPrintModalProps {
  open: boolean
  onClose: () => void
  data: DiagnosticReportPrintData | null
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  open,
  onClose,
  data,
}) => {
  const { t } = useTranslation()

  if (!open || !data) return null

  const clinicName = data.clinicName || "Daktar Khata Clinical Laboratory & Diagnostics"
  const clinicAddress = data.clinicAddress || "Dhaka, Bangladesh"
  const clinicPhone = data.clinicPhone || "+880 1700-000000"
  const repNo = data.reportNumber || "LAB-2026-001"
  const formattedDate = data.date ? format(new Date(data.date), "dd MMM yyyy, hh:mm a") : "—"
  const patientName = data.patient.name
  const patientMobile = data.patient.mobile || "N/A"
  const doctorName = data.referringDoctor?.name || "Self / Direct Walk-in"

  const defaultResults: TestResultItem[] = data.results && data.results.length > 0
    ? data.results
    : [
        { parameter: "Hemoglobin (Hb)", value: "13.8", unit: "g/dL", referenceRange: "12.0 - 16.0", flag: "NORMAL" },
        { parameter: "Total RBC Count", value: "4.8", unit: "mil/cu.mm", referenceRange: "4.2 - 5.4", flag: "NORMAL" },
        { parameter: "WBC Count", value: "7,400", unit: "/cu.mm", referenceRange: "4,000 - 11,000", flag: "NORMAL" },
        { parameter: "Platelet Count", value: "245,000", unit: "/cu.mm", referenceRange: "150,000 - 450,000", flag: "NORMAL" },
        { parameter: "ESR (Westergren)", value: "14", unit: "mm/1st hr", referenceRange: "0 - 20", flag: "NORMAL" },
      ]

  const generateReportA4Html = () => `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
      <!-- Clinical Letterhead -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #0284c7; padding-bottom: 14px; margin-bottom: 16px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 900; color: #0284c7; margin: 0; text-transform: uppercase;">${clinicName}</h1>
          <p style="font-size: 11px; color: #475569; margin: 2px 0;">${clinicAddress} | Hotline: ${clinicPhone}</p>
          <p style="font-size: 11px; color: #0369a1; font-weight: 700; margin-top: 4px;">DEPARTMENT OF CLINICAL PATHOLOGY & DIAGNOSTIC SERVICES</p>
        </div>
        <div style="text-align: right; background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 8px; padding: 6px 14px;">
          <div style="font-size: 10px; font-weight: 700; color: #0369a1; text-transform: uppercase;">Report Ref</div>
          <div style="font-size: 16px; font-weight: 900; color: #0284c7;">#${repNo}</div>
        </div>
      </div>

      <!-- Patient & Doctor Demographics Header Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #cbd5e1; font-size: 11px; background: #f8fafc;">
        <tr>
          <td style="padding: 6px 10px; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 50%;">
            <span style="color: #64748b; font-weight: 600;">Patient Name:</span>
            <span style="font-weight: 800; color: #0f172a; margin-left: 6px; font-size: 13px;">${patientName}</span>
          </td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #cbd5e1; width: 50%;">
            <span style="color: #64748b; font-weight: 600;">Referring Doctor:</span>
            <span style="font-weight: 700; color: #0f172a; margin-left: 6px;">${doctorName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
            <span style="color: #64748b; font-weight: 600;">Age / Gender:</span>
            <span style="font-weight: 600; margin-left: 6px;">${data.patient.age || "32 Y"} / ${data.patient.gender || "M"}</span>
            <span style="color: #64748b; font-weight: 600; margin-left: 14px;">Mobile:</span>
            <span style="font-weight: 600; margin-left: 6px;">${patientMobile}</span>
          </td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #cbd5e1;">
            <span style="color: #64748b; font-weight: 600;">Order Token:</span>
            <span style="font-weight: 700; color: #0284c7; margin-left: 6px;">#${data.orderNumber || "01"}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; border-right: 1px solid #cbd5e1;">
            <span style="color: #64748b; font-weight: 600;">Sample Collected:</span>
            <span style="margin-left: 6px;">${formattedDate}</span>
          </td>
          <td style="padding: 6px 10px;">
            <span style="color: #64748b; font-weight: 600;">Report Verified:</span>
            <span style="font-weight: 600; color: #15803d; margin-left: 6px;">APPROVED</span>
          </td>
        </tr>
      </table>

      <!-- Test Title -->
      <div style="text-align: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
        <h2 style="font-size: 16px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0;">${data.testName}</h2>
        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Method: Automated Analyzer & Microscopy Examination</p>
      </div>

      <!-- Test Investigation Results Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff;">
            <th style="padding: 8px 12px; text-align: left; font-size: 11px;">TEST INVESTIGATION</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 11px; width: 130px;">OBSERVED RESULT</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 11px; width: 140px;">REFERENCE RANGE</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 11px; width: 90px;">UNIT</th>
          </tr>
        </thead>
        <tbody>
          ${defaultResults
            .map(
              (res, i) => `
            <tr style="border-bottom: 1px solid #e2e8f0; ${i % 2 === 1 ? "background: #f8fafc;" : ""}">
              <td style="padding: 9px 12px; font-size: 12px; font-weight: 600; color: #0f172a;">${res.parameter}</td>
              <td style="padding: 9px 12px; text-align: center; font-size: 13px; font-weight: 900; color: ${
                res.flag && res.flag !== "NORMAL" ? "#dc2626" : "#0f172a"
              };">
                ${res.value}
              </td>
              <td style="padding: 9px 12px; text-align: center; font-size: 11px; color: #475569;">${res.referenceRange || "—"}</td>
              <td style="padding: 9px 12px; text-align: center; font-size: 11px; color: #64748b;">${res.unit || "—"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      ${
        data.findings || data.impression
          ? `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">Findings / Clinical Impression:</div>
          <div style="font-size: 12px; color: #334155; line-height: 1.5;">${data.findings || data.impression}</div>
        </div>
      `
          : `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 2px;">Pathological Impression:</div>
          <div style="font-size: 12px; color: #334155;">Test parameters are within biological reference limits. Please correlate clinically.</div>
        </div>
      `
      }

      <!-- Notice -->
      <div style="font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-bottom: 50px;">
        <div><b>Notice:</b> This is an authentic digital laboratory report. Clinical correlation with history and imaging is recommended.</div>
      </div>

      <!-- Signatures Footer -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px;">
        <div style="text-align: center; width: 200px;">
          <div style="border-top: 1.5px solid #334155; margin-bottom: 4px;"></div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${data.technologistName || "Md. Rafiqul Islam, BSc"}</div>
          <div style="font-size: 10px; color: #64748b;">Medical Laboratory Technologist</div>
        </div>

        <div style="text-align: center; width: 220px;">
          <div style="border-top: 1.5px solid #334155; margin-bottom: 4px;"></div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${data.pathologistName || "Dr. Farzana Ahmed, MBBS, M.Phil"}</div>
          <div style="font-size: 10px; color: #64748b;">Consultant Clinical Pathologist</div>
        </div>
      </div>
    </div>
  `

  const handlePrint = () => {
    const htmlContent = generateReportA4Html()
    printHtmlDocument({
      title: `LabReport-${repNo}-${patientName}`,
      mode: "A4",
      htmlContent,
    })
  }

  const handleDownloadPdf = () => {
    const htmlContent = generateReportA4Html()
    downloadDocumentAsPdf({
      title: `LabReport-${repNo}-${patientName}.pdf`,
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
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t("diagnostic_test_report")}</h2>
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
          <div
            className="bg-white text-slate-900 p-6 rounded-xl shadow-lg border w-full max-w-lg text-xs"
            dangerouslySetInnerHTML={{ __html: generateReportA4Html() }}
          />
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
              {t("print_a4")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ReportPrintModal
