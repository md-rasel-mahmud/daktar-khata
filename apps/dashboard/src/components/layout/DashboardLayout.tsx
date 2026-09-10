import { Outlet } from "react-router"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/sidebar"
import { HeaderControls } from "@/components/header-controls"
import { useTranslation } from "react-i18next"

const DashboardLayout = () => {
  const { t, i18n } = useTranslation()

  return (
    <SidebarProvider className="min-h-svh w-full overflow-x-hidden">
      <AppSidebar />

      <SidebarInset className="h-svh min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card/95 px-4 backdrop-blur supports-backdrop-filter:bg-card/80 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">
              {t("dashboard")}
            </div>
          </div>

          <HeaderControls />
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4 pt-4">
          <Outlet key={i18n.language} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout
