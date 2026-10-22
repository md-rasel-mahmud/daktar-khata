import React, { useState } from "react"
import {
  useGetAdmissionsQuery,
  useCreateAdmissionMutation,
  useDischargePatientMutation,
  useAddAdmissionDailyChargeMutation,
  useGetWardsQuery,
  useGetRoomsQuery,
  useGetBedsQuery,
} from "@/lib/store/api/services/admission.service"
import type { AdmissionItem } from "@/lib/store/api/services/admission.service"
import { useGetPatientsQuery } from "@/lib/store/api/services/patient.service"
import { useGetDoctorOptionsQuery } from "@/lib/store/api/services/doctor.service"
import { toast } from "sonner"
import {
  Bed,
  Plus,
  Search,
  CheckCircle2,
  Syringe,
  FileText,
  LogOut,
  Calendar,
  User,
  Stethoscope,
  Clock,
  Layers,
} from "lucide-react"

export default function ManageAdmissions() {
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [search, setSearch] = useState<string>("")

  // Modals state
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false)
  const [admissionForm, setAdmissionForm] = useState({
    patient: "",
    doctor: "",
    ward: "",
    room: "",
    bed: "",
    reason: "",
    diagnosis: "",
  })

  // Daily charge modal state
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
  const [selectedAdmissionForCharge, setSelectedAdmissionForCharge] = useState<AdmissionItem | null>(null)
  const [chargeForm, setChargeForm] = useState({
    serviceName: "",
    category: "INJECTION",
    quantity: "1",
    unitPrice: "",
    notes: "",
  })

  // Discharge modal state
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false)
  const [selectedAdmissionForDischarge, setSelectedAdmissionForDischarge] = useState<AdmissionItem | null>(null)
  const [dischargeNotes, setDischargeNotes] = useState("")

  // API Queries
  const { data: admissions = [], isLoading: isLoadingAdmissions, refetch } = useGetAdmissionsQuery({
    status: statusFilter || undefined,
  })
  const { data: patientsData } = useGetPatientsQuery(undefined)
  const patientsList = Array.isArray(patientsData) ? patientsData : (patientsData as any)?.data || []

  const { data: doctorsData } = useGetDoctorOptionsQuery(undefined)
  const doctorsList = Array.isArray(doctorsData) ? doctorsData : (doctorsData as any)?.data || []

  const { data: wards = [] } = useGetWardsQuery()
  const { data: rooms = [] } = useGetRoomsQuery(
    admissionForm.ward ? { wardId: admissionForm.ward } : undefined
  )
  const { data: beds = [] } = useGetBedsQuery(
    admissionForm.room
      ? { roomId: admissionForm.room, status: "AVAILABLE" }
      : admissionForm.ward
      ? { wardId: admissionForm.ward, status: "AVAILABLE" }
      : { status: "AVAILABLE" }
  )

  const [createAdmission, { isLoading: isCreatingAdmission }] = useCreateAdmissionMutation()
  const [dischargePatient, { isLoading: isDischarging }] = useDischargePatientMutation()
  const [addDailyCharge, { isLoading: isAddingCharge }] = useAddAdmissionDailyChargeMutation()

  // Handle Admission Submit
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admissionForm.patient || !admissionForm.bed) {
      toast.error("রোগী এবং বেড নির্বাচন আবশ্যক")
      return
    }

    try {
      await createAdmission({
        patient: admissionForm.patient,
        doctor: admissionForm.doctor || undefined,
        ward: admissionForm.ward || undefined,
        room: admissionForm.room || undefined,
        bed: admissionForm.bed,
        reason: admissionForm.reason,
        diagnosis: admissionForm.diagnosis,
      }).unwrap()

      toast.success("রোগী সফলভাবে হাসপাতালে ভর্তি করা হয়েছে এবং বেড বরাদ্দ হয়েছে!")
      setIsAdmissionModalOpen(false)
      setAdmissionForm({
        patient: "",
        doctor: "",
        ward: "",
        room: "",
        bed: "",
        reason: "",
        diagnosis: "",
      })
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || "ভর্তি প্রক্রিয়া ব্যর্থ হয়েছে")
    }
  }

  // Handle Daily Charge Submit
  const handleChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmissionForCharge || !chargeForm.serviceName || !chargeForm.unitPrice) {
      toast.error("চার্জ বিবরণ ও মূল্য দিন")
      return
    }

    try {
      await addDailyCharge({
        id: selectedAdmissionForCharge._id,
        body: {
          serviceName: chargeForm.serviceName,
          category: chargeForm.category,
          quantity: parseInt(chargeForm.quantity) || 1,
          unitPrice: parseFloat(chargeForm.unitPrice) || 0,
          notes: chargeForm.notes,
        },
      }).unwrap()

      toast.success("ইনজেকশন/নার্সিং চার্জ রোগীর ইনভয়েসে সফলভাবে যুক্ত হয়েছে!")
      setIsChargeModalOpen(false)
      setSelectedAdmissionForCharge(null)
      setChargeForm({
        serviceName: "",
        category: "INJECTION",
        quantity: "1",
        unitPrice: "",
        notes: "",
      })
    } catch (err: any) {
      toast.error(err?.data?.message || "চার্জ যুক্ত করা ব্যর্থ হয়েছে")
    }
  }

  // Handle Discharge Submit
  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdmissionForDischarge) return

    try {
      await dischargePatient({
        id: selectedAdmissionForDischarge._id,
        body: { dischargeNotes },
      }).unwrap()

      toast.success("রোগীকে সফলভাবে ডিসচার্জ করা হয়েছে এবং বেড খালি করা হয়েছে!")
      setIsDischargeModalOpen(false)
      setSelectedAdmissionForDischarge(null)
      setDischargeNotes("")
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || "ডিসচার্জ প্রক্রিয়া ব্যর্থ হয়েছে")
    }
  }

  const filteredAdmissions = admissions.filter((adm) => {
    const pName = adm.patient?.name?.toLowerCase() || ""
    const dName = adm.doctor?.name?.toLowerCase() || ""
    const term = search.toLowerCase()
    return pName.includes(term) || dName.includes(term)
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ইনপেশেন্ট ভর্তি ও বেড ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground">
            হাসপাতালে রোগী ভর্তি, বেড বুকিং, দৈনিক নার্সিং/ইনজেকশন খরচ যুক্তকরণ এবং ডিসচার্জ করুন
          </p>
        </div>

        <button
          onClick={() => setIsAdmissionModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
        >
          <Plus className="h-4 w-4" />
          নতুন রোগী ভর্তি করুন (New Admission)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="রোগী বা ডাক্তারের নাম লিখে খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">স্ট্যাটাস:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">সকল ভর্তি রোগী</option>
            <option value="ADMITTED">বর্তমানে চিকিৎসাধীন (ADMITTED)</option>
            <option value="DISCHARGED">ডিসচার্জ সম্পন্ন (DISCHARGED)</option>
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-3">রোগীর নাম</th>
                <th className="px-5 py-3">দায়িত্বপ্রাপ্ত ডাক্তার</th>
                <th className="px-5 py-3">ওয়ার্ড ও বেড</th>
                <th className="px-5 py-3">ভর্তির তারিখ</th>
                <th className="px-5 py-3">স্ট্যাটাস</th>
                <th className="px-5 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAdmissions.length > 0 ? (
                filteredAdmissions.map((adm) => (
                  <tr key={adm._id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {adm.patient?.name || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        মোবাইল: {adm.patient?.phone || adm.patient?.mobile || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {adm.doctor?.name || "মেডিকেল অফিসার"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {adm.doctor?.specialization?.join(", ") || "General Medicine"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 font-bold text-xs border border-cyan-500/20">
                        <Bed className="h-3.5 w-3.5" />
                        {adm.ward?.name || "General"} — বেড #{adm.bed?.bedNumber || "N/A"}
                      </div>
                      {adm.room?.name && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          রুম: {adm.room.name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(adm.admissionDate).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          adm.status === "ADMITTED"
                            ? "bg-emerald-500/20 text-emerald-600"
                            : "bg-slate-500/20 text-slate-600"
                        }`}
                      >
                        {adm.status === "ADMITTED" ? "চিকিৎসাধীন" : "ডিসচার্জড"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {adm.status === "ADMITTED" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAdmissionForCharge(adm)
                              setIsChargeModalOpen(true)
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold"
                            title="ইনজেকশন বা নার্সিং খরচ যোগ করুন"
                          >
                            <Syringe className="h-3.5 w-3.5" />
                            খরচ যোগ করুন
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAdmissionForDischarge(adm)
                              setIsDischargeModalOpen(true)
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold"
                            title="ডিসচার্জ করুন ও বেড খালি করুন"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            ডিসচার্জ
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    কোনো ভর্তি রোগী পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: NEW INPATIENT ADMISSION */}
      {isAdmissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              রোগী ভর্তি ও বেড বরাদ্দ
            </h2>
            <form onSubmit={handleAdmissionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">রোগী নির্বাচন করুন *</label>
                <select
                  required
                  value={admissionForm.patient}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, patient: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">রোগী বেছে নিন...</option>
                  {patientsList.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.mobile || p.phone} ({p.gender || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">চিকিৎসক / রেফারকারী ডাক্তার</label>
                <select
                  value={admissionForm.doctor}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, doctor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">ডাক্তার বেছে নিন...</option>
                  {doctorsList.map((doc: any) => (
                    <option key={doc.value || doc._id} value={doc.value || doc._id}>
                      {doc.label || doc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ওয়ার্ড</label>
                  <select
                    value={admissionForm.ward}
                    onChange={(e) =>
                      setAdmissionForm({ ...admissionForm, ward: e.target.value, room: "", bed: "" })
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">ওয়ার্ড ফিল্টার করুন...</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">রুম</label>
                  <select
                    value={admissionForm.room}
                    onChange={(e) =>
                      setAdmissionForm({ ...admissionForm, room: e.target.value, bed: "" })
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">রুম ফিল্টার করুন...</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name || `Room ${r.roomNumber}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  বরাদ্দযোগ্য খালি বেড নির্বাচন করুন *
                </label>
                <select
                  required
                  value={admissionForm.bed}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, bed: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold text-emerald-600"
                >
                  <option value="">খালি বেড বেছে নিন...</option>
                  {beds.map((b) => (
                    <option key={b._id} value={b._id}>
                      বেড #{b.bedNumber} ({b.ward?.name || "General"} — ৳{b.dailyCharge ?? 500}/দিন)
                    </option>
                  ))}
                </select>
                {beds.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    এই ওয়ার্ড/রুমে বর্তমানে কোনো খালি বেড নেই।
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ভর্তির কারণ / রোগ নির্ণয়</label>
                <input
                  type="text"
                  value={admissionForm.reason}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, reason: e.target.value })}
                  placeholder="যেমন: তীব্র পেটব্যথা ও বমি / পোস্ট-অপারেটিভ কেয়ার"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdmissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAdmission || !admissionForm.bed}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  ভর্তি নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DAILY SERVICE / INJECTION CHARGE */}
      {isChargeModalOpen && selectedAdmissionForCharge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold text-lg">
              <Syringe className="h-5 w-5" />
              দৈনিক নার্সিং ও সেবার খরচ যোগ করুন
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              রোগী: <b>{selectedAdmissionForCharge.patient?.name}</b> (বেড #{selectedAdmissionForCharge.bed?.bedNumber})
            </p>

            <form onSubmit={handleChargeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">সেবার ধরন / ক্যাটাগরি</label>
                <select
                  value={chargeForm.category}
                  onChange={(e) => setChargeForm({ ...chargeForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="INJECTION">INJECTION (ইনজেকশন প্রয়োগ)</option>
                  <option value="NURSING">NURSING (নার্সিং পর্যবেক্ষণ/সেবা)</option>
                  <option value="DRESSING">DRESSING (ব্যান্ডেজ ও ড্রেসিং)</option>
                  <option value="MEDICINE">MEDICINE (ওষুধ/স্যালাইন)</option>
                  <option value="MEDICAL_SUPPLY">MEDICAL_SUPPLY (ক্যানুলা/সিরিঞ্জ/সরঞ্জাম)</option>
                  <option value="OTHER">OTHER (অন্যান্য চার্জ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">সার্ভিস / আইটেমের নাম *</label>
                <input
                  type="text"
                  required
                  value={chargeForm.serviceName}
                  onChange={(e) => setChargeForm({ ...chargeForm, serviceName: e.target.value })}
                  placeholder="যেমন: Inj. Ceftriaxone 1g Push / Normal Saline 1000ml"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">পরিমাণ (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    value={chargeForm.quantity}
                    onChange={(e) => setChargeForm({ ...chargeForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">একক মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={chargeForm.unitPrice}
                    onChange={(e) => setChargeForm({ ...chargeForm, unitPrice: e.target.value })}
                    placeholder="৳ মূল্য"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border text-xs flex justify-between items-center font-bold">
                <span>মোট চার্জ:</span>
                <span className="text-foreground text-sm">
                  ৳{((parseInt(chargeForm.quantity) || 1) * (parseFloat(chargeForm.unitPrice) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsChargeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isAddingCharge}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold shadow hover:bg-amber-500 transition"
                >
                  ইনভয়েসে যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISCHARGE PATIENT */}
      {isDischargeModalOpen && selectedAdmissionForDischarge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              রোগী ডিসচার্জ নিশ্চিতকরণ
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              রোগী: <b>{selectedAdmissionForDischarge.patient?.name}</b> কে ডিসচার্জ করলে বরাদ্দকৃত বেডটি
              স্বয়ংক্রিয়ভাবে খালি (AVAILABLE) হয়ে যাবে।
            </p>

            <form onSubmit={handleDischargeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">ডিসচার্জ সামারি / নোট</label>
                <textarea
                  rows={3}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="রোগীর বর্তমান অবস্থা, ফলো-আপ পরামর্শ বা প্রেসক্রিপশন..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDischargeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isDischarging}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow hover:bg-red-500 transition"
                >
                  ডিসচার্জ সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
