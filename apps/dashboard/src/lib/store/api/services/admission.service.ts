import { api } from "@/lib/store/api"

export interface BedAvailabilitySummary {
  total: number
  available: number
  occupied: number
  cleaning: number
  maintenance: number
  wards: { wardName: string; total: number; available: number }[]
}

export interface WardItem {
  _id: string
  name: string
  code?: string
  description?: string
  floor?: string
  isActive: boolean
}

export interface RoomItem {
  _id: string
  name: string
  roomNumber: string
  ward: any
  type?: string
  dailyCharge?: number
}

export interface BedItem {
  _id: string
  bedNumber: string
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE"
  ward: any
  room: any
  dailyCharge?: number
}

export interface AdmissionItem {
  _id: string
  patient: any
  doctor?: any
  clinic?: any
  ward?: any
  room?: any
  bed?: any
  admissionDate: string
  actualDischargeDate?: string
  status: "REQUESTED" | "ADMITTED" | "ON_TREATMENT" | "READY_FOR_DISCHARGE" | "DISCHARGED" | "CANCELLED"
  reason?: string
  diagnosis?: string
  notes?: string
  responsibleStaff?: any
}

export const admissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Admissions
    getAdmissions: builder.query<
      { data: AdmissionItem[]; total: number; page: number; limit: number; totalPages: number },
      {
        status?: string
        doctor?: string
        merchant?: string
        patient?: string
        search?: string
        page?: number
        limit?: number
      } | void
    >({
      query: (arg) => {
        const params = (typeof arg === "object" && arg !== null ? arg : {}) as any
        const queryParams = new URLSearchParams()
        if (params.status) queryParams.append("status", params.status)
        if (params.doctor) queryParams.append("doctor", params.doctor)
        if (params.merchant) queryParams.append("merchant", params.merchant)
        if (params.patient) queryParams.append("patient", params.patient)
        if (params.search) queryParams.append("search", params.search)
        if (params.page) queryParams.append("page", String(params.page))
        if (params.limit) queryParams.append("limit", String(params.limit))
        const qs = queryParams.toString()
        return qs ? `admission?${qs}` : "admission"
      },
      transformResponse: (response: any) => {
        const payload =
          response?.data &&
          typeof response.data === "object" &&
          !Array.isArray(response.data) &&
          Array.isArray(response.data.data)
            ? response.data
            : response

        if (
          payload &&
          Array.isArray(payload.data) &&
          typeof payload.total === "number"
        ) {
          return payload
        }
        const arr = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : []
        return {
          data: arr,
          total: arr.length,
          page: 1,
          limit: arr.length || 10,
          totalPages: 1,
        }
      },
      providesTags: ["Admissions"],
    }),

    getAdmissionById: builder.query<AdmissionItem, string>({
      query: (id) => `admission/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Admissions"],
    }),

    getAdmissionsByPatient: builder.query<AdmissionItem[], string>({
      query: (patientId) => `admission/patient/${patientId}`,
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["Admissions"],
    }),

    createAdmission: builder.mutation<AdmissionItem, any>({
      query: (body) => ({
        url: "admission",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admissions", "Beds"],
    }),

    updateAdmissionStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `admission/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Admissions", "Beds"],
    }),

    dischargePatient: builder.mutation<
      any,
      {
        id: string
        body: {
          dischargeNotes?: string
          admissionFee?: number
          dailyBedCharge?: number
        }
      }
    >({
      query: ({ id, body }) => ({
        url: `admission/${id}/discharge`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admissions", "Beds", "Invoices"],
    }),

    addAdmissionDailyCharge: builder.mutation<any, { id: string; body: { serviceName: string; category?: string; quantity?: number; unitPrice: number; notes?: string } }>({
      query: ({ id, body }) => ({
        url: `admission/${id}/charges`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admissions"],
    }),

    getAdmissionInvoice: builder.query<any, string>({
      query: (id) => `admission/${id}/invoice`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Admissions"],
    }),

    // Wards, Rooms, Beds
    getWards: builder.query<WardItem[], string | void>({
      query: (merchantId) => (merchantId ? `ward?merchant=${merchantId}` : "ward"),
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["Beds"],
    }),

    createWard: builder.mutation<WardItem, any>({
      query: (body) => ({
        url: "ward",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Beds"],
    }),

    updateWard: builder.mutation<WardItem, { id: string; body: Partial<WardItem> }>({
      query: ({ id, body }) => ({
        url: `ward/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Beds"],
    }),

    deleteWard: builder.mutation<any, string>({
      query: (id) => ({
        url: `ward/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Beds"],
    }),

    getRooms: builder.query<RoomItem[], { wardId?: string; merchantId?: string } | void>({
      query: (arg) => {
        const params = (typeof arg === "object" && arg !== null ? arg : {}) as { wardId?: string; merchantId?: string }
        const queryParams = new URLSearchParams()
        if (params.wardId) queryParams.append("ward", params.wardId)
        if (params.merchantId) queryParams.append("merchant", params.merchantId)
        const qs = queryParams.toString()
        return qs ? `room?${qs}` : "room"
      },
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["Beds"],
    }),

    createRoom: builder.mutation<RoomItem, any>({
      query: (body) => ({
        url: "room",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Beds"],
    }),

    updateRoom: builder.mutation<RoomItem, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `room/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Beds"],
    }),

    deleteRoom: builder.mutation<any, string>({
      query: (id) => ({
        url: `room/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Beds"],
    }),

    getBeds: builder.query<BedItem[], { wardId?: string; roomId?: string; status?: string; merchantId?: string } | void>({
      query: (arg) => {
        const params = (typeof arg === "object" && arg !== null ? arg : {}) as { wardId?: string; roomId?: string; status?: string; merchantId?: string }
        const queryParams = new URLSearchParams()
        if (params.wardId) queryParams.append("ward", params.wardId)
        if (params.roomId) queryParams.append("room", params.roomId)
        if (params.status) queryParams.append("status", params.status)
        if (params.merchantId) queryParams.append("merchant", params.merchantId)
        const qs = queryParams.toString()
        return qs ? `bed?${qs}` : "bed"
      },
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["Beds"],
    }),

    createBed: builder.mutation<BedItem, any>({
      query: (body) => ({
        url: "bed",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Beds"],
    }),

    deleteBed: builder.mutation<any, string>({
      query: (id) => ({
        url: `bed/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Beds"],
    }),

    updateBedStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `bed/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Beds", "Admissions"],
    }),

    getBedAvailabilitySummary: builder.query<BedAvailabilitySummary, string | void>({
      query: (merchantId) =>
        merchantId ? `bed/availability?merchant=${merchantId}` : "bed/availability",
      transformResponse: (response: any) => response.data || response,
      providesTags: ["Beds"],
    }),
  }),
})

export const {
  useGetAdmissionsQuery,
  useGetAdmissionByIdQuery,
  useGetAdmissionsByPatientQuery,
  useCreateAdmissionMutation,
  useUpdateAdmissionStatusMutation,
  useDischargePatientMutation,
  useAddAdmissionDailyChargeMutation,
  useGetAdmissionInvoiceQuery,
  useLazyGetAdmissionInvoiceQuery,
  useGetWardsQuery,
  useCreateWardMutation,
  useUpdateWardMutation,
  useDeleteWardMutation,
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetBedsQuery,
  useCreateBedMutation,
  useDeleteBedMutation,
  useUpdateBedStatusMutation,
  useGetBedAvailabilitySummaryQuery,
} = admissionApi
