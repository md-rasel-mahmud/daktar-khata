import { AuthContext } from "@/context/AuthContext"
import { useGetCurrentUserQuery } from "@/lib/store/api/services/user.service"
import { resetUser, setUser } from "@/lib/store/slices/auth.slice"
import { type RootState } from "@/lib/store/store"
import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch()
  const reduxToken = useSelector((state: RootState) => state.auth.token)
  const token =
    reduxToken ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null)

  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetCurrentUserQuery(undefined, {
      skip: !token,
    })

  // Synchronize authenticated user into Redux store
  useEffect(() => {
    if (isSuccess && data?.data) {
      const user = data.data.user || (data.data.role ? data.data : undefined)
      const profile = data.data.user ? data.data : data.data

      if (user) {
        dispatch(
          setUser({
            user: {
              user,
              profile,
            },
          })
        )
      }
    }
  }, [data, isSuccess, dispatch])

  // Only reset session if error is 401 Unauthorized or no token exists
  useEffect(() => {
    if (isError) {
      const errorData = (error as any)?.data
      const statusCode =
        errorData?.code ??
        errorData?.statusCode ??
        (error as any)?.status ??
        (error as any)?.originalStatus

      const isUnauthorized = statusCode === 401 || statusCode === "401"
      if (isUnauthorized || !token) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
        }
        dispatch(resetUser())
      }
    }
  }, [isError, error, token, dispatch])

  return (
    <AuthContext.Provider value={{ isLoading: (isLoading || isFetching) && !data }}>
      {children}
    </AuthContext.Provider>
  )
}
