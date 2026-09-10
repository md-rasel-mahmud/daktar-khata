// RTK Query service for patient management
import { api } from "@/lib/store/api"

// Define patient service using RTK Query
export const patientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all patients (for doctors to see their patients)
    getPatients: builder.query({
      query: (params?: { doctorId?: string }) => {
        const queryParams = new URLSearchParams()
        if (params?.doctorId) queryParams.append("doctorId", params.doctorId)
        return queryParams.toString()
          ? `patients?${queryParams.toString()}`
          : "patients"
      },
      transformResponse: (response) => response.data || response || [],
      providesTags: ["Patients"],
    }),

    // Get a single patient by ID
    getPatientById: builder.query({
      query: (patientId) => `patients/${patientId}`,
      transformResponse: (response) => response.data || response || {},
      providesTags: ["Patient"],
    }),

    // Get patient medical records
    getPatientMedicalRecords: builder.query({
      query: (patientId) => `medical-records/patient/${patientId}`,
      transformResponse: (response) => response.data || response || [],
      providesTags: ["MedicalRecords"],
    }),

    // Get patient appointments
    getPatientAppointments: builder.query({
      query: (patientId) => `patients/${patientId}/appointments`,
      transformResponse: (response) => response.data || response || [],
      providesTags: ["PatientAppointments"],
    }),

    // Create/Update patient profile
    updatePatientProfile: builder.mutation({
      query: ({ patientId, body }) => ({
        url: `patients/${patientId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Patient", "Patients"],
    }),

    // Add medical record
    addMedicalRecord: builder.mutation({
      query: ({ patientId, body }) => ({
        url: "medical-records",
        method: "POST",
        body: {
          ...body,
          patientId,
        },
      }),
      invalidatesTags: ["MedicalRecords"],
    }),

    updateMedicalRecord: builder.mutation({
      query: ({ recordId, body }) => ({
        url: `medical-records/${recordId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MedicalRecords"],
    }),

    deleteMedicalRecord: builder.mutation({
      query: (recordId) => ({
        url: `medical-records/${recordId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MedicalRecords"],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useGetPatientMedicalRecordsQuery,
  useGetPatientAppointmentsQuery,
  useUpdatePatientProfileMutation,
  useAddMedicalRecordMutation,
  useUpdateMedicalRecordMutation,
  useDeleteMedicalRecordMutation,
} = patientApi
