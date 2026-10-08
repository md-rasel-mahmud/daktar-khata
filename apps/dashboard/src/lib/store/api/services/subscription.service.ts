import { api } from "../index"

export const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSubscriptionPlans: builder.query<any[], void>({
      query: () => "/subscription/plans",
      providesTags: ["Subscriptions"],
    }),
    getAllSubscriptionPlans: builder.query<any[], void>({
      query: () => "/subscription",
      providesTags: ["Subscriptions"],
    }),
    getSubscriptionById: builder.query<any, string>({
      query: (id) => `/subscription/${id}`,
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
