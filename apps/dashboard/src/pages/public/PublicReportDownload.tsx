import React, { useState } from "react"
import { useLazyPublicSearchLabReportQuery } from "@/lib/store/api/services/diagnostics.service"
import type { LabReport } from "@/lib/store/api/services/diagnostics.service"
import { toast } from "sonner"
import {
  FileText,
  Search,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"

export default function PublicReportDownload() {
  const [phone, setPhone] = useState("")
  const [token, setToken] = useState("")
  const [reportData, setReportData] = useState<LabReport | null>(null)

  const [triggerSearch, { isLoading, isError }] = useLazyPublicSearchLabReportQuery()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !token) {
      toast.error("মোবাইল নম্বর ও রিপোর্ট/টোকেন নম্বর প্রদান করুন")
      return
    }

    try {
      const res = await triggerSearch({ phone, token }).unwrap()
      if (res) {
        setReportData(res)
        toast.success("রিপোর্ট সফলভাবে খুঁজে পাওয়া গেছে!")
      } else {
        toast.error("প্রদত্ত তথ্যের সাথে কোনো রিপোর্ট মিলেনি")
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "প্রদত্ত তথ্যের সাথে কোনো রিপোর্ট মিলেনি")
      setReportData(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ডাক্তার খাতা</h1>
            <p className="text-xs text-slate-400">অনলাইন পেশেন্ট রিপোর্ট ডাউনলোড পোর্টাল</p>
          </div>
        </div>

        <a
          href="/auth/login"
          className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
        >
          লগইন করুন
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
            <h2 className="text-2xl font-black text-white">ডায়াগনস্টিক রিপোর্ট ডাউনলোড</h2>
            <p className="text-xs text-slate-400 mt-1">
              আপনার প্রেসক্রিপশন বা টেস্ট রিসিটে থাকা টোকেন নম্বর ও মোবাইল নম্বর দিয়ে রিপোর্ট ডাউনলোড করুন
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                রোগীর মোবাইল নম্বর *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: 017XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                রিপোর্ট / টোকেন নম্বর *
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="যেমন: REP-2026... বা 8-সংখ্যার টোকেন"
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
                খুঁজুন
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
                <h3 className="text-2xl font-black text-slate-900">ডাক্তার খাতা ক্লিনিক্যাল ল্যাবরেটরি</h3>
                <p className="text-xs text-slate-500">স্বীকৃত ও পরীক্ষিত ডায়াগনস্টিক রিপোর্ট</p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition"
                >
                  <Printer className="h-4 w-4" />
                  প্রিন্ট / PDF ডাউনলোড
                </button>
              </div>
            </div>

            {/* Patient & Order Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-xs p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-500 block">রোগীর নাম:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {reportData.patient?.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">মোবাইল:</span>
                <span className="font-semibold text-slate-800">
                  {reportData.patient?.mobile || phone}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">রিপোর্ট নম্বর:</span>
                <span className="font-bold text-cyan-700 font-mono">
                  {reportData.reportNumber || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">রিপোর্টের তারিখ:</span>
                <span className="font-medium text-slate-800">
                  {new Date(reportData.createdAt).toLocaleDateString("bn-BD", {
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
                  পরীক্ষার ফলাফল ও পর্যবেক্ষণ (CLINICAL FINDINGS)
                </h4>
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                  {reportData.findings || "টেস্টের ফলাফল স্বাভাবিক ও সন্তোষজনক।"}
                </div>
              </div>

              {reportData.conclusion && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    চূড়ান্ত সিদ্ধান্ত (CONCLUSION / IMPRESSION)
                  </h4>
                  <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 text-sm text-cyan-950 font-semibold">
                    {reportData.conclusion}
                  </div>
                </div>
              )}

              {reportData.remarks && (
                <div className="text-xs text-slate-500 italic">
                  <b>মন্তব্য:</b> {reportData.remarks}
                </div>
              )}
            </div>

            {/* Verification Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <ShieldCheck className="h-5 w-5" />
                <span>অনলাইন অনুমোদিত ও ডিজিটালভাবে ভেরিফায়েড রিপোর্ট</span>
              </div>

              <div className="text-right text-slate-500">
                <span>অনুমোদনকারী: <b>{reportData.approvedBy?.name || "চিফ মেডিকেল টেকনোলজিস্ট"}</b></span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
