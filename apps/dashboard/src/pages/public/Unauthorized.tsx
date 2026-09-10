import React from "react"
import { ShieldAlert } from "lucide-react"
import { Button } from "@repo/ui/button"
import { useNavigate } from "react-router"

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()

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
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  )
}

export default Unauthorized
