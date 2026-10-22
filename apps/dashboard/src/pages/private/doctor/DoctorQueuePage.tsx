import React, { useState } from "react"
import {
  useGetTodayQueueQuery,
  useCallNextPatientMutation,
  useUpdateQueueStatusMutation,
  useSetEmergencyMutation,
} from "@/lib/store/api/services/queue.service"
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
      toast.success("পরবর্তী রোগীকে সফলভাবে কল করা হয়েছে!")
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || "রোগী কল করা যায়নি")
    }
  }

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await updateStatus({ appointmentId, queueStatus: status }).unwrap()
      toast.success(`সিরিয়াল স্ট্যাটাস পরিবর্তিত হয়েছে: ${status}`)
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে")
    }
  }

  const handleToggleEmergency = async (appointmentId: string, current: boolean) => {
    try {
      await setEmergency({ appointmentId, isEmergency: !current }).unwrap()
      toast.success(!current ? "রোগীকে জরুরি চিহ্নিত করা হয়েছে" : "জরুরি ফ্ল্যাগ সরানো হয়েছে")
      refetch()
    } catch (err: any) {
      toast.error(err?.data?.message || "জরুরি ফ্ল্যাগ পরিবর্তন করা যায়নি")
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
          <h1 className="text-2xl font-bold tracking-tight">লাইভ চেম্বার কিউ ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground">
            আপনার চেম্বারে আসা রোগীদের সিরিয়াল পরিচালনা করুন ও টিভিতে লাইভ প্রদর্শন করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={openTVDisplay}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm shadow transition"
          >
            <Tv className="h-4 w-4" />
            ওয়েটিং রুম টিভি ডিসপ্লে ওপেন করুন
          </button>
        </div>
      </div>

      {/* Hero: Current Patient in Consultation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold">বর্তমান কনসালটেশন</h2>
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
                    সিরিয়াল
                  </span>
                  <span className="text-4xl">#{currentPatient.serialNumber}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {currentPatient.patient?.name || "পেশেন্ট নাম"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {currentPatient.patient?.mobile || "N/A"}
                    </span>
                    <span>•</span>
                    <span>লিঙ্গ: {currentPatient.patient?.gender || "N/A"}</span>
                    <span>•</span>
                    <span>রক্ত: {currentPatient.patient?.bloodGroup || "N/A"}</span>
                  </div>
                  {currentPatient.isEmergency && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      <AlertTriangle className="h-3 w-3" /> জরুরি রোগী
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
                    কনসালটেশন শুরু
                  </button>
                )}

                <button
                  onClick={() => handleUpdateStatus(currentPatient._id, "COMPLETED")}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition"
                >
                  <CheckCircle className="h-4 w-4" />
                  সম্পন্ন করুন
                </button>

                <button
                  onClick={() => handleUpdateStatus(currentPatient._id, "SKIPPED")}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border hover:bg-muted text-muted-foreground text-sm transition"
                >
                  <SkipForward className="h-4 w-4" />
                  স্কিপ
                </button>
              </div>
            </div>
          ) : (
            <div className="my-10 text-center py-6">
              <User className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold">বর্তমানে কোনো রোগী কনসালটেশনে নেই</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                ওয়েটিং লাইন থেকে পরবর্তী রোগীকে কল করতে নিচের বাটনে চাপুন।
              </p>
              <button
                onClick={handleCallNext}
                disabled={isCalling}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow transition"
              >
                <Bell className="h-4 w-4" />
                পরবর্তী রোগীকে ডাকুন
              </button>
            </div>
          )}
        </div>

        {/* Queue Stats Card */}
        <div className="lg:col-span-4 bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              আজকের পরিসংখ্যান
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-sm text-muted-foreground">মোট অ্যাপয়েন্টমেন্ট</span>
                <span className="font-bold text-foreground">{queueData?.stats?.total ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium text-amber-500">অপেক্ষমাণ রোগী</span>
                <span className="font-bold text-amber-500">{queueData?.stats?.waiting ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm font-medium text-emerald-500">সম্পন্ন হয়েছে</span>
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
            পরবর্তী রোগী কল করুন (Call Next)
          </button>
        </div>
      </div>

      {/* Today's Queue Table */}
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            আজকের সিরিয়াল তালিকা ({items.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-5 py-3">সিরিয়াল</th>
                <th className="px-5 py-3">রোগীর নাম</th>
                <th className="px-5 py-3">মোবাইল</th>
                <th className="px-5 py-3">স্ট্যাটাস</th>
                <th className="px-5 py-3">জরুরি</th>
                <th className="px-5 py-3 text-right">অ্যাকশন</th>
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
                          {app.isEmergency ? "🚨 জরুরি" : "স্বাভাবিক"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {app.queueStatus === "WAITING" && (
                          <button
                            onClick={() => handleUpdateStatus(app._id, "CALLED")}
                            className="px-3 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium"
                          >
                            কল করুন
                          </button>
                        )}
                        {app.queueStatus === "CALLED" && (
                          <button
                            onClick={() => handleUpdateStatus(app._id, "IN_CONSULTATION")}
                            className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                          >
                            শুরু করুন
                          </button>
                        )}
                        {app.queueStatus === "IN_CONSULTATION" && (
                          <button
                            onClick={() => handleUpdateStatus(app._id, "COMPLETED")}
                            className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium"
                          >
                            সম্পন্ন
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    আজকের জন্য কোনো অ্যাপয়েন্টমেন্ট বা সিরিয়াল নেই
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
