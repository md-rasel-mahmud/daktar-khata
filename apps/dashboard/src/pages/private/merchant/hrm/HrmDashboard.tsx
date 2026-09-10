import React from "react"
import { Link } from "react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"

const modules = [
  {
    title: "Staff Directory",
    description: "Create and manage staff profiles",
    path: "/merchant/hrm/staff",
  },
  {
    title: "Attendance",
    description: "Mark and review staff attendance",
    path: "/merchant/hrm/attendance",
  },
  {
    title: "Leaves",
    description: "Create and approve leave requests",
    path: "/merchant/hrm/leave",
  },
  {
    title: "Payroll",
    description: "Generate payroll and review payroll history",
    path: "/merchant/hrm/payroll",
  },
  {
    title: "Role Templates",
    description: "Manage dynamic role templates and permissions",
    path: "/merchant/hrm/roles",
  },
]

const MerchantHrmDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">HRM</h1>
        <p className="text-muted-foreground">
          Merchant staff and workforce management modules
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.path}>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to={module.path}>
                <Button>Open</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MerchantHrmDashboard
