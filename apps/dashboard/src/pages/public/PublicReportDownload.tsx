import React, { useState } from "react"
import { useLazyPublicSearchLabReportQuery } from "@/lib/store/api/services/diagnostics.service"
import type { LabReport } from "@/lib/store/api/services/diagnostics.service"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  FileText,
  Search,
  Printer,
  Download,
  ShieldCheck,
  Stethoscope,
  Lock,
  AlertTriangle,
} from "lucide-react"
import { printHtmlDocument, downloadDocumentAsPdf } from "@/components/common/print"

export default function PublicReportDownload() {
  const { t, i18n } = useTranslation()
  const [phone, setPhone] = useState("")
  const [token, setToken] = useState("")
  const [reportData, setReportData] = useState<LabReport | null>(null)

  const [triggerSearch, { isLoading }] = useLazyPublicSearchLabReportQuery()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !token) {
      toast.error(t("phone_and_token_required"))
      return
    }

    try {
      const res = await triggerSearch({ phone, token }).unwrap()
      if (res) {
        setReportData(res)
        toast.success(t("report_found_success"))
      } else {
        toast.error(t("report_not_found"))
      }
    } catch (err: any) {
      toast.error(err?.data?.message || t("report_not_found"))
      setReportData(null)
    }
  }

  const getReportA4Html = () => `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #0284c7; padding-bottom: 14px; margin-bottom: 16px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 900; color: #0284c7; margin: 0; text-transform: uppercase;">Daktar Khata Clinical Laboratory</h1>
          <p style="font-size: 11px; color: #475569; margin: 2px 0;">Dhaka, Bangladesh | Hotline: +880 1700-000000</p>
          <p style="font-size: 11px; color: #0369a1; font-weight: 700; margin-top: 4px;">DEPARTMENT OF CLINICAL PATHOLOGY & DIAGNOSTIC SERVICES</p>
        </div>
        <div style="text-align: right; background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 8px; padding: 6px 14px;">
          <div style="font-size: 10px; font-weight: 700; color: #0369a1; text-transform: uppercase;">Report Ref</div>
          <div style="font-size: 16px; font-weight: 900; color: #0284c7;">#${reportData?.reportNumber || token}</div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #cbd5e1; font-size: 11px; background: #f8fafc;">
        <tr>
          <td style="padding: 6px 10px; border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; width: 50%;">
            <span style="color: #64748b; font-weight: 600;">Patient Name:</span>
            <span style="font-weight: 800; color: #0f172a; margin-left: 6px; font-size: 13px;">${reportData?.patient?.name || "Patient"}</span>
          </td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #cbd5e1; width: 50%;">
            <span style="color: #64748b; font-weight: 600;">Phone:</span>
            <span style="font-weight: 700; color: #0f172a; margin-left: 6px;">${reportData?.patient?.mobile || phone}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 10px; border-right: 1px solid #cbd5e1;">
            <span style="color: #64748b; font-weight: 600;">Token No:</span>
            <span style="font-weight: 700; color: #0284c7; margin-left: 6px;">#${token}</span>
          </td>
          <td style="padding: 6px 10px;">
            <span style="color: #64748b; font-weight: 600;">Report Status:</span>
            <span style="font-weight: 700; color: #15803d; margin-left: 6px;">OFFICIAL & VERIFIED</span>
          </td>
        </tr>
      </table>

      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; color: #0f172a;">Clinical Findings:</h3>
        <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-family: monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap;">
          ${reportData?.findings || "All clinical parameters within normal biological reference range."}
        </div>
      </div>

      ${
        reportData?.conclusion
          ? `
        <div style="margin-bottom: 20px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
          <h4 style="font-size: 12px; font-weight: 800; color: #166534; margin: 0 0 4px 0;">Conclusion / Impression:</h4>
          <p style="font-size: 12px; color: #15803d; margin: 0;">${reportData.conclusion}</p>
        </div>
      `
          : ""
      }

      ${
        reportData?.remarks
          ? `
        <div style="font-size: 11px; color: #64748b; font-style: italic; margin-bottom: 30px;">
          <b>Remarks:</b> ${reportData.remarks}
        </div>
      `
          : ""
      }

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; padding-top: 16px; border-top: 1px dashed #cbd5e1;">
        <div style="font-size: 10px; color: #94a3b8;">
          <div>Verified through Daktar Khata Secure Health Record System</div>
          <div>Computer-generated digital diagnostic report.</div>
        </div>
        <div style="text-align: center; width: 220px;">
          <div style="border-top: 1.5px solid #334155; margin-bottom: 4px;"></div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${reportData?.approvedBy?.name || "Chief Clinical Pathologist"}</div>
          <div style="font-size: 10px; color: #64748b;">Medical Laboratory In-Charge</div>
        </div>
      </div>
    </div>
  `

  const isLocked = Boolean(
    reportData &&
      (reportData.canDownload === false ||
        reportData.isPaid === false ||
        (typeof reportData.dueAmount === "number" && reportData.dueAmount > 0))
  )

  const handlePrintA4 = () => {
    if (isLocked) {
      toast.error(t("due_payment_required_to_download") || "Full payment is required to print this laboratory report.")
      return
    }
    printHtmlDocument({
      title: `LabReport-${reportData?.reportNumber || token}-${reportData?.patient?.name || "Patient"}`,
      mode: "A4",
      htmlContent: getReportA4Html(),
    })
  }

  const handleDownloadPdf = () => {
    if (isLocked) {
      toast.error(t("due_payment_required_to_download") || "Full payment is required to download this laboratory report.")
      return
    }
    downloadDocumentAsPdf({
      title: `LabReport-${reportData?.reportNumber || token}-${reportData?.patient?.name || "Patient"}.pdf`,
      mode: "A4",
      htmlContent: getReportA4Html(),
    })
  }

  const locale = i18n.language === "bn" ? "bn-BD" : "en-US"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{t("app_name")}</h1>
            <p className="text-xs text-slate-400">{t("report_portal_title")}</p>
          </div>
        </div>

        <a
          href="/auth/login"
          className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
        >
          {t("login")}
        </a>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 sm:p-10 flex flex-col justify-center">
        {/* Search Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="text-center max-w-md mx-auto mb-6">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-white">{t("report_portal_title")}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {t("report_portal_desc")}
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t("enter_phone")} *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t("enter_token")} *
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="REP-XXXX or Token"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Search className="h-4 w-4" />
                {t("search_report")}
              </button>
            </div>
          </form>
        </div>

        {/* Report Result Preview Card */}
        {reportData && (
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 print:p-0 print:border-none print:shadow-none">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{t("app_name")} Clinical Laboratory</h3>
                <p className="text-xs text-slate-500">{t("verified_report_badge")}</p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                {isLocked ? (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 font-bold text-xs">
                    <Lock className="h-4 w-4" />
                    <span>{t("due_payment_required") || "Due Payment Required"}</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs transition"
                    >
                      <Download className="h-4 w-4" />
                      {t("download_pdf")}
                    </button>
                    <button
                      onClick={handlePrintA4}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition"
                    >
                      <Printer className="h-4 w-4" />
                      {t("print_a4")}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Unpaid Due Alert Banner */}
            {isLocked && (
              <div className="my-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5">
                  <div className="font-bold text-sm text-amber-950">
                    {t("payment_due_alert_title") || "Payment Required to Download Official Report"}
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {t("payment_due_alert_desc") ||
                      "This diagnostic investigation has an unpaid balance. Official lab reports with verified values and downloadable PDF documents are accessible once your bill is fully settled."}
                    {reportData.dueAmount !== undefined && (
                      <span className="font-bold ml-1 text-amber-950">
                        Remaining Due: ৳{reportData.dueAmount}
                      </span>
                    )}
                  </p>
                  <div className="pt-1">
                    <a
                      href="/auth/login"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      {t("login_to_pay_online") || "Sign In to Settle Bill Online"}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Patient & Order Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-xs p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-500 block">{t("name")}:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {reportData.patient?.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t("phone")}:</span>
                <span className="font-semibold text-slate-800">
                  {reportData.patient?.mobile || phone}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t("report_number")}:</span>
                <span className="font-bold text-cyan-700 font-mono">
                  {reportData.reportNumber || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t("report_date")}:</span>
                <span className="font-medium text-slate-800">
                  {new Date(reportData.createdAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Test Details & Findings */}
            <div className="space-y-6 my-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t("clinical_findings")}
                </h4>
                {isLocked ? (
                  <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Lock className="h-6 w-6 text-amber-500" />
                    <span className="font-semibold text-slate-700">
                      Detailed laboratory values and verified pathologist notes are locked.
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Please clear the pending invoice at counter or via patient portal.
                    </span>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                    {reportData.findings || "Normal findings observed."}
                  </div>
                )}
              </div>

              {reportData.conclusion && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {t("conclusion_impression")}
                  </h4>
                  <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 text-sm text-cyan-950 font-semibold">
                    {reportData.conclusion}
                  </div>
                </div>
              )}

              {reportData.remarks && (
                <div className="text-xs text-slate-500 italic">
                  <b>{t("remarks")}:</b> {reportData.remarks}
                </div>
              )}
            </div>

            {/* Verification Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <ShieldCheck className="h-5 w-5" />
                <span>{t("verified_report_badge")}</span>
              </div>

              <div className="text-right text-slate-500">
                <span>{t("approved_by")}: <b>{reportData.approvedBy?.name || "Chief Medical Technologist"}</b></span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
