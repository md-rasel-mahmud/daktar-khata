import { RolesEnum } from "@/enums/role.enum"
import { type RootState } from "@/lib/store/store"
import { useSelector } from "react-redux"
import { Navigate } from "react-router"

const RootPage = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  const currentUser = useSelector((state: RootState) => state.auth.user)

  if (token && currentUser?.user?.role) {
    const role = currentUser.user.role
    if (role === RolesEnum.SUPER_ADMIN || role === RolesEnum.ADMIN) {
      return <Navigate to="/admin" replace />
    }
    if (role === RolesEnum.DOCTOR) {
      return <Navigate to="/doctor" replace />
    }
    if (role === RolesEnum.MERCHANT) {
      return <Navigate to="/merchant" replace />
    }
    if (role === RolesEnum.PATIENT) {
      return <Navigate to="/patient" replace />
    }
    if (role === RolesEnum.STAFF) {
      return <Navigate to="/staff" replace />
    }
  }

  return <Navigate to="/auth/login" replace />
}

export default RootPage
