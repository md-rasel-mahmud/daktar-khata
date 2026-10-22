import { api } from "../index"

export interface TeamMember {
  name: string
  role: string
  description?: string
  image?: string
  fallback?: string
  social?: {
    linkedin?: string
    github?: string
    website?: string
  }
}

export interface ClientCompany {
  name: string
  logo?: string
  website?: string
}

export interface CounterStat {
  label: string
  value: string
  description?: string
  icon?: string
}

export interface LandingContentData {
  key?: string
  heroTitle?: string
  heroSubtitle?: string
  heroBadge?: string
  stats?: CounterStat[]
  partnersTitle?: string
  partners?: ClientCompany[]
  teamTitle?: string
  teamSubtitle?: string
  team?: TeamMember[]
  testimonialsTitle?: string
  testimonials?: any[]
  faqs?: any[]
}

export const landingContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLandingContent: builder.query<LandingContentData, void>({
      query: () => "/landing-content",
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["LandingContent"],
    }),
    updateLandingContent: builder.mutation<LandingContentData, Partial<LandingContentData>>({
      query: (body) => ({
        url: "/landing-content",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["LandingContent"],
    }),
    uploadImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: "/upload/image",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: any) => response?.data || response,
    }),
  }),
})

export const {
  useGetLandingContentQuery,
  useUpdateLandingContentMutation,
  useUploadImageMutation,
} = landingContentApi
