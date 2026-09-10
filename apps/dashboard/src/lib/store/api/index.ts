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
  ],
  endpoints: () => ({}),
})
