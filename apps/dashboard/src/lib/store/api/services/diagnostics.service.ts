import { api } from "@/lib/store/api"

export interface TestOrderItem {
  test: string
  testName: string
  price: number
  status: "ORDERED" | "SAMPLE_COLLECTED" | "PROCESSING" | "REPORT_READY" | "APPROVED" | "CANCELLED"
  notes?: string
}

export interface TestOrder {
  _id: string
  orderNumber?: string
  tokenNumber?: number
  patient: any
  doctor?: any
  referringDoctorName?: string
  isWalkIn?: boolean
  merchant: string
  items: TestOrderItem[]
  status: string
  createdAt: string
}

export interface LabReport {
  _id: string
  reportNumber?: string
  downloadToken?: string
  testOrder: any
  testOrderItemIndex: number
  patient: any
  merchant: string
  findings?: string
  conclusion?: string
  remarks?: string
  fileUrl?: string
  isApproved: boolean
  approvedAt?: string
  reportedBy?: any
  approvedBy?: any
  createdAt: string
}

export const diagnosticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTestOrders: builder.query<TestOrder[], { merchantId?: string; status?: string } | void>({
      query: (arg) => {
        const params = (typeof arg === "object" && arg !== null ? arg : {}) as { merchantId?: string; status?: string }
        const queryParams = new URLSearchParams()
        if (params.merchantId) queryParams.append("merchant", params.merchantId)
        if (params.status) queryParams.append("status", params.status)
        const qs = queryParams.toString()
        return qs ? `test-order?${qs}` : "test-order"
      },
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["TestOrders"],
    }),

    getTestOrdersByPatient: builder.query<TestOrder[], string>({
      query: (patientId) => `test-order/patient/${patientId}`,
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["TestOrders"],
    }),

    createTestOrder: builder.mutation<TestOrder, any>({
      query: (body) => ({
        url: "test-order",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TestOrders"],
    }),

    updateTestOrderItemStatus: builder.mutation<any, { id: string; itemIndex: number; status: string }>({
      query: ({ id, itemIndex, status }) => ({
        url: `test-order/${id}/item/${itemIndex}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["TestOrders", "LabReports"],
    }),

    getLabReports: builder.query<LabReport[], string | void>({
      query: (merchantId) =>
        merchantId ? `lab-report?merchant=${merchantId}` : "lab-report",
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["LabReports"],
    }),

    getLabReportsByPatient: builder.query<LabReport[], string>({
      query: (patientId) => `lab-report/patient/${patientId}`,
      transformResponse: (response: any) => response.data || response || [],
      providesTags: ["LabReports"],
    }),

    createLabReport: builder.mutation<LabReport, any>({
      query: (body) => ({
        url: "lab-report",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LabReports", "TestOrders"],
    }),

    approveLabReport: builder.mutation<any, string>({
      query: (id) => ({
        url: `lab-report/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["LabReports", "TestOrders"],
    }),

    // Public Self-Service Report Search
    publicSearchLabReport: builder.query<LabReport, { phone: string; token: string }>({
      query: ({ phone, token }) =>
        `lab-report/public-search?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}`,
      transformResponse: (response: any) => response.data || response,
    }),
  }),
})

export const {
  useGetTestOrdersQuery,
  useGetTestOrdersByPatientQuery,
  useCreateTestOrderMutation,
  useUpdateTestOrderItemStatusMutation,
  useGetLabReportsQuery,
  useGetLabReportsByPatientQuery,
  useCreateLabReportMutation,
  useApproveLabReportMutation,
  useLazyPublicSearchLabReportQuery,
} = diagnosticsApi
