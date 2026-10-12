// @ts-nocheck
// Need to use the React-specific entry point to import createApi

import { RolesEnum } from "@/enums/role.enum"
import { api } from "@/lib/store/api"
import { setUser } from "@/lib/store/slices/auth.slice"
import { errorSetter } from "@/lib/utils"
import { userApi } from "./user.service"

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
              user: { user: user?.user, profile: user?.profile || user?.tenant },
              token: user?.accessToken,
            })
          )

          // If the user's login returned a clinic, persist as default active clinic
          const clinicId = user?.clinic?._id || user?.clinic || user?.user?.clinic
          if (clinicId && typeof window !== "undefined") {
            const currentStored = localStorage.getItem("daktar_khata_selected_clinic_id")
            if (!currentStored) {
              localStorage.setItem("daktar_khata_selected_clinic_id", String(clinicId))
            }
          }

          // Prime the getCurrentUser cache with user data so downstream guards and components have data immediately
          if (user?.user) {
            dispatch(
              userApi.util.upsertQueryData("getCurrentUser", undefined, {
                data: {
                  user: user.user,
                  profile: user.profile || user.tenant,
                },
                message: "User fetched successfully",
              })
            )
          }

          let role = ""

          if (
            user?.user?.role === RolesEnum.SUPER_ADMIN ||
            user?.user?.role === RolesEnum.ADMIN
          ) {
            role = "admin"
          } else if (user?.user?.role) {
            role = user.user.role.toLowerCase()
          }

          if (role && navigate) {
            navigate(`/${role}`, { replace: true })
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
