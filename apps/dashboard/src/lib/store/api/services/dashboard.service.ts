// RTK Query service for role-based dashboard metrics
import { api } from "@/lib/store/api"

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMerchantDashboard: builder.query<any, void>({
      query: () => "dashboard/merchant",
      transformResponse: (response: any) => response.data || response || {},
      providesTags: ["AppointmentStats", "Appointments", "Finance"],
    }),

    getDoctorDashboard: builder.query<any, void>({
      query: () => "dashboard/doctor",
      transformResponse: (response: any) => response.data || response || {},
      providesTags: ["Appointments", "AppointmentStats"],
    }),

    getReceptionDashboard: builder.query<any, void>({
      query: () => "dashboard/reception",
      transformResponse: (response: any) => response.data || response || {},
      providesTags: ["Appointments"],
    }),

    getNurseDashboard: builder.query<any, void>({
      query: () => "dashboard/nurse",
      transformResponse: (response: any) => response.data || response || {},
    }),

    getAccountantDashboard: builder.query<any, void>({
      query: () => "dashboard/accountant",
      transformResponse: (response: any) => response.data || response || {},
      providesTags: ["Finance"],
    }),

    getSuperAdminDashboard: builder.query<any, void>({
      query: () => "dashboard/super-admin",
      transformResponse: (response: any) => response.data || response || {},
    }),
  }),
})

export const {
  useGetMerchantDashboardQuery,
  useGetDoctorDashboardQuery,
  useGetReceptionDashboardQuery,
  useGetNurseDashboardQuery,
  useGetAccountantDashboardQuery,
  useGetSuperAdminDashboardQuery,
} = dashboardApi
