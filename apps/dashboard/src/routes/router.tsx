/* eslint-disable react-refresh/only-export-components */
import React, { Suspense, lazy } from "react"
import { privateRoutes } from "@/routes/private.routes"
import { createBrowserRouter } from "react-router"

const LandingPage = lazy(() => import("@/pages/public/LandingPage"))
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
      <div className="p-4 text-sm text-muted-foreground">Loading...</div>
    }
  >
    {element}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<LandingPage />),
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
