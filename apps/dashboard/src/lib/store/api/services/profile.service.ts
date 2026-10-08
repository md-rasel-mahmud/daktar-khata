// Need to use the React-specific entry point to import createApi
import { RolesEnum } from "@/enums/role.enum"
import { api } from "@/lib/store/api"
import { type Doctor } from "@/types/doctor.type"

// Define a service using a base URL and expected endpoints
export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "profiles/me",
    }),

    getAllProfiles: builder.query({
      query: (role: RolesEnum) => `doctors`,
      transformResponse: (response) => response.data || [],
      providesTags: ["Profiles"],
    }),

    updateProfile: builder.mutation({
      query: ({ body: { _id, ...body } }) => ({
        url: `profiles/admin/${_id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted(
        { body, handleDialogClose },
        { dispatch, queryFulfilled }
      ) {
        // Optimistically update the cache for the profile
        const updateProfileCacheUpdateResult = dispatch(
          profileApi.util.updateQueryData("getProfile", undefined, (draft) => {
            Object.assign(draft, body)
          })
        )

        // Update the doctor list cache
        const updateDoctorListCacheUpdateResult = dispatch(
          profileApi.util.updateQueryData(
            "getAllProfiles",
            RolesEnum.DOCTOR,
            (draft) => {
              const index = draft?.findIndex(
                (doctor: Doctor) => doctor._id === body._id
              )

              if (index !== -1) {
                draft[index] = { ...draft[index], ...body }
              }
            }
          )
        )

        try {
          await queryFulfilled
          handleDialogClose()
        } catch {
          updateProfileCacheUpdateResult.undo()
          updateDoctorListCacheUpdateResult.undo()
        }
      },
    }),

    updateSelfProfile: builder.mutation({
      query: (body) => ({
        url: "users/profile",
        method: "PATCH",
        body,
      }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          profileApi.util.updateQueryData("getProfile", undefined, (draft) => {
            Object.assign(draft, _body)
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAllProfilesQuery,
  useUpdateSelfProfileMutation,
} = profileApi
