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
          handleDialogClose();
        } catch {
          updateUserListCacheUpdateResult.undo();
        }
      },
    }),

    getDoctorOptions: builder.query({
      query: () => "doctors/options",
      transformResponse: (response) => response.data || [],
      providesTags: ["DoctorOptions"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCurrentUserQuery,
  useCreateDoctorByMerchantMutation,
  useGetDoctorOptionsQuery,
} = doctorApi;
