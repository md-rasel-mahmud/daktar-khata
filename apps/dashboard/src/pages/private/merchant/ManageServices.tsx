import React, { useState } from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
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
      toast.error(t("service_name_price_req"))
      return
    }

    try {
      const priceVal = parseFloat(serviceForm.price) || 0
      const durationVal = parseInt(serviceForm.durationMinutes) || 15
      const payload: any = {
        name: serviceForm.name,
        category: serviceForm.category,
        defaultPrice: priceVal,
        price: priceVal,
        serviceDuration: durationVal,
        durationMinutes: durationVal,
        description: serviceForm.description,
        department: serviceForm.department,
      }

      if (editingService) {
        await updateService({ id: editingService._id, body: payload }).unwrap()
        toast.success(t("service_updated_success"))
      } else {
        await createService(payload).unwrap()
        toast.success(t("service_created_success"))
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
      toast.error(err?.data?.message || t("failed"))
    }
  }

  // Handle Test Form Submit
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testForm.name || !testForm.price) {
      toast.error(t("test_name_price_req"))
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
        toast.success(t("test_updated_success"))
      } else {
        await createTest(payload).unwrap()
        toast.success(t("test_created_success"))
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
      toast.error(err?.data?.message || t("failed"))
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return
    try {
      await deleteService(id).unwrap()
      toast.success(t("deleted_success"))
    } catch {
      toast.error(t("failed"))
    }
  }

  const handleDeleteTest = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return
    try {
      await deleteTest(id).unwrap()
      toast.success(t("deleted_success"))
    } catch {
      toast.error(t("failed"))
    }
  }

  const openEditServiceModal = (item: ServiceItem) => {
    setEditingService(item)
    const priceVal = item.defaultPrice ?? item.price ?? 0
    const durationVal = item.serviceDuration ?? item.durationMinutes ?? 15
    setServiceForm({
      name: item.name,
      category: item.category || "CONSULTATION",
      price: priceVal.toString(),
      durationMinutes: durationVal.toString(),
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
          <h1 className="text-2xl font-bold tracking-tight">{t("services_tests_catalog")}</h1>
          <p className="text-sm text-muted-foreground">{t("services_tests_desc")}</p>
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
          {activeTab === "services" ? t("add_service_btn") : t("add_test_btn")}
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
          {t("services_tab")} ({services.length})
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
          {t("tests_tab")} ({tests.length})
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
                placeholder={t("search_services_tests")}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
                <tr>
                  <th className="px-5 py-3">{t("name")}</th>
                  <th className="px-5 py-3">{t("category_label")}</th>
                  <th className="px-5 py-3">{t("department")}</th>
                  <th className="px-5 py-3">{t("price")}</th>
                  <th className="px-5 py-3">{t("duration_mins")}</th>
                  <th className="px-5 py-3">{t("status")}</th>
                  <th className="px-5 py-3 text-right">{t("actions")}</th>
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
                        ৳{(svc.defaultPrice ?? svc.price ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {(svc.serviceDuration ?? svc.durationMinutes) ? `${svc.serviceDuration ?? svc.durationMinutes} m` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {svc.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {t("active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <XCircle className="h-3.5 w-3.5" /> {t("inactive")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditServiceModal(svc)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title={t("edit")}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                          title={t("delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      {t("no_services_found")}
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
                  <th className="px-5 py-3">{t("name")}</th>
                  <th className="px-5 py-3">{t("category_label")}</th>
                  <th className="px-5 py-3">{t("sample_type")}</th>
                  <th className="px-5 py-3">{t("price")}</th>
                  <th className="px-5 py-3">{t("turnaround_time")}</th>
                  <th className="px-5 py-3">{t("status")}</th>
                  <th className="px-5 py-3 text-right">{t("actions")}</th>
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
                        ~{test.turnaroundHours ?? 24} h
                      </td>
                      <td className="px-5 py-4">
                        {test.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {t("active")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <XCircle className="h-3.5 w-3.5" /> {t("inactive")}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditTestModal(test)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          title={t("edit")}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                          title={t("delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      {t("no_tests_in_catalog")}
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
              {editingService ? t("edit") : t("add_service_btn")}
            </h2>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("name")} *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Doctor Consultation Fee / Injection Setup"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t("category_label")}</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="CONSULTATION">CONSULTATION</option>
                    <option value="NURSING">NURSING</option>
                    <option value="BED">BED</option>
                    <option value="OPERATION">OPERATION</option>
                    <option value="MEDICINE">MEDICINE</option>
                    <option value="MEDICAL_SUPPLY">MEDICAL SUPPLY</option>
                    <option value="SERVICE">SERVICE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("price")} *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="৳"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t("department")}</label>
                  <input
                    type="text"
                    value={serviceForm.department}
                    onChange={(e) => setServiceForm({ ...serviceForm, department: e.target.value })}
                    placeholder="General, Dental, OPD"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("duration_mins")}</label>
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
                <label className="block text-xs font-semibold mb-1">{t("description")}</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingService || isUpdatingService}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  {t("save")}
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
              {editingTest ? t("edit") : t("add_test_btn")}
            </h2>
            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("name")} *</label>
                <input
                  type="text"
                  required
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  placeholder="Ultrasonography Whole Abdomen / CBC"
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t("category_label")}</label>
                  <select
                    value={testForm.category}
                    onChange={(e) => setTestForm({ ...testForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="RADIOLOGY">RADIOLOGY</option>
                    <option value="PATHOLOGY">PATHOLOGY</option>
                    <option value="CARDIOLOGY">CARDIOLOGY</option>
                    <option value="BIOCHEMISTRY">BIOCHEMISTRY</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("price")} *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={testForm.price}
                    onChange={(e) => setTestForm({ ...testForm, price: e.target.value })}
                    placeholder="৳"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t("sample_type")}</label>
                  <input
                    type="text"
                    value={testForm.sampleType}
                    onChange={(e) => setTestForm({ ...testForm, sampleType: e.target.value })}
                    placeholder="Blood / Urine / None"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("turnaround_time")}</label>
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
                <label className="block text-xs font-semibold mb-1">{t("instructions")}</label>
                <input
                  type="text"
                  value={testForm.preparationInstructions}
                  onChange={(e) =>
                    setTestForm({ ...testForm, preparationInstructions: e.target.value })
                  }
                  placeholder="..."
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTest || isUpdatingTest}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
