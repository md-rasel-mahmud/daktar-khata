"use client"

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from "@repo/ui/card"
import { Badge } from "@repo/ui/badge"

const blogs = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      category: 'Healthcare Technology',
      title: 'Digital Transformation in Clinic Management',
      description:
        'How modern clinic management systems are streamlining operations, reducing wait times, and improving patient care.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800',
      category: 'Medical Practice',
      title: 'The Importance of Digital Prescriptions',
      description:
        'Why moving from paper to digital prescriptions ensures accuracy, speeds up pharmacy workflows, and saves lives.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
      category: 'Finance & Admin',
      title: 'Streamlining Patient Billing',
      description:
        'Best practices for medical billing that reduce errors and improve the financial health of your clinic.',
    },
  ]

export function BlogSection() {
  return (
    <section id="blog" className="py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Latest Insights</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            From our blog
          </h2>
          <p className="text-lg text-muted-foreground">
            Stay updated with the latest trends, best practices, and insights from our team of experts.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {blogs.map(blog => (
            <Card key={blog.id} className="overflow-hidden py-0">
              <CardContent className="px-0">
                <div className="aspect-video relative">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover dark:invert dark:brightness-[0.95]"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-muted-foreground text-xs tracking-widest uppercase">
                    {blog.category}
                  </p>
                  <a href={`/blog/${blog.id}`} className="cursor-pointer">
                    <h3 className="text-xl font-bold hover:text-primary transition-colors">{blog.title}</h3>
                  </a>
                  <p className="text-muted-foreground">{blog.description}</p>
                  <a
                    href={`/blog/${blog.id}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline cursor-pointer"
                  >
                    Learn More
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
