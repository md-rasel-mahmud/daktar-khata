import { useGetCurrentUserQuery } from "@/lib/store/api/services/user.service"
import type React from "react"
import { Navigate } from "react-router"

const ProtectedLayout = ({
  allowedRoles,
  requiredPermissions,
  children,
}: {
  allowedRoles?: string[]
  requiredPermissions?: string[]
  children: React.ReactNode
}) => {
  const token = localStorage.getItem("token")
  const { data: userData, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  })

  const currentUser = userData?.data?.user

  // console currentUser
  console.log("currentUser", currentUser)

  if (isLoading) {
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

  if (!currentUser && !isLoading) {
    return <Navigate to="/auth/login" replace />
  }

  if (
    allowedRoles &&
    currentUser?.role &&
    !allowedRoles.includes(currentUser.role)
  ) {
    return <Navigate to="/unauthorized" replace />
  }

  if (
    requiredPermissions &&
    requiredPermissions.length > 0 &&
    currentUser?.role === "STAFF"
  ) {
    const currentPermissions = currentUser?.permissions || []
    const hasAllRequiredPermissions = requiredPermissions.every((perm) =>
      currentPermissions.includes(perm)
    )

    if (!hasAllRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

export default ProtectedLayout
