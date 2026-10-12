/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFulfilled, isRejectedWithValue } from "@reduxjs/toolkit"
import { type  Middleware  } from "@reduxjs/toolkit"
import { toast } from "sonner"
import { router } from "@/routes/router"
import { logout } from "./slices/auth.slice"
import { api } from "./api"

export const rtkRequestHandlerMiddleware: Middleware =
  ({ dispatch }) => (next) => (action: any) => {
    const requestMethod = action.meta?.baseQueryMeta?.request?.method

    if (isRejectedWithValue(action)) {
      const payload = action.payload as any
      const payloadData = payload?.data
      const statusCode =
        payloadData?.code ??
        payloadData?.statusCode ??
        payload?.status ??
        payload?.originalStatus

      const isUnauthorized = statusCode === 401 || statusCode === "401"

      // IF RESPONSE IS UNAUTHORIZED, CLEAR TOKEN AND REDIRECT TO LOGIN PAGE
      if (isUnauthorized) {
        localStorage.removeItem("token")

        // Reset the auth state and api cache to prevent infinite redirect loop
        dispatch(logout())
        dispatch(api.util.resetApiState())

        if (window.location.pathname !== "/auth/login") {
          toast.error(
            payloadData?.message || "Unauthorized access. Please log in again."
          )
          void router.navigate("/auth/login", { replace: true })
        }
        return next(action)
      }

      let errorMessage: string | undefined = undefined

      if (payloadData?.message) {
        if (typeof payloadData.message === "string") {
          errorMessage = payloadData.message
        } else if (typeof payloadData.message === "object") {
          errorMessage = String(payloadData.message)
        }
      } else {
        errorMessage = payloadData?.data?.[0]?.message
      }

      toast.error(
        errorMessage ||
          (action.payload &&
          typeof action.payload === "object" &&
          "error" in action.payload
            ? (action.payload as { error?: string }).error
            : undefined) ||
          "An error occurred"
      )
    }

    // SUCCESS MESSAGE FOR NON-GET METHODS
    if (isFulfilled(action) && requestMethod !== "GET") {
      const payload = action.payload as { message?: string }
      const isString = typeof payload?.message === "string"
      if (isString) {
        toast.success(payload.message)
      }
    }

    return next(action)
  }
