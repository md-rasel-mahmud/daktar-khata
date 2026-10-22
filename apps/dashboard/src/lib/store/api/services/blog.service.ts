import { api } from "../index"

export interface BlogItem {
  _id: string
  title: string
  slug: string
  description?: string
  content: string
  category?: string
  image?: string
  authorName?: string
  isPublished: boolean
  tags?: string[]
  views?: number
  createdAt: string
  updatedAt: string
}

export const blogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllBlogs: builder.query<BlogItem[], { all?: boolean } | void>({
      query: (params) => {
        const queryParams = params as { all?: boolean } | undefined
        return {
          url: "/blogs",
          params: { all: queryParams?.all ?? true },
        }
      },
      transformResponse: (response: any) =>
        Array.isArray(response) ? response : response?.data || [],
      providesTags: ["Blogs"],
    }),
    getBlogByIdOrSlug: builder.query<BlogItem, string>({
      query: (slugOrId) => `/blogs/${slugOrId}`,
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["Blogs"],
    }),
    createBlog: builder.mutation<BlogItem, Partial<BlogItem>>({
      query: (body) => ({
        url: "/blogs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: builder.mutation<BlogItem, { id: string; data: Partial<BlogItem> }>({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),
    deleteBlog: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
  }),
})

export const {
  useGetAllBlogsQuery,
  useGetBlogByIdOrSlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi
