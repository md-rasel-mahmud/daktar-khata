import React, { useState } from "react"
import {
  useGetTodayQueueQuery,
  useCallNextPatientMutation,
  useUpdateQueueStatusMutation,
  useGetPublicTestStationSnapshotQuery,
  useCallNextStationTokenMutation,
} from "@/lib/store/api/services/queue.service"
import { useGetDoctorOptionsQuery } from "@/lib/store/api/services/doctor.service"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  Tv,
  Bell,
  Stethoscope,
  TestTube,
  RefreshCw,
  ExternalLink,
} from "lucide-react"

export default function MerchantQueuePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"doctors" | "tests">("doctors")
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")
  const [selectedStation, setSelectedStation] = useState<string>("Ultrasonography")

  const { data: doctorsData } = useGetDoctorOptionsQuery(undefined)
  const doctorsList = Array.isArray(doctorsData) ? doctorsData : (doctorsData as any)?.data || []

  // Default to first doctor
  React.useEffect(() => {
    if (doctorsList.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctorsList[0].value || doctorsList[0]._id)
    }
  }, [doctorsList, selectedDoctorId])

  const { data: queueData, refetch: refetchQueue } = useGetTodayQueueQuery(
    selectedDoctorId || undefined,
    { skip: !selectedDoctorId || activeTab !== "doctors", pollingInterval: 10000 }
  )

  const { data: testSnapshot, refetch: refetchTest } = useGetPublicTestStationSnapshotQuery(
    { station: selectedStation },
    { skip: activeTab !== "tests", pollingInterval: 10000 }
  )

  const [callNextPatient, { isLoading: isCallingPatient }] = useCallNextPatientMutation()
  const [callNextTest, { isLoading: isCallingTest }] = useCallNextStationTokenMutation()
  const [updateStatus] = useUpdateQueueStatusMutation()

  const handleCallDoctorPatient = async () => {
    if (!selectedDoctorId) return
    try {
      await callNextPatient({ doctorId: selectedDoctorId }).unwrap()
      toast.success(t("patient_called_success"))
      refetchQueue()
    } catch (err: any) {
      toast.error(err?.data?.message || t("patient_call_failed"))
    }
  }

  const handleCallTestToken = async () => {
    try {
      await callNextTest({ station: selectedStation }).unwrap()
      toast.success(`${selectedStation} - ${t("patient_called_success")}`)
      refetchTest()
    } catch (err: any) {
      toast.error(err?.data?.message || t("patient_call_failed"))
    }
  }

  const currentPatient = queueData?.current
  const items = queueData?.items || []

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("merchant_queue_title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("merchant_queue_desc")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.open("/display/queue?view=all", "_blank")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm shadow transition"
          >
            <Tv className="h-4 w-4" />
            {t("open_central_tv")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("doctors")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition ${
            activeTab === "doctors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          {t("doctor_chamber_queue")}
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition ${
            activeTab === "tests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TestTube className="h-4 w-4" />
          {t("diagnostic_station_queue")}
        </button>
      </div>

      {/* TAB 1: DOCTORS QUEUE */}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          {/* Doctor Selector */}
          <div className="bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{t("select_doctor")}:</span>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {doctorsList.map((doc: any) => (
                  <option key={doc.value || doc._id} value={doc.value || doc._id}>
                    {doc.label || doc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchQueue()}
                className="p-2 rounded-lg border hover:bg-muted text-muted-foreground"
                title={t("filter")}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              {selectedDoctorId && (
                <button
                  onClick={() => window.open(`/display/queue?doctor=${selectedDoctorId}`, "_blank")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-muted text-xs font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t("open_chamber_tv")}
                </button>
              )}
            </div>
          </div>

          {/* Current Serving & Call Button */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm font-bold text-muted-foreground uppercase">
                  {t("current_consultation")}
                </span>
                {currentPatient && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {currentPatient.queueStatus}
                  </span>
                )}
              </div>

              {currentPatient ? (
                <div className="my-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-cyan-500/10 text-cyan-600 font-black text-4xl flex items-center justify-center border-2 border-cyan-500/30">
                      #{currentPatient.serialNumber}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{currentPatient.patient?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("phone")}: {currentPatient.patient?.mobile || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-x-2">
                    <button
                      onClick={() =>
                        updateStatus({
                          appointmentId: currentPatient._id,
                          queueStatus: "COMPLETED",
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                    >
                      {t("complete")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="my-8 text-center text-muted-foreground">
                  {t("no_patient_in_consultation")}
                </div>
              )}

              <button
                onClick={handleCallDoctorPatient}
                disabled={isCallingPatient}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2 shadow transition"
              >
                <Bell className="h-4 w-4" />
                {t("call_next_patient")}
              </button>
            </div>

            {/* Waiting List mini */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm mb-4">{t("upcoming_serials")}</h3>
              <div className="space-y-2">
                {items
                  .filter((i: any) => i.queueStatus === "WAITING" || !i.queueStatus)
                  .slice(0, 5)
                  .map((i: any) => (
                    <div
                      key={i._id}
                      className="p-3 rounded-xl bg-muted/40 border flex items-center justify-between text-sm"
                    >
                      <span className="font-bold">#{i.serialNumber}</span>
                      <span className="text-foreground">{i.patient?.name}</span>
                    </div>
                  ))}
                {items.filter((i: any) => i.queueStatus === "WAITING" || !i.queueStatus).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    {t("no_additional_serials")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TESTS QUEUE */}
      {activeTab === "tests" && (
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{t("select_station")}:</span>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="px-3 py-1.5 rounded-lg border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Ultrasonography">Ultrasonography (USG)</option>
                <option value="X-Ray">X-Ray Room</option>
                <option value="Blood">Pathology & Blood Collection</option>
                <option value="ECG">ECG Room</option>
              </select>
            </div>

            <button
              onClick={() => window.open(`/display/queue?test=${selectedStation}`, "_blank")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-muted text-xs font-semibold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("open_chamber_tv")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="pb-4 border-b">
                <span className="text-sm font-bold text-muted-foreground uppercase">
                  {selectedStation} - {t("running_token")}
                </span>
              </div>

              <div className="my-8 text-center">
                <div className="text-6xl font-black text-indigo-500 my-2">
                  {testSnapshot?.current ? `#${testSnapshot.current.tokenNumber}` : t("waiting")}
                </div>
                <p className="text-sm text-muted-foreground">
                  {testSnapshot?.current ? t("in_consultation") : t("calling_patient_dots")}
                </p>
              </div>

              <button
                onClick={handleCallTestToken}
                disabled={isCallingTest}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow transition"
              >
                <Bell className="h-4 w-4" />
                {t("call_next_patient")}
              </button>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm mb-4">{t("upcoming_serials")}</h3>
              <div className="space-y-2">
                {testSnapshot?.waitingTokens?.map((tok) => (
                  <div
                    key={tok.orderNumber}
                    className="p-3 rounded-xl bg-muted/40 border flex items-center justify-between text-sm"
                  >
                    <span className="font-bold text-indigo-500">#{tok.tokenNumber}</span>
                    <span className="text-xs text-muted-foreground">{tok.orderNumber}</span>
                  </div>
                ))}
                {(!testSnapshot?.waitingTokens || testSnapshot.waitingTokens.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    {t("no_additional_serials")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
