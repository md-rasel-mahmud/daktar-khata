import React, { useState } from "react"
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetTestCatalogQuery,
  useCreateTestCatalogMutation,
  useUpdateTestCatalogMutation,
  useDeleteTestCatalogMutation,
} from "@/lib/store/api/services/service-catalog.service"
import type { ServiceItem, TestCatalogItem } from "@/lib/store/api/services/service-catalog.service"
import { toast } from "sonner"
import {
  Plus,
  Stethoscope,
  TestTube,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Tag,
  Clock,
  Layers,
} from "lucide-react"

export default function ManageServices() {
  const [activeTab, setActiveTab] = useState<"services" | "tests">("services")
  const [search, setSearch] = useState("")

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "CONSULTATION",
    price: "",
    durationMinutes: "15",
    description: "",
    department: "General",
  })

  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<TestCatalogItem | null>(null)
  const [testForm, setTestForm] = useState({
    name: "",
    category: "RADIOLOGY",
    price: "",
    sampleType: "None",
    turnaroundHours: "24",
    description: "",
    preparationInstructions: "",
  })

  // Queries & Mutations
  const { data: services = [], isLoading: isLoadingServices } = useGetServicesQuery({
    search: search || undefined,
  })
  const { data: tests = [], isLoading: isLoadingTests } = useGetTestCatalogQuery()

  const [createService, { isLoading: isCreatingService }] = useCreateServiceMutation()
  const [updateService, { isLoading: isUpdatingService }] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation()

  const [createTest, { isLoading: isCreatingTest }] = useCreateTestCatalogMutation()
  const [updateTest, { isLoading: isUpdatingTest }] = useUpdateTestCatalogMutation()
  const [deleteTest] = useDeleteTestCatalogMutation()

  // Handle Service Form Submit
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceForm.name || !serviceForm.price) {
      toast.error("সার্ভিসের নাম ও মূল্য প্রদান আবশ্যক")
      return
    }

    try {
      const payload: any = {
        name: serviceForm.name,
        category: serviceForm.category,
        price: parseFloat(serviceForm.price),
        durationMinutes: parseInt(serviceForm.durationMinutes) || 15,
        description: serviceForm.description,
        department: serviceForm.department,
      }

      if (editingService) {
        await updateService({ id: editingService._id, body: payload }).unwrap()
        toast.success("সার্ভিস সফলভাবে আপডেট করা হয়েছে!")
      } else {
        await createService(payload).unwrap()
        toast.success("নতুন সার্ভিস সফলভাবে যুক্ত করা হয়েছে!")
      }

      setIsServiceModalOpen(false)
      setEditingService(null)
      setServiceForm({
        name: "",
        category: "CONSULTATION",
        price: "",
        durationMinutes: "15",
        description: "",
        department: "General",
      })
    } catch (err: any) {
      toast.error(err?.data?.message || "সার্ভিস সংরক্ষণ ব্যর্থ হয়েছে")
    }
  }

  // Handle Test Form Submit
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testForm.name || !testForm.price) {
      toast.error("টেস্টের নাম ও মূল্য প্রদান আবশ্যক")
      return
    }

    try {
      const payload: any = {
        name: testForm.name,
        category: testForm.category,
        price: parseFloat(testForm.price),
        sampleType: testForm.sampleType,
        turnaroundHours: parseInt(testForm.turnaroundHours) || 24,
        description: testForm.description,
        preparationInstructions: testForm.preparationInstructions,
      }

      if (editingTest) {
        await updateTest({ id: editingTest._id, body: payload }).unwrap()
        toast.success("ডায়াগনস্টিক টেস্ট সফলভাবে আপডেট করা হয়েছে!")
      } else {
        await createTest(payload).unwrap()
        toast.success("নতুন ডায়াগনস্টিক টেস্ট সফলভাবে যুক্ত করা হয়েছে!")
      }

      setIsTestModalOpen(false)
      setEditingTest(null)
      setTestForm({
        name: "",
        category: "RADIOLOGY",
        price: "",
        sampleType: "None",
        turnaroundHours: "24",
        description: "",
        preparationInstructions: "",
      })
    } catch (err: any) {
      toast.error(err?.data?.message || "টেস্ট সংরক্ষণ ব্যর্থ হয়েছে")
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই সার্ভিসটি মুছে ফেলতে চান?")) return
    try {
      await deleteService(id).unwrap()
      toast.success("সার্ভিস সফলভাবে মুছে ফেলা হয়েছে")
    } catch {
      toast.error("সার্ভিস মুছতে ব্যর্থ হয়েছে")
    }
  }

  const handleDeleteTest = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ডায়াগনস্টিক টেস্টটি মুছে ফেলতে চান?")) return
    try {
      await deleteTest(id).unwrap()
      toast.success("টেস্ট সফলভাবে মুছে ফেলা হয়েছে")
    } catch {
      toast.error("টেস্ট মুছতে ব্যর্থ হয়েছে")
    }
  }

  const openEditServiceModal = (item: ServiceItem) => {
    setEditingService(item)
    setServiceForm({
      name: item.name,
      category: item.category || "CONSULTATION",
      price: item.price.toString(),
      durationMinutes: item.durationMinutes?.toString() || "15",
      description: item.description || "",
      department: item.department || "General",
    })
    setIsServiceModalOpen(true)
  }

  const openEditTestModal = (item: TestCatalogItem) => {
    setEditingTest(item)
    setTestForm({
      name: item.name,
      category: item.category || "RADIOLOGY",
      price: item.price.toString(),
      sampleType: item.sampleType || "None",
      turnaroundHours: item.turnaroundHours?.toString() || "24",
      description: item.description || "",
      preparationInstructions: item.preparationInstructions || "",
    })
    setIsTestModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">সার্ভিস ও টেস্ট ক্যাটালগ ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground">
            ক্লিনিকের সকল কনসালটেশন, নার্সিং সেবা, ইনজেকশন ও ডায়াগনস্টিক টেস্টের মূল্য তালিকা তৈরি ও
            নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === "services") {
              setEditingService(null)
              setServiceForm({
                name: "",
                category: "CONSULTATION",
                price: "",
                durationMinutes: "15",
                description: "",
                department: "General",
              })
              setIsServiceModalOpen(true)
            } else {
              setEditingTest(null)
              setTestForm({
                name: "",
                category: "RADIOLOGY",
                price: "",
                sampleType: "None",
                turnaroundHours: "24",
                description: "",
                preparationInstructions: "",
              })
              setIsTestModalOpen(true)
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
        >
          <Plus className="h-4 w-4" />
          {activeTab === "services" ? "নতুন ক্লিনিক্যাল সার্ভিস যুক্ত করুন" : "নতুন ডায়াগনস্টিক টেস্ট যুক্ত করুন"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition ${
            activeTab === "services"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          ক্লিনিক্যাল সার্ভিসসমূহ ({services.length})
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition ${
            activeTab === "tests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TestTube className="h-4 w-4" />
          ডায়াগনস্টিক টেস্ট ক্যাটালগ ({tests.length})
        </button>
      </div>

      {/* TAB 1: SERVICES TABLE */}
      {activeTab === "services" && (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="সার্ভিসের নাম লিখে খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3">সার্ভিসের নাম</th>
                  <th className="px-5 py-3">ক্যাটাগরি</th>
                  <th className="px-5 py-3">বিভাগ</th>
                  <th className="px-5 py-3">মূল্য (BDT)</th>
                  <th className="px-5 py-3">সময়কাল</th>
                  <th className="px-5 py-3">স্ট্যাটাস</th>
                  <th className="px-5 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.length > 0 ? (
                  services.map((svc) => (
                    <tr key={svc._id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{svc.name}</div>
                        {svc.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {svc.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground border">
                          {svc.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {svc.department || "General"}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        ৳{svc.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {svc.durationMinutes ? `${svc.durationMinutes} মি.` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {svc.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> সক্রিয়
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <XCircle className="h-3.5 w-3.5" /> নিষ্ক্রিয়
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditServiceModal(svc)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      কোনো সার্ভিস পাওয়া যায়নি। নতুন সার্ভিস যোগ করতে উপরের বাটনে চাপুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TESTS TABLE */}
      {activeTab === "tests" && (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3">টেস্টের নাম</th>
                  <th className="px-5 py-3">ক্যাটাগরি</th>
                  <th className="px-5 py-3">স্যাম্পল টাইপ</th>
                  <th className="px-5 py-3">মূল্য (BDT)</th>
                  <th className="px-5 py-3">রিপোর্ট ডেলিভারি</th>
                  <th className="px-5 py-3">স্ট্যাটাস</th>
                  <th className="px-5 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tests.length > 0 ? (
                  tests.map((test) => (
                    <tr key={test._id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{test.name}</div>
                        {test.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {test.description}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                          {test.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {test.sampleType || "None"}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        ৳{test.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        ~{test.turnaroundHours ?? 24} ঘণ্টা
                      </td>
                      <td className="px-5 py-4">
                        {test.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> সক্রিয়
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <XCircle className="h-3.5 w-3.5" /> নিষ্ক্রিয়
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditTestModal(test)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      কোনো টেস্ট পাওয়া যায়নি। নতুন টেস্ট যোগ করতে উপরের বাটনে চাপুন।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT SERVICE */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? "সার্ভিস সম্পাদনা করুন" : "নতুন ক্লিনিক্যাল সার্ভিস যুক্ত করুন"}
            </h2>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">সার্ভিসের নাম *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="যেমন: ডক্টর কনসালটেশন ফি / ইনজেকশন প্রয়োগ ফি"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="CONSULTATION">CONSULTATION (ডাক্তার ফি)</option>
                    <option value="NURSING">NURSING (নার্সিং সেবা)</option>
                    <option value="BED">BED (বেড চার্জ)</option>
                    <option value="OPERATION">OPERATION (অপারেশন ফি)</option>
                    <option value="MEDICINE">MEDICINE (ওষুধ)</option>
                    <option value="MEDICAL_SUPPLY">MEDICAL_SUPPLY (চিকিৎসা সরঞ্জাম)</option>
                    <option value="SERVICE">SERVICE (অন্যান্য সেবা)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="৳ মূল্য"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">বিভাগ / ডিপার্টমেন্ট</label>
                  <input
                    type="text"
                    value={serviceForm.department}
                    onChange={(e) => setServiceForm({ ...serviceForm, department: e.target.value })}
                    placeholder="যেমন: General, Dental, OPD"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">সময়কাল (মিনিট)</label>
                  <input
                    type="number"
                    value={serviceForm.durationMinutes}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, durationMinutes: e.target.value })
                    }
                    placeholder="15"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="সার্ভিস সংক্রান্ত নির্দেশনা বা বিবরণ..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreatingService || isUpdatingService}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT TEST */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4">
              {editingTest ? "ডায়াগনস্টিক টেস্ট সম্পাদনা করুন" : "নতুন ডায়াগনস্টিক টেস্ট যুক্ত করুন"}
            </h2>
            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">টেস্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  placeholder="যেমন: Ultrasonography Whole Abdomen / CBC"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ক্যাটাগরি</label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="RADIOLOGY">RADIOLOGY (আল্ট্রাসনোগ্রাফি, এক্স-রে)</option>
                    <option value="PATHOLOGY">PATHOLOGY (রক্ত, ইউরিন পরীক্ষা)</option>
                    <option value="CARDIOLOGY">CARDIOLOGY (ইসিজি, ইকো)</option>
                    <option value="BIOCHEMISTRY">BIOCHEMISTRY (বায়োকেমিস্ট্রি)</option>
                    <option value="OTHER">OTHER (অন্যান্য)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={testForm.price}
                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                    placeholder="৳ টেস্ট ফি"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">স্যাম্পল টাইপ</label>
                  <input
                    type="text"
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    placeholder="Blood / Urine / None"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">ডেলিভারি সময় (ঘণ্টা)</label>
                  <input
                    type="number"
                    value={testForm.turnaroundHours}
                    onChange={(e) => setTestForm({ ...testForm, turnaroundHours: e.target.value })}
                    placeholder="24"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">প্রস্তুতি নির্দেশনা</label>
                <input
                  type="text"
                  value={testForm.preparationInstructions}
                  onChange={(e) =>
                    setTestForm({ ...testForm, preparationInstructions: e.target.value })
                  }
                  placeholder="যেমন: খালি পেটে আসতে হবে / পানি পান করে মূত্রাশয় পূর্ণ রাখতে হবে"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTest || isUpdatingTest}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
