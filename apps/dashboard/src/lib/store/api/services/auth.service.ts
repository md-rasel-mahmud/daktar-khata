// @ts-nocheck
// Need to use the React-specific entry point to import createApi

import { RolesEnum } from "@/enums/role.enum"
import { api } from "@/lib/store/api"
import { setUser } from "@/lib/store/slices/auth.slice"
import { errorSetter } from "@/lib/utils"

// Define a service using a base URL and expected endpoints
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: ({ postBody }) => ({
        url: "auth/signup",
        method: "POST",
        body: postBody,
      }),
      async onQueryStarted(
        { setError, navigate },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled

          if (data) {
            navigate("/auth/login")
          }
        } catch (error) {
          // Handle error if needed
          errorSetter(error, setError)
        }
      },
    }),

    login: builder.mutation({
      query: ({ postBody }) => ({
        url: "auth/login",
        method: "POST",
        body: postBody,
      }),
      async onQueryStarted(
        { setError, navigate },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled

          const user = data?.data

          dispatch(
            setUser({
              user: { user: user?.user, profile: user?.profile },
              token: user?.accessToken,
            })
          )

          let role = ""

          if (user?.user?.role === RolesEnum.SUPER_ADMIN) {
            role = "admin"
          } else {
            role = user?.user?.role?.toLowerCase()
          }

          if (data) {
            navigate(`/${role}`)
          }
        } catch (error) {
          // Handle error if needed
          errorSetter(error, setError)
        }
      },
    }),
  }),
})

// Export hooks for usage in functional components
export const { useSignupMutation, useLoginMutation } = authApi
