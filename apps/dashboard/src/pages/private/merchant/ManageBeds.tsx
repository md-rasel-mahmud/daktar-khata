import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetBedsQuery,
  useGetWardsQuery,
  useGetRoomsQuery,
  useCreateBedMutation,
  useDeleteBedMutation,
  useUpdateBedStatusMutation,
  useGetBedAvailabilitySummaryQuery,
  useCreateWardMutation,
  useUpdateWardMutation,
  useDeleteWardMutation,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "@/lib/store/api/services/admission.service"
import type { WardItem, RoomItem } from "@/lib/store/api/services/admission.service"
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
  Edit2,
  Trash2,
  Building,
  DoorOpen,
  Home,
} from "lucide-react"

export default function ManageBeds() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"beds" | "wards_rooms">("beds")

  // Filters for Beds Tab
  const [selectedWard, setSelectedWard] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Filter for Rooms in Wards/Rooms Tab
  const [roomWardFilter, setRoomWardFilter] = useState<string>("")

  // Modals state
  const [isAddBedOpen, setIsAddBedOpen] = useState(false)
  const [isWardModalOpen, setIsWardModalOpen] = useState(false)
  const [editingWard, setEditingWard] = useState<WardItem | null>(null)

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null)

  // Forms state
  const [bedForm, setBedForm] = useState({
    bedNumber: "",
    ward: "",
    room: "",
    dailyCharge: "500",
  })

  const [wardForm, setWardForm] = useState({
    name: "",
    description: "",
    isActive: true,
  })

  const [roomForm, setRoomForm] = useState({
    name: "",
    ward: "",
    floor: "",
    roomType: "General",
    isActive: true,
  })

  // Queries
  const { data: summary, refetch: refetchSummary } = useGetBedAvailabilitySummaryQuery()
  const { data: wards = [], refetch: refetchWards } = useGetWardsQuery()
  const { data: rooms = [], refetch: refetchRooms } = useGetRoomsQuery(
    bedForm.ward ? { wardId: bedForm.ward } : undefined
  )
  const { data: allRooms = [], refetch: refetchAllRooms } = useGetRoomsQuery(
    roomWardFilter ? { wardId: roomWardFilter } : undefined
  )
  const { data: beds = [], refetch: refetchBeds } = useGetBedsQuery({
    wardId: selectedWard || undefined,
    status: statusFilter || undefined,
  })

  // Mutations
  const [createBed, { isLoading: isCreatingBed }] = useCreateBedMutation()
  const [deleteBed] = useDeleteBedMutation()
  const [updateStatus] = useUpdateBedStatusMutation()

  const [createWard, { isLoading: isCreatingWard }] = useCreateWardMutation()
  const [updateWard, { isLoading: isUpdatingWard }] = useUpdateWardMutation()
  const [deleteWard] = useDeleteWardMutation()

  const [createRoom, { isLoading: isCreatingRoom }] = useCreateRoomMutation()
  const [updateRoom, { isLoading: isUpdatingRoom }] = useUpdateRoomMutation()
  const [deleteRoom] = useDeleteRoomMutation()

  // Handle Bed Create
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

  // Handle Bed Delete
  const handleDeleteBed = async (bedId: string) => {
    if (!confirm(t("delete_confirm"))) return
    try {
      await deleteBed(bedId).unwrap()
      toast.success(t("bed_deleted_success"))
      refetchBeds()
      refetchSummary()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_to_update"))
    }
  }

  // Handle Bed Status Change
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

  // Handle Ward Submit
  const handleWardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wardForm.name.trim()) {
      toast.error(t("ward_name_req"))
      return
    }

    try {
      if (editingWard) {
        await updateWard({
          id: editingWard._id,
          body: {
            name: wardForm.name,
            description: wardForm.description,
            isActive: wardForm.isActive,
          },
        }).unwrap()
        toast.success(t("ward_updated_success"))
      } else {
        await createWard({
          name: wardForm.name,
          description: wardForm.description,
          isActive: wardForm.isActive,
        }).unwrap()
        toast.success(t("ward_created_success"))
      }

      setIsWardModalOpen(false)
      setEditingWard(null)
      setWardForm({ name: "", description: "", isActive: true })
      refetchWards()
      refetchSummary()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_to_update"))
    }
  }

  const openEditWardModal = (ward: WardItem) => {
    setEditingWard(ward)
    setWardForm({
      name: ward.name,
      description: ward.description || "",
      isActive: ward.isActive ?? true,
    })
    setIsWardModalOpen(true)
  }

  const handleDeleteWard = async (wardId: string) => {
    if (!confirm(t("delete_confirm"))) return
    try {
      await deleteWard(wardId).unwrap()
      toast.success(t("ward_deleted_success"))
      refetchWards()
      refetchAllRooms()
      refetchBeds()
      refetchSummary()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_to_update"))
    }
  }

  // Handle Room Submit
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomForm.name.trim() || !roomForm.ward) {
      toast.error(t("room_name_req"))
      return
    }

    try {
      if (editingRoom) {
        await updateRoom({
          id: editingRoom._id,
          body: {
            name: roomForm.name,
            ward: roomForm.ward,
            floor: roomForm.floor,
            roomType: roomForm.roomType,
            isActive: roomForm.isActive,
          },
        }).unwrap()
        toast.success(t("room_updated_success"))
      } else {
        await createRoom({
          name: roomForm.name,
          ward: roomForm.ward,
          floor: roomForm.floor,
          roomType: roomForm.roomType,
          isActive: roomForm.isActive,
        }).unwrap()
        toast.success(t("room_created_success"))
      }

      setIsRoomModalOpen(false)
      setEditingRoom(null)
      setRoomForm({ name: "", ward: "", floor: "", roomType: "General", isActive: true })
      refetchAllRooms()
      refetchRooms()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_to_update"))
    }
  }

  const openEditRoomModal = (room: RoomItem) => {
    setEditingRoom(room)
    setRoomForm({
      name: room.name,
      ward: typeof room.ward === "object" ? room.ward?._id : room.ward,
      floor: (room as any).floor || "",
      roomType: (room as any).roomType || room.type || "General",
      isActive: (room as any).isActive ?? true,
    })
    setIsRoomModalOpen(true)
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm(t("delete_confirm"))) return
    try {
      await deleteRoom(roomId).unwrap()
      toast.success(t("room_deleted_success"))
      refetchAllRooms()
      refetchRooms()
      refetchBeds()
    } catch (err: any) {
      toast.error(err?.data?.message || t("failed_to_update"))
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

        <div className="flex items-center gap-2">
          {activeTab === "beds" ? (
            <button
              onClick={() => setIsAddBedOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
            >
              <Plus className="h-4 w-4" />
              {t("new_bed")}
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditingWard(null)
                  setWardForm({ name: "", description: "", isActive: true })
                  setIsWardModalOpen(true)
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition"
              >
                <Plus className="h-4 w-4" />
                {t("new_ward_btn")}
              </button>
              <button
                onClick={() => {
                  setEditingRoom(null)
                  setRoomForm({
                    name: "",
                    ward: wards[0]?._id || "",
                    floor: "",
                    roomType: "General",
                    isActive: true,
                  })
                  setIsRoomModalOpen(true)
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-sm shadow transition border"
              >
                <Plus className="h-4 w-4" />
                {t("new_room_btn")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-4">
        <button
          onClick={() => setActiveTab("beds")}
          className={`pb-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === "beds"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bed className="h-4 w-4" />
          {t("bed_matrix_tab")}
        </button>
        <button
          onClick={() => setActiveTab("wards_rooms")}
          className={`pb-3 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === "wards_rooms"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="h-4 w-4" />
          {t("wards_rooms_tab")}
        </button>
      </div>

      {/* TAB 1: BEDS MATRIX */}
      {activeTab === "beds" && (
        <div className="space-y-6">
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
                <div className="text-3xl font-black text-emerald-600 mt-1">{summary?.available ?? 0}</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-red-600 uppercase">{t("occupied_beds")}</div>
                <div className="text-3xl font-black text-red-600 mt-1">{summary?.occupied ?? 0}</div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-600 uppercase">{t("cleaning_prep")}</div>
                <div className="text-3xl font-black text-amber-600 mt-1">
                  {(summary?.cleaning ?? 0) + (summary?.maintenance ?? 0)}
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-card border shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{t("filter_beds")}:</span>
            </div>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-1.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("all_wards")}</option>
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("all_status")}</option>
              <option value="AVAILABLE">{t("status_available")}</option>
              <option value="OCCUPIED">{t("status_occupied")}</option>
              <option value="CLEANING">{t("status_cleaning")}</option>
              <option value="MAINTENANCE">{t("status_maintenance")}</option>
            </select>

            <button
              onClick={() => {
                refetchBeds()
                refetchSummary()
              }}
              className="ml-auto p-2 rounded-xl hover:bg-muted text-muted-foreground transition"
              title={t("refresh")}
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
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteBed(b._id)}
                            title={t("delete_bed")}
                            className="text-muted-foreground hover:text-red-500 p-0.5 rounded transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
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
        </div>
      )}

      {/* TAB 2: WARDS & ROOMS MANAGEMENT */}
      {activeTab === "wards_rooms" && (
        <div className="space-y-8">
          {/* SECTION 1: WARDS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  {t("wards_list")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {wards.length} {t("ward")}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingWard(null)
                  setWardForm({ name: "", description: "", isActive: true })
                  setIsWardModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("new_ward_btn")}
              </button>
            </div>

            {wards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {wards.map((ward) => {
                  const wardRooms = allRooms.filter(
                    (r) => (typeof r.ward === "object" ? r.ward?._id : r.ward) === ward._id
                  )
                  return (
                    <div
                      key={ward._id}
                      className="p-5 rounded-2xl bg-card border shadow-sm flex flex-col justify-between hover:border-primary/40 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-base text-foreground">{ward.name}</h3>
                            {ward.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {ward.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ward.isActive !== false
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {ward.isActive !== false ? t("active") : t("inactive")}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-3 border-t">
                          <span className="flex items-center gap-1">
                            <DoorOpen className="h-3.5 w-3.5 text-primary" />
                            {wardRooms.length} {t("rooms_in_ward")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
                        <button
                          onClick={() => openEditWardModal(ward)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-muted text-xs font-semibold text-muted-foreground transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          {t("edit")}
                        </button>
                        <button
                          onClick={() => handleDeleteWard(ward._id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-500/10 text-xs font-semibold text-red-500 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("delete")}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-card border rounded-2xl">
                {t("no_wards_found")}
              </div>
            )}
          </div>

          {/* SECTION 2: ROOMS */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  {t("rooms_list")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {allRooms.length} {t("room")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={roomWardFilter}
                  onChange={(e) => setRoomWardFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("all_wards")}</option>
                  {wards.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setEditingRoom(null)
                    setRoomForm({
                      name: "",
                      ward: roomWardFilter || wards[0]?._id || "",
                      floor: "",
                      roomType: "General",
                      isActive: true,
                    })
                    setIsRoomModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("new_room_btn")}
                </button>
              </div>
            </div>

            {allRooms.length > 0 ? (
              <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">{t("room")}</th>
                      <th className="py-3 px-4">{t("ward")}</th>
                      <th className="py-3 px-4">{t("floor_label")}</th>
                      <th className="py-3 px-4">{t("room_type_lbl")}</th>
                      <th className="py-3 px-4">{t("status")}</th>
                      <th className="py-3 px-4 text-right">{t("action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {allRooms.map((room) => {
                      const wardObj =
                        typeof room.ward === "object"
                          ? room.ward
                          : wards.find((w) => w._id === room.ward)

                      return (
                        <tr key={room._id} className="hover:bg-muted/30 transition">
                          <td className="py-3 px-4 font-bold text-foreground">
                            {room.name || `Room ${room.roomNumber}`}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {wardObj?.name || "—"}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {(room as any).floor || "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]">
                              {(room as any).roomType || room.type || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                (room as any).isActive !== false
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {(room as any).isActive !== false ? t("active") : t("inactive")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditRoomModal(room)}
                                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                                title={t("edit")}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room._id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition"
                                title={t("delete")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground bg-card border rounded-2xl">
                {t("no_rooms_found")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT WARD */}
      {isWardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {editingWard ? t("edit_ward") : t("new_ward_btn")}
            </h2>
            <form onSubmit={handleWardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("ward_name_req")}</label>
                <input
                  type="text"
                  required
                  value={wardForm.name}
                  onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })}
                  placeholder={t("ward_name_ph")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t("description")}</label>
                <textarea
                  rows={2}
                  value={wardForm.description}
                  onChange={(e) => setWardForm({ ...wardForm, description: e.target.value })}
                  placeholder={t("ward_name_ph")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="wardIsActive"
                  checked={wardForm.isActive}
                  onChange={(e) => setWardForm({ ...wardForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="wardIsActive" className="text-xs font-medium cursor-pointer">
                  {t("active")}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsWardModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWard || isUpdatingWard}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  {editingWard ? t("update") : t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ROOM */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" />
              {editingRoom ? t("edit_room") : t("new_room_btn")}
            </h2>
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t("select_ward_req")}</label>
                <select
                  required
                  value={roomForm.ward}
                  onChange={(e) => setRoomForm({ ...roomForm, ward: e.target.value })}
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
                <label className="block text-xs font-semibold mb-1">{t("room_name_req")}</label>
                <input
                  type="text"
                  required
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  placeholder={t("room_name_ph")}
                  className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t("floor_label")}</label>
                  <input
                    type="text"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    placeholder={t("floor_ph")}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t("room_type_lbl")}</label>
                  <input
                    type="text"
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    placeholder={t("room_type_ph")}
                    className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="roomIsActive"
                  checked={roomForm.isActive}
                  onChange={(e) => setRoomForm({ ...roomForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="roomIsActive" className="text-xs font-medium cursor-pointer">
                  {t("active")}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted text-sm font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRoom || isUpdatingRoom}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow hover:bg-primary/90 transition"
                >
                  {editingRoom ? t("update") : t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  disabled={isCreatingBed}
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
