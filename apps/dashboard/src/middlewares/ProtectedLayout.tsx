import { useGetCurrentUserQuery } from "@/lib/store/api/services/user.service"
import { resetUser } from "@/lib/store/slices/auth.slice"
import { api } from "@/lib/store/api"
import { type RootState } from "@/lib/store/store"
import { RolesEnum } from "@/enums/role.enum"
import type React from "react"
import { useDispatch, useSelector } from "react-redux"
import { Navigate } from "react-router"
import { Button } from "@repo/ui/button"

const ProtectedLayout = ({
  allowedRoles,
  requiredPermissions,
  children,
}: {
  allowedRoles?: string[]
  requiredPermissions?: string[]
  children: React.ReactNode
}) => {
  const dispatch = useDispatch()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const reduxToken = useSelector((state: RootState) => state.auth.token)
  const token = reduxToken || (typeof window !== "undefined" ? localStorage.getItem("token") : null)

  const {
    data: userData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  })

  // Priority: profile response user -> whole profile if it has role -> user in Redux auth state
  const profileUser =
    userData?.data?.user || (userData?.data?.role ? userData?.data : null)
  const currentUser = profileUser || authUser?.user

  // 1. If no token exists at all, clear any residual state and go to login
  if (!token) {
    if (authUser) {
      dispatch(resetUser())
    }
    return <Navigate to="/auth/login" replace />
  }

  // 2. Handle errors from user profile query
  if (isError) {
    const errorData = (error as any)?.data
    const statusCode =
      errorData?.code ??
      errorData?.statusCode ??
      (error as any)?.status ??
      (error as any)?.originalStatus

    const isUnauthorized = statusCode === 401 || statusCode === "401"

    // If token is invalid or expired (401), wipe auth completely to avoid bouncing back and forth
    if (isUnauthorized) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
      dispatch(resetUser())
      dispatch(api.util.resetApiState())
      return <Navigate to="/auth/login" replace />
    }

    // For non-401 errors (500, network, etc.):
    // If we already have the authenticated user in Redux from login, proceed so we don't trap the user in an infinite loop
    if (!currentUser) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Session Verification Failed</h2>
            <p className="text-sm text-muted-foreground">
              Unable to load your profile due to a server error. Please try again or log in.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("token")
                }
                dispatch(resetUser())
                dispatch(api.util.resetApiState())
                window.location.href = "/auth/login"
              }}
            >
              Back to Login
            </Button>
          </div>
        </div>
      )
    }
  }

  // 3. Show loading screen only if we don't have currentUser yet
  if ((isLoading || isFetching) && !currentUser) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Verifying session...
          </p>
        </div>
      </div>
    )
  }

  // 4. If query finished and there is still no user found
  if (!currentUser) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    dispatch(resetUser())
    return <Navigate to="/auth/login" replace />
  }

  // 5. Role authorization check
  if (
    allowedRoles &&
    currentUser?.role &&
    !allowedRoles.includes(currentUser.role)
  ) {
    return <Navigate to="/unauthorized" replace />
  }

  // 6. Permission authorization check for staff
  if (
    requiredPermissions &&
    requiredPermissions.length > 0 &&
    currentUser?.role === RolesEnum.STAFF
  ) {
    const currentPermissions = currentUser?.permissions || []
    const hasAllRequiredPermissions = requiredPermissions.every((perm) =>
      currentPermissions.includes(perm)
    )

    if (!hasAllRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedLayout
