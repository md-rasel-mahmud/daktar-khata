import { AuthContext } from "@/context/AuthContext"
import { useGetCurrentUserQuery } from "@/lib/store/api/services/user.service"
import { resetUser, setUser } from "@/lib/store/slices/auth.slice"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem("token")
  const { data, isLoading, isFetching, isSuccess, isError } = useGetCurrentUserQuery(
    undefined,
    {
      skip: !token,
    }
  )

  const dispatch = useDispatch()

  // Check for existing session on mount
  useEffect(() => {
    if (isSuccess && data) {
      const { user, ...profile } = data.data

      if (data) {
        dispatch(
          setUser({
            user: {
              user,
              profile,
            },
          })
        )
      } else {
        // If no user found, set currentUser to null
        dispatch(resetUser())
      }
    }
  }, [data, isSuccess])

  useEffect(() => {
    if (isError) {
      dispatch(resetUser())
    }
  }, [isError, dispatch])

  return (
    <AuthContext.Provider value={{ isLoading: isLoading || isFetching }}>
      {children}
    </AuthContext.Provider>
  )
}
