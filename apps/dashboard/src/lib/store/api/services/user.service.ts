// Need to use the React-specific entry point to import createApi
import { RolesEnum } from "@/enums/role.enum"
import { api } from "@/lib/store/api"
import { profileApi } from "@/lib/store/api/services/profile.service"

// Define a service using a base URL and expected endpoints
export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => "users/profile",
    }),



    updateCurrentUser: builder.mutation({
      query: ({ body }) => ({
        url: "users/profile",
        method: "PATCH",
        body,
      }),
      async onQueryStarted(
        { body, handleDialogClose },
        { dispatch, queryFulfilled }
      ) {
        // Optimistically update the cache for the current user
        const updateCurrentUserCacheUpdateResult = dispatch(
          userApi.util.updateQueryData("getCurrentUser", undefined, (draft) => {
            Object.assign(draft.data.user, body)
          })
        )

        try {
          await queryFulfilled
          handleDialogClose()
        } catch {
          updateCurrentUserCacheUpdateResult.undo()
        }
      },
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} = userApi
