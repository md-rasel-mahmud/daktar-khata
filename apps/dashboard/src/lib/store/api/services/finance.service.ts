// @ts-nocheck
import { api } from "@/lib/store/api"

export const financeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardFinance: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        const query = params.toString()
        return query ? `finance/dashboard?${query}` : "finance/dashboard"
      },
      transformResponse: (response) => response?.data || response || {},
      providesTags: ["Finance"],
    }),

    getMonthlyReport: builder.query({
      query: (year?: number) =>
        typeof year === "number"
          ? `finance/monthly-report?year=${year}`
          : "finance/monthly-report",
      transformResponse: (response) => response?.data || response || {},
      providesTags: ["Finance"],
    }),

    getNetProfit: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        const query = params.toString()
        return query ? `finance/net-profit?${query}` : "finance/net-profit"
      },
      transformResponse: (response) => response?.data || response || {},
      providesTags: ["Finance"],
    }),

    getInvoices: builder.query({
      query: ({ startDate, endDate } = {}) => {
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        const query = params.toString()
        return query ? `finance/invoices?${query}` : "finance/invoices"
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Finance"],
    }),

    getIncomeList: builder.query({
      query: ({ startDate, endDate, category } = {}) => {
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (category) params.append("category", category)
        const query = params.toString()
        return query ? `income?${query}` : "income"
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Income"],
    }),

    createIncome: builder.mutation({
      query: (body) => ({
        url: "income",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Income", "Finance"],
    }),

    getSalesList: builder.query({
      query: ({ startDate, endDate, category } = {}) => {
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (category) params.append("category", category)
        const query = params.toString()
        return query ? `income/sales?${query}` : "income/sales"
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Income", "Finance"],
    }),

    createSale: builder.mutation({
      query: (body) => ({
        url: "income/sales",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Income", "Finance"],
    }),

    updateIncome: builder.mutation({
      query: ({ incomeId, body }) => ({
        url: `income/${incomeId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Income", "Finance"],
    }),

    deleteIncome: builder.mutation({
      query: (incomeId) => ({
        url: `income/${incomeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Income", "Finance"],
    }),

    getExpenseList: builder.query({
      query: ({ startDate, endDate, category } = {}) => {
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (category) params.append("category", category)
        const query = params.toString()
        return query ? `expense?${query}` : "expense"
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Expense"],
    }),

    getPurchaseList: builder.query({
      query: ({ startDate, endDate, category } = {}) => {
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (category) params.append("category", category)
        const query = params.toString()
        return query ? `expense/purchases?${query}` : "expense/purchases"
      },
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Expense", "Finance"],
    }),

    createPurchase: builder.mutation({
      query: (body) => ({
        url: "expense/purchases",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expense", "Finance"],
    }),

    createExpense: builder.mutation({
      query: (body) => ({
        url: "expense",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Expense", "Finance"],
    }),

    updateExpense: builder.mutation({
      query: ({ expenseId, body }) => ({
        url: `expense/${expenseId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Expense", "Finance"],
    }),

    deleteExpense: builder.mutation({
      query: (expenseId) => ({
        url: `expense/${expenseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense", "Finance"],
    }),
  }),
})

export const {
  useGetDashboardFinanceQuery,
  useGetMonthlyReportQuery,
  useGetNetProfitQuery,
  useGetInvoicesQuery,
  useGetIncomeListQuery,
  useGetSalesListQuery,
  useCreateIncomeMutation,
  useCreateSaleMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
  useGetExpenseListQuery,
  useGetPurchaseListQuery,
  useCreateExpenseMutation,
  useCreatePurchaseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = financeApi
