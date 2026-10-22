import React, { useState } from "react"
import {
  useGetBedAvailabilitySummaryQuery,
} from "@/lib/store/api/services/admission.service"
import {
  useGetServicesQuery,
  useGetTestCatalogQuery,
} from "@/lib/store/api/services/service-catalog.service"
import type { TestCatalogItem } from "@/lib/store/api/services/service-catalog.service"
import { useGetDoctorOptionsQuery } from "@/lib/store/api/services/doctor.service"
import { useCreateTestOrderMutation } from "@/lib/store/api/services/diagnostics.service"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store/store"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import {
  Bed,
  CheckCircle2,
  Stethoscope,
  TestTube,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react"

export default function ClinicServicesPage() {
  const navigate = useNavigate()
  const authUser = useSelector((state: RootState) => state.auth?.user)

  const [activeTab, setActiveTab] = useState<"tests" | "doctors" | "beds">("tests")
  const [selectedTestToBook, setSelectedTestToBook] = useState<TestCatalogItem | null>(null)

  // API Queries
  const { data: bedSummary, isLoading: isLoadingBeds } = useGetBedAvailabilitySummaryQuery()
  const { data: services = [] } = useGetServicesQuery()
  const { data: tests = [] } = useGetTestCatalogQuery()
  const { data: doctorsData } = useGetDoctorOptionsQuery(undefined)
  const doctorsList = Array.isArray(doctorsData) ? doctorsData : (doctorsData as any)?.data || []

  const [createTestOrder, { isLoading: isBookingTest }] = useCreateTestOrderMutation()

  const handleSelfBookTest = async () => {
    const patientId = authUser?.user?._id || (authUser as any)?._id
    if (!selectedTestToBook || !patientId) {
      toast.error("বুকিং সম্পন্ন করতে লগইন নিশ্চিত করুন")
      return
    }

    try {
      await createTestOrder({
        patient: patientId,
        referringDoctorName: "Self Online Booking",
        isWalkIn: true,
        items: [
          {
            test: selectedTestToBook._id,
            testName: selectedTestToBook.name,
            price: selectedTestToBook.price,
          },
        ],
      }).unwrap()

      toast.success(
        `"${selectedTestToBook.name}" টেস্টটি সফলভাবে বুক হয়েছে! ক্লিনিকে আসার পর আপনার টোকেন সংগ্রহ করুন।`
      )
      setSelectedTestToBook(null)
    } catch (err: any) {
      toast.error(err?.data?.message || "টেস্ট বুকিং ব্যর্থ হয়েছে")
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" /> ক্লিনিক সার্ভিস ও রিসোর্স ডিরেক্টরি
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            ক্লিনিকের সকল সেবা, চিকিৎসক ও লাইভ বেড তথ্য
          </h1>
          <p className="mt-2 text-sm text-blue-100 sm:text-base">
            ডায়াগনস্টিক টেস্ট সরাসরি বুক করুন, ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট নিন এবং হাসপাতালের লাইভ বেড
            পরিস্থিতি জানুন।
          </p>
        </div>
      </div>

      {/* Bed Live Availability Spotlight Card */}
      <div className="bg-card border-2 border-emerald-500/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
              <Bed className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  লাইভ বেড স্ট্যাটাস (রিয়েল-টাইম)
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground mt-0.5">
                হাসপাতালে বর্তমানে{" "}
                <span className="text-emerald-600 font-black">
                  {bedSummary?.available ?? 0} টি
                </span>{" "}
                বেড ফাঁকা আছে
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                সর্বমোট {bedSummary?.total ?? 0} টি বেডের মধ্যে {bedSummary?.occupied ?? 0} টিতে
                রোগী ভর্তি আছেন
              </p>
            </div>
          </div>

          {/* Ward pills */}
          <div className="flex flex-wrap gap-2">
            {bedSummary?.wards?.map((w, idx) => (
              <div
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-muted/60 border text-xs font-semibold flex items-center gap-2"
              >
                <span>{w.wardName}:</span>
                <span className="text-emerald-600 font-bold">{w.available} ফাঁকা</span>
                <span className="text-muted-foreground font-normal">/ {w.total} মোট</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition ${
            activeTab === "tests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TestTube className="h-4 w-4" />
          ডায়াগনস্টিক টেস্টসমূহ ({tests.length})
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition ${
            activeTab === "doctors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          বিশেষজ্ঞ চিকিৎসকবৃন্দ ({doctorsList.length})
        </button>
      </div>

      {/* TAB 1: DIAGNOSTIC TESTS CATALOG & SELF-BOOKING */}
      {activeTab === "tests" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.length > 0 ? (
              tests.map((test) => (
                <div
                  key={test._id}
                  className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        {test.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ডেলিভারি: ~{test.turnaroundHours ?? 24} ঘণ্টা
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground line-clamp-1">{test.name}</h3>
                    {test.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {test.description}
                      </p>
                    )}
                    {test.preparationInstructions && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs">
                        ⚠️ <b>নির্দেশনা:</b> {test.preparationInstructions}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">টেস্ট ফি:</span>
                      <span className="text-xl font-black text-primary">
                        ৳{test.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedTestToBook(test)}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow transition"
                    >
                      টেস্ট বুক করুন
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground bg-card border rounded-3xl">
                কোনো ডায়াগনস্টিক টেস্ট তালিকাভুক্ত নেই।
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DOCTORS DIRECTORY */}
      {activeTab === "doctors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorsList.length > 0 ? (
            doctorsList.map((doc: any) => (
              <div
                key={doc.value || doc._id}
                className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 flex items-center justify-center font-black text-xl mb-4">
                    {(doc.label || doc.name)?.charAt(0) || "D"}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{doc.label || doc.name}</h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {doc.specialization?.join(", ") || "মেডিকেল কনসালট্যান্ট"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    পদবি: {doc.designation || "এমবিবিএস, এফসিপিএস"}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">সিরিয়াল অনলাইন উপলভ্য</span>
                  <button
                    onClick={() => navigate("/patient/appointments")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow transition"
                  >
                    অ্যাপয়েন্টমেন্ট নিন
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-muted-foreground bg-card border rounded-3xl">
              কোনো ডাক্তার তালিকাভুক্ত নেই।
            </div>
          )}
        </div>
      )}

      {/* MODAL: SELF BOOK TEST CONFIRMATION */}
      {selectedTestToBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              টেস্ট বুকিং নিশ্চিত করুন
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              আপনি অনলাইনে টেস্টের জন্য সিরিয়াল বুক করতে যাচ্ছেন:
            </p>

            <div className="p-4 rounded-2xl bg-muted/50 border space-y-2 text-sm mb-4">
              <div className="flex justify-between font-bold">
                <span>টেস্ট:</span>
                <span className="text-primary">{selectedTestToBook.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ক্যাটাগরি:</span>
                <span>{selectedTestToBook.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ফি:</span>
                <span className="font-bold text-foreground">
                  ৳{selectedTestToBook.price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedTestToBook(null)}
                className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSelfBookTest}
                disabled={isBookingTest}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
              >
                বুকিং নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
