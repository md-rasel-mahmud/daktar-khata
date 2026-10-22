import { api } from "../index"

export interface ContactMessageItem {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "UNREAD" | "READ" | "RESOLVED"
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export const contactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query<ContactMessageItem[], { status?: string } | void>({
      query: (params) => {
        const queryParams = params as { status?: string } | undefined
        return {
          url: "/contact-messages",
          params: queryParams?.status ? { status: queryParams.status } : undefined,
        }
      },
      transformResponse: (response: any) =>
        Array.isArray(response) ? response : response?.data || [],
      providesTags: ["ContactMessages"],
    }),
    getContactMessageById: builder.query<ContactMessageItem, string>({
      query: (id) => `/contact-messages/${id}`,
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["ContactMessages"],
    }),
    updateContactMessageStatus: builder.mutation<
      ContactMessageItem,
      { id: string; status: string; adminNotes?: string }
    >({
      query: ({ id, status, adminNotes }) => ({
        url: `/contact-messages/${id}/status`,
        method: "PATCH",
        body: { status, adminNotes },
      }),
      invalidatesTags: ["ContactMessages"],
    }),
    deleteContactMessage: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/contact-messages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ContactMessages"],
    }),
  }),
})

export const {
  useGetContactMessagesQuery,
  useGetContactMessageByIdQuery,
  useUpdateContactMessageStatusMutation,
  useDeleteContactMessageMutation,
} = contactApi
