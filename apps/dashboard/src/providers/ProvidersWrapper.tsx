import { type FC, type ReactNode } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Provider } from "react-redux"
import { RouterProvider } from "react-router"
import { router } from "@/routes/router"
import { AuthProvider } from "@/providers/AuthProvider"
import { store } from "@/lib/store/store"
import { ThemeProvider } from "@/components/theme-provider"

const ProvidersWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <TooltipProvider>
        <Provider store={store}>
          <AuthProvider>
            {children}

            <RouterProvider router={router}></RouterProvider>
          </AuthProvider>
        </Provider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default ProvidersWrapper
