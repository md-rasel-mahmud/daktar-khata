/* eslint-disable react-refresh/only-export-components */
import React, { Suspense, lazy } from "react"
import { privateRoutes } from "@/routes/private.routes"
import { createBrowserRouter } from "react-router"

const RootPage = lazy(() => import("@/pages/public/RootPage"))
const NotFound = lazy(() => import("@/pages/public/NotFound"))
const ErrorPage = lazy(() => import("@/pages/public/ErrorPage"))
const Unauthorized = lazy(() => import("@/pages/public/Unauthorized"))
const Login = lazy(() => import("@/pages/public/auth/Login"))
const SignUp = lazy(() => import("@/pages/public/auth/SignUp"))
const DashboardLayout = lazy(
  () => import("@/components/layout/DashboardLayout")
)
const ProtectedLayout = lazy(() => import("@/middlewares/ProtectedLayout"))

const withSuspense = (element: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading Daktar Khata...
          </p>
        </div>
      </div>
    }
  >
    {element}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<RootPage />),
    errorElement: withSuspense(<ErrorPage />),
  },
  {
    path: "/auth/login",
    element: withSuspense(<Login />),
    errorElement: withSuspense(<ErrorPage />),
  },
  {
    path: "/auth/signup",
    element: withSuspense(<SignUp />),
    errorElement: withSuspense(<ErrorPage />),
  },
  {
    path: "",
    element: withSuspense(<DashboardLayout />),
    errorElement: withSuspense(<ErrorPage />),
    children: privateRoutes.map((route) => ({
      ...route,
      element: withSuspense(
        <ProtectedLayout
          allowedRoles={route.allowRoutes}
          requiredPermissions={route.requiredPermissions}
        >
          {route.element}
        </ProtectedLayout>
      ),
      errorElement: withSuspense(<ErrorPage />),
    })),
  },
  {
    path: "/unauthorized",
    element: withSuspense(<Unauthorized />),
    errorElement: withSuspense(<ErrorPage />),
  },
  {
    path: "*",
    element: withSuspense(<NotFound />),
    errorElement: withSuspense(<ErrorPage />),
  },
])
