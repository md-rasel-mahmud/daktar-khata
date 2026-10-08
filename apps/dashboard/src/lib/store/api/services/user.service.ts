// Need to use the React-specific entry point to import createApi
import { api } from "@/lib/store/api"

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
        const updateCurrentUserCacheUpdateResult = dispatch(
          userApi.util.updateQueryData("getCurrentUser", undefined, (draft: any) => {
            if (draft?.data?.user) {
              Object.assign(draft.data.user, body)
            }
          })
        )

        try {
          await queryFulfilled
          if (handleDialogClose) handleDialogClose()
        } catch {
          updateCurrentUserCacheUpdateResult.undo()
        }
      },
    }),

    getPlatformAdmins: builder.query<any, void>({
      query: () => "/users/admins",
      transformResponse: (response: any) => response?.data || [],
      providesTags: ["Admins"],
    }),

    createPlatformAdmin: builder.mutation<any, any>({
      query: (body) => ({
        url: "/users/admins",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admins"],
    }),

    updateAdminStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/users/admins/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Admins"],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useGetPlatformAdminsQuery,
  useCreatePlatformAdminMutation,
  useUpdateAdminStatusMutation,
} = userApi
