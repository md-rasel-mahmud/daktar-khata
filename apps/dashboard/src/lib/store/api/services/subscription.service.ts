import { api } from "../index"

export const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSubscriptionPlans: builder.query<any[], void>({
      query: () => "/subscription/plans",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["Subscriptions"],
    }),
    getAllSubscriptionPlans: builder.query<any[], void>({
      query: () => "/subscription",
      transformResponse: (response: any) => response?.data || response || [],
      providesTags: ["Subscriptions"],
    }),
    getSubscriptionById: builder.query<any, string>({
      query: (id) => `/subscription/${id}`,
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["Subscriptions"],
    }),
    createSubscriptionPlan: builder.mutation<any, any>({
      query: (body) => ({
        url: "/subscription",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscriptions"],
    }),
    updateSubscriptionPlan: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/subscription/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Subscriptions"],
    }),
    deleteSubscriptionPlan: builder.mutation<any, string>({
      query: (id) => ({
        url: `/subscription/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subscriptions"],
    }),
    initiateSubscriptionPayment: builder.mutation<
      any,
      { subscriptionId: string; billingCycle?: string }
    >({
      query: ({ subscriptionId, billingCycle = "monthly" }) => ({
        url: `/payment/subscription/sslcommerz/${subscriptionId}`,
        method: "POST",
        body: { billingCycle },
      }),
      invalidatesTags: ["Subscriptions"],
    }),
  }),
})

export const {
  useGetPublicSubscriptionPlansQuery,
  useGetAllSubscriptionPlansQuery,
  useGetSubscriptionByIdQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useInitiateSubscriptionPaymentMutation,
} = subscriptionApi
