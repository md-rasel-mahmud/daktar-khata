import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetBedsQuery,
  useGetWardsQuery,
  useGetRoomsQuery,
  useCreateBedMutation,
  useUpdateBedStatusMutation,
  useGetBedAvailabilitySummaryQuery,
} from "@/lib/store/api/services/admission.service"
import type { BedItem } from "@/lib/store/api/services/admission.service"
import { toast } from "sonner"
import {
  Bed,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Filter,
} from "lucide-react"

export default function ManageBeds() {
  const { t } = useTranslation()
  const [selectedWard, setSelectedWard] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const [isAddBedOpen, setIsAddBedOpen] = useState(false)
  const [bedForm, setBedForm] = useState({
    bedNumber: "",
    ward: "",
    room: "",
    dailyCharge: "500",
  })

  // Queries
  const { data: summary, refetch: refetchSummary } = useGetBedAvailabilitySummaryQuery()
  const { data: wards = [] } = useGetWardsQuery()
  const { data: rooms = [] } = useGetRoomsQuery(
    bedForm.ward ? { wardId: bedForm.ward } : undefined
  )
  const { data: beds = [], refetch: refetchBeds } = useGetBedsQuery({
    wardId: selectedWard || undefined,
    status: statusFilter || undefined,
  })

  const [createBed, { isLoading: isCreating }] = useCreateBedMutation()
  const [updateStatus] = useUpdateBedStatusMutation()

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bedForm.bedNumber || !bedForm.ward || !bedForm.room) {
      toast.error(t("select_ward_room_bed"))
      return
    }

    try {
      await createBed({
        bedNumber: bedForm.bedNumber,
        ward: bedForm.ward,
        room: bedForm.room,
        dailyCharge: parseFloat(bedForm.dailyCharge) || 500,
        status: "AVAILABLE",
      }).unwrap()

      toast.success(t("bed_created_success"))
      setIsAddBedOpen(false)
      setBedForm({ bedNumber: "", ward: "", room: "", dailyCharge: "500" })
      refetchBeds()
      refetchSummary()
    } catch (err: any) {
      toast.error(err?.data?.message || t("bed_create_failed"))
    }
  }

  const handleStatusChange = async (bedId: string, nextStatus: string) => {
    try {
      await updateStatus({ id: bedId, status: nextStatus }).unwrap()
      toast.success(`${t("bed_status_updated")} ${nextStatus}`)
      refetchBeds()
      refetchSummary()
    } catch {
      toast.error(t("bed_status_update_failed"))
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("bed_matrix_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("bed_matrix_desc")}</p>
        </div>

        <button
          onClick={() => setIsAddBedOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
        >
          <Plus className="h-4 w-4" />
          {t("new_bed")}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">{t("total_beds")}</div>
            <div className="text-3xl font-black text-foreground mt-1">{summary?.total ?? 0}</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Bed className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase">{t("available_beds")}</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {summary?.available ?? 0}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-red-600 uppercase">{t("occupied_beds")}</div>
            <div className="text-3xl font-black text-red-600 mt-1">
              {summary?.occupied ?? 0}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase">{t("cleaning_maintenance")}</div>
            <div className="text-3xl font-black text-amber-600 mt-1">
              {(summary?.cleaning ?? 0) + (summary?.maintenance ?? 0)}
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-card border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold">{t("filter_ward_lbl")}</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("all_wards")}</option>
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{t("status")}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("all_statuses")}</option>
              <option value="AVAILABLE">{t("status_available")}</option>
              <option value="OCCUPIED">{t("status_occupied")}</option>
              <option value="CLEANING">{t("status_cleaning")}</option>
              <option value="MAINTENANCE">{t("status_maintenance")}</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            refetchBeds()
            refetchSummary()
          }}
          className="p-2 rounded-lg border hover:bg-muted text-muted-foreground"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Visual Bed Grid Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {beds.length > 0 ? (
          beds.map((b) => {
            const isAvail = b.status === "AVAILABLE"
            const isOcc = b.status === "OCCUPIED"
            const isClean = (b.status as any) === "CLEANING"

            return (
              <div
                key={b._id}
                className={`p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
                  isAvail
                    ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500"
                    : isOcc
                    ? "bg-red-500/5 border-red-500/30 hover:border-red-500"
                    : "bg-amber-500/5 border-amber-500/30 hover:border-amber-500"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground line-clamp-1">
                      {b.ward?.name || "General"}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isAvail
                          ? "bg-emerald-500"
                          : isOcc
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    #{b.bedNumber}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {b.room?.name || "Room"}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span
                      className={`font-bold ${
                        isAvail
                          ? "text-emerald-600"
                          : isOcc
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {isAvail ? t("status_available") : isOcc ? t("status_occupied") : t("status_cleaning")}
                    </span>
                    <span className="text-muted-foreground">৳{b.dailyCharge ?? 500}</span>
                  </div>

                  {/* Quick Status Action */}
                  {isClean && (
                    <button
                      onClick={() => handleStatusChange(b._id, "AVAILABLE")}
                      className="w-full py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
                    >
                      {t("mark_available")}
                    </button>
                  )}
                  {isAvail && (
                    <button
                      onClick={() => handleStatusChange(b._id, "MAINTENANCE")}
                      className="w-full py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground text-xs transition"
                    >
                      {t("mark_maintenance")}
                    </button>
                  )}
                  {b.status === "MAINTENANCE" && (
                    <button
                      onClick={() => handleStatusChange(b._id, "AVAILABLE")}
                      className="w-full py-1 rounded bg-emerald-600 text-white font-semibold text-xs"
                    >
                      {t("mark_activate")}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-card border rounded-2xl">
            {t("no_beds_found")}
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW BED */}
      {isAddBedOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              {t("add_new_bed_modal")}
            </h2>
            <form onSubmit={handleCreateBed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("select_ward_req")}</label>
                <select
                  required
                  value={bedForm.ward}
                  onChange={(e) => setBedForm({ ...bedForm, ward: e.target.value, room: "" })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("choose_ward")}</option>
                  {wards.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t("select_room_req")}</label>
                <select
                  required
                  value={bedForm.room}
                  onChange={(e) => setBedForm({ ...bedForm, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("choose_room")}</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name || `Room ${r.roomNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t("bed_number_req")}</label>
                  <input
                    type="text"
                    required
                    value={bedForm.bedNumber}
                    onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })}
                    placeholder={t("bed_number_ph")}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("daily_charge_bdt")}</label>
                  <input
                    type="number"
                    value={bedForm.dailyCharge}
                    onChange={(e) => setBedForm({ ...bedForm, dailyCharge: e.target.value })}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddBedOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  {t("create_bed_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
