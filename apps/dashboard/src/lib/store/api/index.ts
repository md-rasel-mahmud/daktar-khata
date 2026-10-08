// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

type AuthTokenState = {
  auth?: {
    token?: string | null
  }
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthTokenState)?.auth?.token

    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }

    // Pass tenant domain header from window hostname or localStorage
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname.toLowerCase()
      if (hostname.endsWith(".localhost")) {
        const sub = hostname.split(".")[0]
        if (sub && sub !== "www") {
          headers.set("x-tenant-domain", sub)
        }
      } else if (hostname.includes(".")) {
        const parts = hostname.split(".")
        if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "admin" && parts[0] !== "app") {
          headers.set("x-tenant-domain", parts[0])
        }
      }

      const storedTenant = localStorage.getItem("daktar_khata_tenant_domain")
      if (storedTenant && !headers.has("x-tenant-domain")) {
        headers.set("x-tenant-domain", storedTenant)
      }
    }

    return headers
  },
})

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Appointments",
    "AvailableSlots",
    "AppointmentStats",
    "DoctorOptions",
    "Staff",
    "StaffRoleTemplates",
    "StaffAttendance",
    "StaffLeave",
    "StaffPayroll",
    "Finance",
    "Income",
    "Expense",
    "Patients",
    "Patient",
    "MedicalRecords",
    "PatientAppointments",
    "Merchants",
    "Subscriptions",
    "Clinics",
    "Admins",
    "PendingDoctors",
    "Profiles",
  ],
  endpoints: () => ({}),
})
