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
      <div className="flex h-screen items-center justify-center">
        Loading...
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
