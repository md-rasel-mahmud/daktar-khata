// Need to use the React-specific entry point to import createApi
import { RolesEnum } from "@/enums/role.enum";
import { api } from "@/lib/store/api";
import { profileApi } from "@/lib/store/api/services/profile.service";

// Define a service using a base URL and expected endpoints
export const doctorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => "users/profile",
    }),

    createDoctorByMerchant: builder.mutation({
      query: ({ body }) => ({
        url: "/doctors",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PendingDoctors", "DoctorOptions"],
      async onQueryStarted(
        { body, handleDialogClose },
        { dispatch, queryFulfilled },
      ) {
        // Optimistically update the cache for the doctor list
        const updateUserListCacheUpdateResult = dispatch(
          profileApi.util.updateQueryData(
            "getAllProfiles",
            RolesEnum.DOCTOR,
            (draft) => {
              draft.unshift({ _id: body._id, ...body });
            },
          ),
        );

        try {
          await queryFulfilled;
          if (handleDialogClose) handleDialogClose();
        } catch {
          updateUserListCacheUpdateResult.undo();
        }
      },
    }),

    getDoctorOptions: builder.query({
      query: () => "doctors/options",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["DoctorOptions"],
    }),

    getPendingDoctors: builder.query<any[], void>({
      query: () => "/doctors/pending",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["PendingDoctors"],
    }),

    approveDoctor: builder.mutation<any, string>({
      query: (id) => ({
        url: `/doctors/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingDoctors", "DoctorOptions", "Profiles"],
    }),

    rejectDoctor: builder.mutation<any, string>({
      query: (id) => ({
        url: `/doctors/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingDoctors", "DoctorOptions", "Profiles"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCurrentUserQuery,
  useCreateDoctorByMerchantMutation,
  useGetDoctorOptionsQuery,
  useGetPendingDoctorsQuery,
  useApproveDoctorMutation,
  useRejectDoctorMutation,
} = doctorApi;
