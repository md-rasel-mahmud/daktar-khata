import React, { useEffect } from "react"
import { ArrowLeft, Home, ShieldAlert } from "lucide-react"
import { Button } from "@repo/ui/button"
import { useNavigate } from "react-router"
import { useDispatch } from "react-redux"
import { api } from "@/lib/store/api"

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    // remove token from localstorage and clear redux store
    localStorage.removeItem("token")

    // reset redux api state
    dispatch(api.util.resetApiState())
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button variant={"outline"} onClick={() => navigate("/")}>
            <Home /> Home
          </Button>
          <Button onClick={() => navigate("/auth/login")}>Login</Button>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
