"use client"

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react'
import { Card, CardContent } from "@repo/ui/card"
import { Badge } from "@repo/ui/badge"
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/api'

export interface BlogPost {
  _id: string
  title: string
  slug: string
  description?: string
  content: string
  category?: string
  image?: string
  authorName?: string
  createdAt?: string
}

// Fallback articles if database is currently empty
const fallbackBlogs: BlogPost[] = [
  {
    _id: '1',
    slug: 'digital-transformation-in-clinic-management',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    category: 'Clinic Technology',
    title: 'Transforming Paper Registers into Digital Khata',
    description:
      'How modern clinic management platforms eliminate lost records, reduce patient waiting queues, and improve daily care.',
    content: '<p>Every doctor and clinic staff understands the friction of paper-based bookkeeping...</p>',
    authorName: 'Dr. Nahid Hasan',
  },
  {
    _id: '2',
    slug: 'importance-of-digital-prescriptions',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800',
    category: 'Medical Practice',
    title: 'Digital Prescriptions & Patient History Tracking',
    description:
      'Why printable templates, dosage suggestions, and instant diagnosis history save lives and prevent medication errors.',
    content: '<p>Transitioning from handwritten notes to legible digital prescriptions...</p>',
    authorName: 'Dr. Farhana Akter',
  },
  {
    _id: '3',
    slug: 'streamlining-patient-billing-and-accounts',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    category: 'Finance & Billing',
    title: 'Daily Khata: Transparent Consultation & Inpatient Billing',
    description:
      'Managing patient dues, multi-branch revenue collection, and doctor commissions in one single transparent dashboard.',
    content: '<p>Healthcare practices need clean financial accounting without the complexity...</p>',
    authorName: 'Sohel Rana',
  },
]

export function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>(fallbackBlogs)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(`${API_BASE_URL}/blogs?limit=6`, {
          cache: 'no-store'
        })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data || json
          if (Array.isArray(data) && data.length > 0) {
            setBlogs(data)
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic blogs, showing default:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  return (
    <section id="blog" className="py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Clinic Knowledge & Insights</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            From our clinical blog
          </h2>
          <p className="text-lg text-muted-foreground">
            Practical advice, software best practices, and clinical workflows curated by practicing physicians and healthtech experts.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {blogs.slice(0, 3).map((blog) => {
            const linkHref = `/blog/${blog.slug || blog._id}`
            const imageUrl =
              blog.image ||
              'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'

            return (
              <Card key={blog._id} className="overflow-hidden py-0 flex flex-col justify-between">
                <CardContent className="px-0 flex flex-col h-full justify-between">
                  <div>
                    <div className="aspect-video relative bg-muted overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-3 p-6">
                      <p className="text-primary font-semibold text-xs tracking-wider uppercase">
                        {blog.category || 'Healthcare'}
                      </p>
                      <Link href={linkHref} className="cursor-pointer">
                        <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {blog.description || 'Click to read full article with clinic workflow recommendations.'}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-border/40 mt-auto">
                    <span className="text-xs text-muted-foreground font-medium">
                      By {blog.authorName || 'Daktar Khata Team'}
                    </span>
                    <Link
                      href={linkHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Read Article
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Explore More Button if > 3 blogs */}
        {blogs.length > 3 && (
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore More Blogs ({blogs.length})
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
