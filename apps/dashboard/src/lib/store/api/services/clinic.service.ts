import { api } from "../index"

export const clinicApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicClinics: builder.query<any[], string | void>({
      query: (merchantId) =>
        merchantId ? `/clinic/public-list?merchantId=${merchantId}` : "/clinic/public-list",
      providesTags: ["Clinics"],
    }),
    getMyClinics: builder.query<any[], void>({
      query: () => "/clinic",
      providesTags: ["Clinics"],
    }),
    createClinic: builder.mutation<any, any>({
      query: (body) => ({
        url: "/clinic",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Clinics"],
    }),
    updateClinic: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/clinic/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Clinics"],
    }),
    deleteClinic: builder.mutation<any, string>({
      query: (id) => ({
        url: `/clinic/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clinics"],
    }),
  }),
})

export const {
  useGetPublicClinicsQuery,
  useGetMyClinicsQuery,
  useCreateClinicMutation,
  useUpdateClinicMutation,
  useDeleteClinicMutation,
} = clinicApi
