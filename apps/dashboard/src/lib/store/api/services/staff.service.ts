import type { StaffRoleTemplate } from "@/features/merchant/types/StaffRoleTemplate.type"
import { api } from "@/lib/store/api"

export const staffApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query({
      query: () => "staff",
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Staff"],
    }),

    getStaffRoleTemplates: builder.query<StaffRoleTemplate[], undefined>({
      query: () => "staff-role-templates",
      transformResponse: (response: { data: StaffRoleTemplate[] }) =>
        response?.data || [],
      providesTags: ["StaffRoleTemplates"],
    }),

    createStaffRoleTemplate: builder.mutation({
      query: (body) => ({
        url: "staff-role-templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffRoleTemplates"],
    }),

    updateStaffRoleTemplate: builder.mutation({
      query: ({ templateId, body }) => ({
        url: `staff-role-templates/${templateId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["StaffRoleTemplates"],
    }),

    deleteStaffRoleTemplate: builder.mutation({
      query: (templateId) => ({
        url: `staff-role-templates/${templateId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StaffRoleTemplates"],
    }),

    createStaff: builder.mutation({
      query: (body) => ({
        url: "staff",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),

    updateStaff: builder.mutation({
      query: ({ staffId, body }) => ({
        url: `staff/${staffId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),

    deactivateStaff: builder.mutation({
      query: (staffId) => ({
        url: `staff/${staffId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),

    recordAttendance: builder.mutation({
      query: ({ staffId, body }) => ({
        url: `staff/${staffId}/attendance`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staff", "StaffAttendance"],
    }),

    getStaffAttendance: builder.query({
      query: ({ staffId, fromDate, toDate }) => {
        const params = new URLSearchParams()
        if (fromDate) params.append("fromDate", fromDate)
        if (toDate) params.append("toDate", toDate)

        const query = params.toString()
        return query
          ? `staff/${staffId}/attendance?${query}`
          : `staff/${staffId}/attendance`
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["StaffAttendance"],
    }),

    createLeaveRequest: builder.mutation({
      query: ({ staffId, body }) => ({
        url: `staff/${staffId}/leave`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffLeave"],
    }),

    getLeaveRequests: builder.query({
      query: ({ staffId, status }) => {
        const query = status ? `?status=${status}` : ""
        return `staff/${staffId}/leave${query}`
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["StaffLeave"],
    }),

    updateLeaveStatus: builder.mutation({
      query: ({ staffId, leaveId, body }) => ({
        url: `staff/${staffId}/leave/${leaveId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["StaffLeave", "Staff"],
    }),

    createPayroll: builder.mutation({
      query: ({ staffId, body }) => ({
        url: `staff/${staffId}/payroll`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StaffPayroll"],
    }),

    getPayroll: builder.query({
      query: (staffId) => `staff/${staffId}/payroll`,
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["StaffPayroll"],
    }),
  }),
})

export const {
  useGetStaffListQuery,
  useGetStaffRoleTemplatesQuery,
  useCreateStaffRoleTemplateMutation,
  useUpdateStaffRoleTemplateMutation,
  useDeleteStaffRoleTemplateMutation,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeactivateStaffMutation,
  useRecordAttendanceMutation,
  useGetStaffAttendanceQuery,
  useCreateLeaveRequestMutation,
  useGetLeaveRequestsQuery,
  useUpdateLeaveStatusMutation,
  useCreatePayrollMutation,
  useGetPayrollQuery,
} = staffApi
