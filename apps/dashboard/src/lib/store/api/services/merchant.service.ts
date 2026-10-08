import { api } from "../index"

export const merchantApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAggregatedMerchants: builder.query<any[], void>({
      query: () => "/merchants/aggregated/overview",
      providesTags: ["Merchants"],
    }),
    getAllMerchants: builder.query<any[], void>({
      query: () => "/merchants",
      providesTags: ["Merchants"],
    }),
    resolveTenant: builder.query<any, string>({
      query: (domain) => `/merchants/resolve?domain=${encodeURIComponent(domain)}`,
    }),
    updateMerchantStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/merchants/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Merchants"],
    }),
  }),
})

export const {
  useGetAggregatedMerchantsQuery,
  useGetAllMerchantsQuery,
  useResolveTenantQuery,
  useUpdateMerchantStatusMutation,
} = merchantApi
