import { api } from "@/lib/store/api"

export interface ServiceItem {
  _id: string
  name: string
  category: string
  description?: string
  price: number
  durationMinutes?: number
  department?: string
  isActive: boolean
  merchant: string
}

export interface TestCatalogItem {
  _id: string
  name: string
  category: string
  description?: string
  price: number
  sampleType?: string
  turnaroundHours?: number
  preparationInstructions?: string
  isActive: boolean
  merchant: string
}

export const serviceCatalogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get Clinical Services
    getServices: builder.query<ServiceItem[], { merchantId?: string; category?: string; search?: string } | void>({
      query: (arg) => {
        const params = (typeof arg === "object" && arg !== null ? arg : {}) as { merchantId?: string; category?: string; search?: string }
        const queryParams = new URLSearchParams()
        if (params.merchantId) queryParams.append("merchant", params.merchantId)
        if (params.category) queryParams.append("category", params.category)
        if (params.search) queryParams.append("search", params.search)
        const qs = queryParams.toString()
        return qs ? `service-catalog?${qs}` : "service-catalog"
      },
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["ServiceCatalog"],
    }),

    getServiceById: builder.query<ServiceItem, string>({
      query: (id) => `service-catalog/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: ["ServiceCatalog"],
    }),

    createService: builder.mutation<ServiceItem, Partial<ServiceItem>>({
      query: (body) => ({
        url: "service-catalog",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ServiceCatalog"],
    }),

    updateService: builder.mutation<ServiceItem, { id: string; body: Partial<ServiceItem> }>({
      query: ({ id, body }) => ({
        url: `service-catalog/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ServiceCatalog"],
    }),

    deleteService: builder.mutation<any, string>({
      query: (id) => ({
        url: `service-catalog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceCatalog"],
    }),

    // Get Diagnostic Tests Catalog
    getTestCatalog: builder.query<TestCatalogItem[], string | void>({
      query: (merchantId) =>
        merchantId ? `test-catalog?merchant=${merchantId}` : "test-catalog",
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["ServiceCatalog"],
    }),

    createTestCatalog: builder.mutation<TestCatalogItem, Partial<TestCatalogItem>>({
      query: (body) => ({
        url: "test-catalog",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ServiceCatalog"],
    }),

    updateTestCatalog: builder.mutation<TestCatalogItem, { id: string; body: Partial<TestCatalogItem> }>({
      query: ({ id, body }) => ({
        url: `test-catalog/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ServiceCatalog"],
    }),

    deleteTestCatalog: builder.mutation<any, string>({
      query: (id) => ({
        url: `test-catalog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceCatalog"],
    }),
  }),
})

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetTestCatalogQuery,
  useCreateTestCatalogMutation,
  useUpdateTestCatalogMutation,
  useDeleteTestCatalogMutation,
} = serviceCatalogApi
