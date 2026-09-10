// RTK Query service for appointment management
import { api } from "@/lib/store/api"

// Define appointment service using RTK Query
export const appointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all appointments for the current user
    getAppointments: builder.query({
      query: () => "appointment",
      transformResponse: (response) => response.data || response || [],
      providesTags: ["Appointments"],
    }),

    // Get available slots for a doctor on a specific date
    getAvailableSlots: builder.query({
      query: ({ doctorId, appointmentDate, slotDuration = 30 }) =>
        `appointment/slots/available?doctorId=${doctorId}&appointmentDate=${appointmentDate}&slotDuration=${slotDuration}`,
      transformResponse: (response) => response.data || response || {},
      providesTags: ["AvailableSlots"],
    }),

    // Get appointment statistics
    getAppointmentStats: builder.query({
      query: (params?: {
        doctorId?: string
        startDate?: string
        endDate?: string
      }) => {
        const { doctorId, startDate, endDate } = params || {}
        const url = "appointment/stats"
        const queryParams = new URLSearchParams()
        if (doctorId) queryParams.append("doctorId", doctorId)
        if (startDate) queryParams.append("startDate", startDate)
        if (endDate) queryParams.append("endDate", endDate)
        return queryParams.toString() ? `${url}?${queryParams.toString()}` : url
      },
      transformResponse: (response) => response.data || response || {},
      providesTags: ["AppointmentStats"],
    }),

    // Get a single appointment by ID
    getAppointmentById: builder.query({
      query: (appointmentId) => `appointment/${appointmentId}`,
      transformResponse: (response) => response.data || response || {},
      providesTags: ["Appointments"],
    }),

    // Create a new appointment
    createAppointment: builder.mutation({
      query: (body) => ({
        url: "appointment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointments", "AvailableSlots"],
      async onQueryStarted({ handleDialogClose }, { queryFulfilled }) {
        try {
          await queryFulfilled
          if (handleDialogClose) {
            handleDialogClose()
          }
        } catch (error) {
          console.error("Failed to create appointment:", error)
        }
      },
    }),

    // Update appointment status
    updateAppointmentStatus: builder.mutation({
      query: ({ appointmentId, body }) => ({
        url: `appointment/${appointmentId}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Appointments", "AppointmentStats"],
      async onQueryStarted(
        { appointmentId, handleRefresh },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data: _data } = await queryFulfilled
          // Refresh appointment data
          if (handleRefresh) {
            handleRefresh()
          }
        } catch (error) {
          console.error("Failed to update appointment status:", error)
        }
      },
    }),

    // Reschedule an appointment
    rescheduleAppointment: builder.mutation({
      query: ({ appointmentId, body }) => ({
        url: `appointment/${appointmentId}/reschedule`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointments", "AvailableSlots", "AppointmentStats"],
      async onQueryStarted({ handleDialogClose }, { queryFulfilled }) {
        try {
          await queryFulfilled
          if (handleDialogClose) {
            handleDialogClose()
          }
        } catch (error) {
          console.error("Failed to reschedule appointment:", error)
        }
      },
    }),

    // Cancel an appointment
    cancelAppointment: builder.mutation({
      query: (appointmentId) => ({
        url: `appointment/${appointmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Appointments", "AppointmentStats"],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetAppointmentsQuery,
  useGetAvailableSlotsQuery,
  useGetAppointmentStatsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
} = appointmentApi
