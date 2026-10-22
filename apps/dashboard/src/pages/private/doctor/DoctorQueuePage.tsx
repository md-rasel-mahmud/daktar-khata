import React, { useState } from "react"
import {
  useGetTodayQueueQuery,
  useCallNextPatientMutation,
  useUpdateQueueStatusMutation,
  useSetEmergencyMutation,
} from "@/lib/store/api/services/queue.service"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  Tv,
  Bell,
  CheckCircle,
  Play,
  SkipForward,
  AlertTriangle,
  RefreshCw,
  Clock,
  User,
  Activity,
  Phone,
} from "lucide-react"

export default function DoctorQueuePage() {
  const { t } = useTranslation()
  const { data: queueData, isLoading, refetch } = useGetTodayQueueQuery(undefined, {
    pollingInterval: 10000,
  })

  const [callNext, { isLoading: isCalling }] = useCallNextPatientMutation()
  const [updateStatus, { isLoading: isUpdating }] = useUpdateQueueStatusMutation()
  const [setEmergency] = useSetEmergencyMutation()

  const currentPatient = queueData?.current
  const items = queueData?.items || []
  const doctor = queueData?.doctor

  const handleCallNext = async () => {
    try {
      await callNext({ doctorId: doctor?._id }).unwrap()
      toast.success(t("patient_called_success"))
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("patient_call_failed"))
    }
  }

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await updateStatus({ appointmentId, queueStatus: status }).unwrap()
      toast.success(`${t("status")}: ${status}`)
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("cancel"))
    }
  }

  const handleToggleEmergency = async (appointmentId: string, current: boolean) => {
    try {
      await setEmergency({ appointmentId, isEmergency: !current }).unwrap()
      toast.success(!current ? t("emergency_patient") : t("normal"))
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || t("cancel"))
    }
  }

  const openTVDisplay = () => {
    if (!doctor?._id) return
    window.open(`/display/queue?doctor=${doctor._id}`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("doctor_queue_heading")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("doctor_queue_subheading")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title={t("filter")}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={openTVDisplay}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm shadow transition"
          >
            <Tv className="h-4 w-4" />
            {t("open_chamber_tv")}
          </button>
        </div>
      </div>

      {/* Hero: Current Patient in Consultation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold">{t("current_consultation")}</h2>
            </div>
            {currentPatient && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {currentPatient.queueStatus || "CALLED"}
              </span>
            )}
          </div>

          {currentPatient ? (
            <div className="my-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-24 w-24 rounded-2xl bg-primary/10 border-2 border-primary/30 text-primary flex flex-col items-center justify-center font-black">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {t("serial")}
                  </span>
                  <span className="text-4xl">#{currentPatient.serialNumber}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {currentPatient.patient?.name || t("patient")}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {currentPatient.patient?.mobile || "N/A"}
                    </span>
                    <span>•</span>
                    <span>{t("gender")}: {currentPatient.patient?.gender || "N/A"}</span>
                    <span>•</span>
                    <span>{t("blood_group")}: {currentPatient.patient?.bloodGroup || "N/A"}</span>
                  </div>
                  {currentPatient.isEmergency && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      <AlertTriangle className="h-3 w-3" /> {t("emergency_patient")}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for Current Patient */}
              <div className="flex flex-wrap items-center gap-2">
                {currentPatient.queueStatus !== "IN_CONSULTATION" && (
                  <button
                    onClick={() => handleUpdateStatus(currentPatient._id, "IN_CONSULTATION")}
                    disabled={isUpdating}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition"
                  >
                    <Play className="h-4 w-4" />
                    {t("start_consultation")}
                  </button>
                )}

                <button
                  onClick={() => handleUpdateStatus(currentPatient._id, "COMPLETED")}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t("complete")}
                </button>

                <button
                  onClick={() => handleUpdateStatus(currentPatient._id, "SKIPPED")}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border hover:bg-muted text-muted-foreground text-sm transition"
                >
                  <SkipForward className="h-4 w-4" />
                  {t("skip")}
                </button>
              </div>
            </div>
          ) : (
            <div className="my-10 text-center py-6">
              <User className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold">{t("no_patient_in_consultation")}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                {t("call_next_subtext")}
              </p>
              <button
                onClick={handleCallNext}
                disabled={isCalling}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow transition"
              >
                <Bell className="h-4 w-4" />
                {t("call_next_patient_btn")}
              </button>
            </div>
          )}
        </div>

        {/* Queue Stats Card */}
        <div className="lg:col-span-4 bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {t("todays_stats")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm text-muted-foreground">{t("total appointments")}</span>
                <span className="font-bold text-foreground">{queueData?.stats?.total ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium text-amber-500">{t("waiting_patients")}</span>
                <span className="font-bold text-amber-500">{queueData?.stats?.waiting ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm font-medium text-emerald-500">{t("completed_today")}</span>
                <span className="font-bold text-emerald-500">{queueData?.stats?.completed ?? 0}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCallNext}
            disabled={isCalling}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow transition"
          >
            <Bell className="h-4 w-4" />
            {t("call_next_patient")}
          </button>
        </div>
      </div>

      {/* Today's Queue Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {t("todays_serial_list")} ({items.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-3">{t("serial")}</th>
                <th className="px-5 py-3">{t("name")}</th>
                <th className="px-5 py-3">{t("phone")}</th>
                <th className="px-5 py-3">{t("status")}</th>
                <th className="px-5 py-3">{t("emergency")}</th>
                <th className="px-5 py-3 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length > 0 ? (
                items.map((app: any) => {
                  const isCurrent = currentPatient?._id === app._id
                  return (
                    <tr
                      key={app._id}
                      className={`hover:bg-muted/30 transition ${
                        isCurrent ? "bg-primary/5 font-semibold" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-base">#{app.serialNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground">
                          {app.patient?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {app.patient?.mobile || "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            app.queueStatus === "IN_CONSULTATION"
                              ? "bg-emerald-500/20 text-emerald-600"
                              : app.queueStatus === "CALLED"
                              ? "bg-cyan-500/20 text-cyan-600"
                              : app.queueStatus === "COMPLETED"
                              ? "bg-slate-500/20 text-slate-600"
                              : "bg-amber-500/20 text-amber-600"
                          }`}
                        >
                          {app.queueStatus || "WAITING"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleEmergency(app._id, !!app.isEmergency)}
                          className={`text-xs px-2 py-1 rounded font-bold transition ${
                            app.isEmergency
                              ? "bg-red-500 text-white"
                              : "bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-600"
                          }`}
                        >
                          {app.isEmergency ? `🚨 ${t("emergency")}` : t("normal")}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {app.queueStatus === "WAITING" && (
                          <button
                            onClick={() => handleUpdateStatus(app._id, "CALLED")}
                            className="px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium"
                          >
                            {t("call")}
                          </button>
                        )}
                        {app.queueStatus === "CALLED" && (
                          <button
                            onClick={() => handleUpdateStatus(app._id, "IN_CONSULTATION")}
                            className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                          >
                            {t("start")}
                          </button>
                        )}
                        {app.queueStatus === "IN_CONSULTATION" && (
                          <button
                            onClick={() => handleUpdateStatus(app._id, "COMPLETED")}
                            className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium"
                          >
                            {t("complete")}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t("no_appointments_today")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
