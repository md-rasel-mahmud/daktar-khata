import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Eye } from 'lucide-react'
import { LandingNavbar as Navbar } from '../../landing/components/navbar'
import { LandingFooter as Footer } from '../../landing/components/footer'
import { API_BASE_URL } from '@/lib/api'
import { Badge } from '@repo/ui/badge'

const fallbackBlogs: Record<string, any> = {
  '1': {
    title: 'Transforming Paper Registers into Digital Khata',
    category: 'Clinic Technology',
    author: 'Dr. Nahid Hasan',
    date: 'Oct 08, 2026',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
    description: 'How modern clinic management platforms eliminate lost records, reduce patient waiting queues, and improve daily care.',
    content: `
      <p class="lead text-lg mb-4">Every doctor and healthcare manager understands the friction of paper-based bookkeeping. Registers tear, patient files get misplaced, and calculating daily fee collections at the end of a long shift is exhausting.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">1. Centralized Patient History</h3>
      <p class="mb-4">With a digital khata, whenever a patient returns — whether after 3 weeks or 2 years — their full clinical history, prior diagnoses, and prescriptions appear in two seconds. There is no searching through physical files or asking the patient to bring old paper prescriptions.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">2. Live Queue & Transparent Billing</h3>
      <p class="mb-4">Digital queue management eliminates reception crowding. Receptionists check patients in, fees are automatically linked to the doctor's khata, and doctors see the live waiting queue directly on their consultation screen.</p>
    `,
  },
  'digital-transformation-in-clinic-management': {
    title: 'Transforming Paper Registers into Digital Khata',
    category: 'Clinic Technology',
    author: 'Dr. Nahid Hasan',
    date: 'Oct 08, 2026',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
    description: 'How modern clinic management platforms eliminate lost records, reduce patient waiting queues, and improve daily care.',
    content: `
      <p class="lead text-lg mb-4">Every doctor and healthcare manager understands the friction of paper-based bookkeeping. Registers tear, patient files get misplaced, and calculating daily fee collections at the end of a long shift is exhausting.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">1. Centralized Patient History</h3>
      <p class="mb-4">With a digital khata, whenever a patient returns — whether after 3 weeks or 2 years — their full clinical history, prior diagnoses, and prescriptions appear in two seconds. There is no searching through physical files or asking the patient to bring old paper prescriptions.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3">2. Live Queue & Transparent Billing</h3>
      <p class="mb-4">Digital queue management eliminates reception crowding. Receptionists check patients in, fees are automatically linked to the doctor's khata, and doctors see the live waiting queue directly on their consultation screen.</p>
    `,
  },
}

async function getBlogPost(slugOrId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs/${slugOrId}`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      return data?.data || data
    }
  } catch (err) {
    console.error("Failed to load blog from API:", err)
  }
  return fallbackBlogs[slugOrId] || null
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const blog = await getBlogPost(resolvedParams.id)

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog post not found</h1>
          <p className="text-muted-foreground mb-6">
            The article you are looking for may have been removed or unpublished.
          </p>
          <Link
            href="/#blog"
            className="inline-flex items-center text-primary font-semibold hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blogs
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const title = blog.title
  const category = blog.category || 'Clinical Practice'
  const author = blog.authorName || blog.author || 'Daktar Khata Team'
  const dateFormatted = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : blog.date || 'Recently Published'

  const imageUrl =
    blog.image ||
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Link
            href="/#blog"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blogs
          </Link>

          <article>
            <div className="mb-8 text-center space-y-3">
              <Badge variant="outline" className="text-primary font-semibold tracking-wide uppercase px-3 py-1">
                {category}
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
                {title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  {author}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  {dateFormatted}
                </span>
                {blog.views !== undefined && (
                  <>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-primary" />
                      {blog.views} views
                    </span>
                  </>
                )}
              </div>
            </div>

            {imageUrl && (
              <div className="aspect-[21/9] relative mb-10 rounded-2xl overflow-hidden shadow-lg border">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {blog.description && (
              <p className="lead text-xl text-muted-foreground font-medium mb-8 border-l-4 border-primary pl-4 italic">
                {blog.description}
              </p>
            )}

            {/* Rich Editor HTML Parsed Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
