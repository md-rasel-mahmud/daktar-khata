import { api } from "@/lib/store/api"

export interface PublicQueueSnapshot {
  doctorId: string
  doctorName: string
  specialization: string[]
  clinicName: string
  date: string
  current: { serial: number; status: string } | null
  next: { serial: number } | null
  waitingCount: number
  completedCount: number
  waitingSerials: number[]
  avgConsultationMinutes: number
  estimatedWaitMinutes: number
  updatedAt: string
}

export interface PublicTestQueueSnapshot {
  stationName: string
  date: string
  current: { orderNumber?: string; tokenNumber?: number; status: string } | null
  next: { orderNumber?: string; tokenNumber?: number } | null
  nextSecond?: { orderNumber?: string; tokenNumber?: number } | null
  waitingTokens: { tokenNumber?: number; orderNumber?: string }[]
  waitingCount: number
  completedCount: number
  updatedAt: string
}

export const queueApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Public Doctor Chamber Snapshot for TV
    getPublicQueueSnapshot: builder.query<PublicQueueSnapshot, string>({
      query: (doctorId) => `appointment/queue/public/${doctorId}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Queue"],
    }),

    // Public Central Waiting Hall Multi-Doctor Overview
    getMultiDoctorQueueSummary: builder.query<PublicQueueSnapshot[], string | void>({
      query: (merchantId) =>
        merchantId
          ? `appointment/queue/multi-summary?merchant=${merchantId}`
          : "appointment/queue/multi-summary",
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["Queue"],
    }),

    // Authenticated Doctor / Staff Today Queue
    getTodayQueue: builder.query<any, string | void>({
      query: (doctorId) =>
        doctorId
          ? `appointment/queue/today?doctorId=${doctorId}`
          : "appointment/queue/today",
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Queue"],
    }),

    // Doctor / Staff calls next patient
    callNextPatient: builder.mutation<any, { doctorId?: string }>({
      query: (body) => ({
        url: "appointment/queue/call-next",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Queue", "Appointments"],
    }),

    // Update queue status (CALLED, IN_CONSULTATION, COMPLETED, SKIPPED, CANCELLED)
    updateQueueStatus: builder.mutation<any, { appointmentId: string; queueStatus: string }>({
      query: ({ appointmentId, queueStatus }) => ({
        url: `appointment/queue/${appointmentId}/status`,
        method: "PATCH",
        body: { queueStatus },
      }),
      invalidatesTags: ["Queue", "Appointments"],
    }),

    // Toggle emergency triage flag
    setEmergency: builder.mutation<any, { appointmentId: string; isEmergency: boolean }>({
      query: ({ appointmentId, isEmergency }) => ({
        url: `appointment/queue/${appointmentId}/emergency`,
        method: "PATCH",
        body: { isEmergency },
      }),
      invalidatesTags: ["Queue", "Appointments"],
    }),

    // Patient reception check-in
    checkInPatient: builder.mutation<any, string>({
      query: (appointmentId) => ({
        url: `appointment/queue/${appointmentId}/check-in`,
        method: "POST",
      }),
      invalidatesTags: ["Queue", "Appointments"],
    }),

    // Public Diagnostic Test Room Snapshot for TV
    getPublicTestStationSnapshot: builder.query<PublicTestQueueSnapshot, { station: string; merchantId?: string }>({
      query: ({ station, merchantId }) =>
        merchantId
          ? `test-order/queue/public/${station}?merchant=${merchantId}`
          : `test-order/queue/public/${station}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ["TestOrders"],
    }),

    // Call next test station token
    callNextStationToken: builder.mutation<any, { station: string; merchantId?: string }>({
      query: (body) => ({
        url: "test-order/queue/call-next",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TestOrders"],
    }),
  }),
})

export const {
  useGetPublicQueueSnapshotQuery,
  useGetMultiDoctorQueueSummaryQuery,
  useGetTodayQueueQuery,
  useCallNextPatientMutation,
  useUpdateQueueStatusMutation,
  useSetEmergencyMutation,
  useCheckInPatientMutation,
  useGetPublicTestStationSnapshotQuery,
  useCallNextStationTokenMutation,
} = queueApi
