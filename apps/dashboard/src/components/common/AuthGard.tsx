import { useAuth } from "@/hooks/use-auth"
import { type RootState } from "@/lib/store/store"

import { useSelector } from "react-redux"
import { Navigate } from "react-router"

const AuthGard = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) => {
  const { isLoading } = useAuth()
  const currentUser = useSelector((state: RootState) => state.auth.user?.user)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default AuthGard
