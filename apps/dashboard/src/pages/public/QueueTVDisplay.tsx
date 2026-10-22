import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router"
import {
  useGetPublicQueueSnapshotQuery,
  useGetPublicTestStationSnapshotQuery,
  useGetMultiDoctorQueueSummaryQuery,
} from "@/lib/store/api/services/queue.service"
import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { playWaitingChime } from "@/lib/audio-chime"
import { useTranslation } from "react-i18next"
import {
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Stethoscope,
  Activity,
  Users,
  Clock,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react"

export default function QueueTVDisplay() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const doctorId = searchParams.get("doctor") || ""
  const testStation = searchParams.get("test") || ""
  const viewMode = searchParams.get("view") || (doctorId ? "doctor" : testStation ? "test" : "all")

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const lastSerialRef = useRef<number | string | null>(null)

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Queries with polling fallback every 15s
  const {
    data: doctorSnapshot,
    refetch: refetchDoctor,
  } = useGetPublicQueueSnapshotQuery(doctorId, {
    skip: !doctorId || viewMode === "test",
    pollingInterval: 15000,
  })

  const {
    data: testSnapshot,
    refetch: refetchTest,
  } = useGetPublicTestStationSnapshotQuery(
    { station: testStation },
    {
      skip: !testStation || viewMode === "doctor",
      pollingInterval: 15000,
    }
  )

  const {
    data: multiDoctors,
    refetch: refetchMulti,
  } = useGetMultiDoctorQueueSummaryQuery(undefined, {
    skip: viewMode !== "all",
    pollingInterval: 15000,
  })

  // Socket.IO Real-time updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL
      ? new URL(import.meta.env.VITE_API_BASE_URL).origin
      : "http://localhost:7711"

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
    })
    socketRef.current = socket

    socket.on("connect", () => {
      setIsConnected(true)
      if (doctorId) socket.emit("joinDoctorRoom", doctorId)
      if (testStation) socket.emit("joinTestRoom", testStation)
      socket.emit("joinWaitingHall")
    })

    socket.on("disconnect", () => setIsConnected(false))

    socket.on("queue_updated", (payload: any) => {
      if (refetchDoctor) refetchDoctor()
      if (refetchMulti) refetchMulti()

      // Play chime if serial changed
      if (payload?.current?.serial && payload.current.serial !== lastSerialRef.current) {
        lastSerialRef.current = payload.current.serial
        if (soundEnabled) playWaitingChime()
      }
    })

    socket.on("test_queue_updated", (payload: any) => {
      if (refetchTest) refetchTest()

      if (payload?.current?.tokenNumber && payload.current.tokenNumber !== lastSerialRef.current) {
        lastSerialRef.current = payload.current.tokenNumber
        if (soundEnabled) playWaitingChime()
      }
    })

    return () => {
      if (doctorId) socket.emit("leaveDoctorRoom", doctorId)
      if (testStation) socket.emit("leaveTestRoom", testStation)
      socket.disconnect()
    }
  }, [doctorId, testStation, soundEnabled, refetchDoctor, refetchTest, refetchMulti])

  // Detect serial change via polling as well
  useEffect(() => {
    if (doctorSnapshot?.current?.serial) {
      if (
        lastSerialRef.current !== null &&
        lastSerialRef.current !== doctorSnapshot.current.serial &&
        soundEnabled
      ) {
        playWaitingChime()
      }
      lastSerialRef.current = doctorSnapshot.current.serial
    }
  }, [doctorSnapshot?.current?.serial, soundEnabled])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const locale = i18n.language === "bn" ? "bn-BD" : "en-US"
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const formattedDate = currentTime.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <header className="px-8 py-4 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {t("app_name")} <span className="text-cyan-400">{t("waiting_room_display")}</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {doctorSnapshot?.clinicName || t("clinic_directory_badge")}
            </p>
          </div>
        </div>

        {/* Live Clock & Connection Pill */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold">
            {isConnected ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t("live_connected")}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400">{t("auto_refresh")}</span>
              </>
            )}
          </div>

          <div className="text-right">
            <div className="text-2xl font-mono font-bold tracking-wider text-cyan-300">
              {formattedTime}
            </div>
            <div className="text-xs text-slate-400">{formattedDate}</div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? t("mute_sound") : t("unmute_sound")}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5 text-cyan-400" /> : <VolumeX className="h-5 w-5 text-slate-500" />}
            </button>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? t("exit_fullscreen") : t("fullscreen_tv")}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main TV Screen Content */}
      <main className="flex-1 p-8 overflow-y-auto flex flex-col justify-center">
        {/* MODE A: DOCTOR CHAMBER DISPLAY */}
        {viewMode === "doctor" && (
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Col: Giant Currently Consulting Card */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border-2 border-cyan-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Activity className="w-64 h-64 text-cyan-400" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-sm mb-4">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    {t("now_in_consultation")}
                  </div>
                  <h2 className="text-3xl font-black text-white">
                    {doctorSnapshot?.doctorName || t("doctor_chamber")}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {doctorSnapshot?.specialization?.join(", ") || t("doctor")}
                  </p>
                </div>

                {/* Giant Serial Display */}
                <div className="my-8 text-center py-10 bg-slate-950/60 rounded-3xl border border-slate-800/80 shadow-inner">
                  <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
                    {t("running_serial")}
                  </span>
                  <div className="text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_10px_20px_rgba(6,182,212,0.3)] my-2">
                    {doctorSnapshot?.current ? `#${doctorSnapshot.current.serial}` : t("waiting")}
                  </div>
                  <div className="inline-block mt-2 px-6 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-base">
                    {doctorSnapshot?.current?.status === "CALLED"
                      ? `🔔 ${t("called_enter")}`
                      : doctorSnapshot?.current?.status === "IN_CONSULTATION"
                      ? t("in_consultation")
                      : t("calling_patient_dots")}
                  </div>
                </div>

                {/* Summary Info */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center">
                  <div className="bg-slate-950/40 rounded-xl p-3">
                    <div className="text-xs text-slate-400 font-medium">{t("waiting_patients")}</div>
                    <div className="text-2xl font-bold text-amber-400 mt-1">
                      {doctorSnapshot?.waitingCount ?? 0}
                    </div>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3">
                    <div className="text-xs text-slate-400 font-medium">{t("completed_today")}</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">
                      {doctorSnapshot?.completedCount ?? 0}
                    </div>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3">
                    <div className="text-xs text-slate-400 font-medium">{t("avg_consultation")}</div>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">
                      ~{doctorSnapshot?.avgConsultationMinutes ?? 10} {t("minutes")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Next 2 Upcoming Serials */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Next in Line Cards */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-400" />
                    {t("next_patients")}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {t("be_ready")}
                  </span>
                </div>

                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  {/* Next 1st */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-800/80 to-slate-800/50 border-2 border-amber-500/50 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
                        {t("first_serial")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {t("serial")}
                        </div>
                        <div className="text-4xl font-black text-white mt-0.5">
                          {doctorSnapshot?.waitingSerials?.[0]
                            ? `#${doctorSnapshot.waitingSerials[0]}`
                            : t("nobody")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400 font-medium">
                      {t("stand_by_door")}
                    </div>
                  </div>

                  {/* Next 2nd */}
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-700 text-slate-200 font-bold text-xl flex items-center justify-center">
                        {t("second_serial")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {t("serial")}
                        </div>
                        <div className="text-4xl font-black text-slate-200 mt-0.5">
                          {doctorSnapshot?.waitingSerials?.[1]
                            ? `#${doctorSnapshot.waitingSerials[1]}`
                            : t("nobody")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500 font-medium">
                      {t("sit_in_waiting")}
                    </div>
                  </div>
                </div>

                {/* Queue Strip for other numbers */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 mb-2">
                    {t("upcoming_serials")}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctorSnapshot?.waitingSerials && doctorSnapshot.waitingSerials.length > 2 ? (
                      doctorSnapshot.waitingSerials.slice(2, 12).map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-sm font-bold text-slate-300"
                        >
                          #{s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">{t("no_additional_serials")}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE B: DIAGNOSTIC TEST ROOM DISPLAY */}
        {viewMode === "test" && (
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Col: Giant Currently Serving Test Token */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold text-sm mb-4">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    {t("diagnostic_station")}
                  </div>
                  <h2 className="text-3xl font-black text-white">
                    {testStation || t("services_tests")}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {t("enter_by_serial")}
                  </p>
                </div>

                <div className="my-8 text-center py-10 bg-slate-950/60 rounded-3xl border border-slate-800/80 shadow-inner">
                  <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
                    {t("running_token")}
                  </span>
                  <div className="text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-200 to-indigo-400 drop-shadow-[0_10px_20px_rgba(99,102,241,0.3)] my-2">
                    {testSnapshot?.current ? `#${testSnapshot.current.tokenNumber}` : t("waiting")}
                  </div>
                  <div className="inline-block mt-2 px-6 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-base">
                    {testSnapshot?.current ? t("in_consultation") : t("calling_patient_dots")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-center">
                  <div className="bg-slate-950/40 rounded-xl p-3">
                    <div className="text-xs text-slate-400 font-medium">{t("waiting_patients")}</div>
                    <div className="text-2xl font-bold text-amber-400 mt-1">
                      {testSnapshot?.waitingCount ?? 0}
                    </div>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3">
                    <div className="text-xs text-slate-400 font-medium">{t("completed_today")}</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">
                      {testSnapshot?.completedCount ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Next Test Tokens */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    {t("next_patients")}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {t("be_ready")}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-slate-800/80 to-slate-800/50 border-2 border-indigo-500/50 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                        {t("first_serial")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          {t("token")}
                        </div>
                        <div className="text-4xl font-black text-white mt-0.5">
                          {testSnapshot?.next?.tokenNumber ? `#${testSnapshot.next.tokenNumber}` : t("nobody")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400 font-medium">
                      {t("stand_by_door")}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-700 text-slate-200 font-bold text-xl flex items-center justify-center">
                        {t("second_serial")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {t("token")}
                        </div>
                        <div className="text-4xl font-black text-slate-200 mt-0.5">
                          {testSnapshot?.nextSecond?.tokenNumber
                            ? `#${testSnapshot.nextSecond.tokenNumber}`
                            : t("nobody")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500 font-medium">
                      {t("sit_in_waiting")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE C: CENTRAL WAITING HALL MULTI-COUNTER GRID */}
        {viewMode === "all" && (
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                  {t("central_board_title")}
                </h2>
                <p className="text-sm text-slate-400">
                  {t("follow_your_serial")}
                </p>
              </div>
            </div>

            {multiDoctors && multiDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {multiDoctors.map((doc) => (
                  <div
                    key={doc.doctorId}
                    className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all rounded-3xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {t("chamber_serial")}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {t("waiting")}: {doc.waitingCount}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-1">
                        {doc.doctorName}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mb-4">
                        {doc.specialization?.join(", ") || t("doctor")}
                      </p>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-center my-3">
                      <div className="text-xs font-semibold text-slate-400 uppercase">
                        {t("now_seeing_doctor")}
                      </div>
                      <div className="text-5xl font-black text-cyan-400 my-1">
                        {doc.current ? `#${doc.current.serial}` : "—"}
                      </div>
                      <div className="text-xs font-medium text-emerald-400">
                        {doc.current ? doc.current.status : t("waiting")}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{t("upcoming_serials")}:</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {doc.next ? `#${doc.next.serial}` : "—"}
                        </span>
                        {doc.waitingSerials?.[1] && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            #{doc.waitingSerials[1]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
                <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {t("no_active_queues")}
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  {t("no_active_queues_sub")}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Ticker / Note */}
      <footer className="px-8 py-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
        <div>
          {t("queue_ticker_notice")}
        </div>
        <div className="font-semibold text-slate-500">Daktar Khata Smart Waiting Display v2.0</div>
      </footer>
    </div>
  )
}
