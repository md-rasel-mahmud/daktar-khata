import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Calendar, User } from 'lucide-react'
import { LandingNavbar as Navbar } from '../landing/components/navbar'
import { LandingFooter as Footer } from '../landing/components/footer'
import { Card, CardContent } from '@repo/ui/card'
import { Badge } from '@repo/ui/badge'
import { API_BASE_URL } from '@/lib/api'

interface BlogPost {
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

async function getAllBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs?limit=50`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const json = await res.json()
      const list = json?.data || json
      if (Array.isArray(list)) return list
    }
  } catch (err) {
    console.error("Failed to load all blogs:", err)
  }
  return []
}

export default async function AllBlogsPage() {
  const blogs = await getAllBlogs()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Link
            href="/#blog"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-primary">
              All Articles & Publications
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Clinical & Healthcare Practice Guides
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore all guides, workflows, and insights published by our doctors and clinical operations team.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No published blogs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => {
                const linkHref = `/blog/${blog.slug || blog._id}`
                const imageUrl =
                  blog.image ||
                  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'

                return (
                  <Card
                    key={blog._id}
                    className="overflow-hidden py-0 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
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
                          <Link href={linkHref}>
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
                          By {blog.authorName || 'Admin'}
                        </span>
                        <Link
                          href={linkHref}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
