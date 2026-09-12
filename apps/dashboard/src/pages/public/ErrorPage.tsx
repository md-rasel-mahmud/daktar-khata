import {
  isRouteErrorResponse,
  Link,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router"
import { Button } from "@repo/ui/button"
import { RolesEnum } from "@/enums/role.enum"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store/store"
import { ChartArea, HomeIcon } from "lucide-react"

const ErrorPage: React.FC = () => {
  const error = useRouteError()
  const location = useLocation()
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()

  let title = "Something went wrong"
  let description = "An unexpected error happened while loading this page."

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    description =
      typeof error.data === "string"
        ? error.data
        : "The requested page could not be loaded."
  } else if (error instanceof Error) {
    description = error.message
  }

  const navigateToDashboard = () => {
    if (currentUser) {
      if (currentUser?.user.role === RolesEnum.SUPER_ADMIN) {
        navigate("/admin")
      } else if (currentUser?.user.role === RolesEnum.DOCTOR) {
        navigate("/doctor")
      } else if (currentUser?.user.role === RolesEnum.MERCHANT) {
        navigate("/merchant")
      } else if (currentUser?.user.role === RolesEnum.PATIENT) {
        navigate("/patient")
      } else if (currentUser?.user.role === RolesEnum.STAFF) {
        navigate("/staff")
      }
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-10">
        <div className="w-full rounded-2xl border bg-card p-6 shadow-xl backdrop-blur-sm md:p-8">
          <p className="mb-3 inline-flex rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold tracking-wide text-destructive uppercase">
            Application Error
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-destructive md:text-base">
            {description}
          </p>

          <div className="mt-6 rounded-lg border bg-background p-3 text-xs md:text-sm">
            <p className="font-medium">Current route</p>
            <p className="mt-1 break-all text-muted-foreground">
              {location.pathname}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Link to="/">
              <Button variant="outline">
                <HomeIcon />
                Go Home
              </Button>
            </Link>

            <Button variant="outline" onClick={navigateToDashboard}>
              <ChartArea />
              Go Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
