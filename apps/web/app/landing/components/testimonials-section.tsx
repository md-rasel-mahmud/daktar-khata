"use client"

import { Card, CardContent } from "@repo/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Badge } from "@repo/ui/badge"
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/api'

type Testimonial = {
  name: string
  role: string
  clinic: string
  image: string
  quote: string
}

const fallbackTestimonials: Testimonial[] = [
  {
    name: 'Dr. Tariqul Islam',
    role: 'Chief Consultant, Medicine',
    clinic: 'Care Diagnostic & Consultation Center',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop',
    quote:
      'Daktar Khata replaced our messy paper appointment books. Now my receptionist manages our patient token queue seamlessly, and I can open any patient’s past prescription in seconds.',
  },
  {
    name: 'Dr. Shahana Parveen',
    role: 'Gynecologist & Obstetrician',
    clinic: 'Mother & Child Care Clinic',
    image: 'https://images.unsplash.com/photo-1594824813583-0599298516d7?q=80&w=200&auto=format&fit=crop',
    quote:
      'Prescription writing is incredibly fast with pre-saved medicine templates. Patients appreciate having neat, printed prescriptions with clear dosing instructions.',
  },
  {
    name: 'Engr. Mofazzal Hossain',
    role: 'Managing Director',
    clinic: 'Prime Specialized Hospital',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    quote:
      'The multi-branch management and automated doctor commission tracking saved us over 40 hours of manual accounting every month. Financial reports are accurate to the penny.',
  },
  {
    name: 'Dr. Ahsan Habib',
    role: 'Pediatric Specialist',
    clinic: 'Shishu Sheba Clinic',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop',
    quote:
      'Keeping track of baby vaccination dates and longitudinal child growth records is so simple. Parents love that we never lose their medical histories.',
  },
  {
    name: 'Farid Ahmed',
    role: 'Clinic Manager',
    clinic: 'Al-Madina Diagnostic & Clinic',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    quote:
      'Staff permissions are rock solid. Our front-desk handles billing and scheduling without having access to confidential clinical notes or doctor commission payouts.',
  },
  {
    name: 'Dr. Sabrina Kabir',
    role: 'Cardiologist',
    clinic: 'Heart Care Center, Dhaka',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    quote:
      'Daktar Khata gives our entire clinic team a calm, organized workflow. From emergency patient admissions to daily OPD revenue, everything is right at our fingertips.',
  },
]

export function TestimonialsSection() {
  const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>(fallbackTestimonials)

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch(`${API_BASE_URL}/landing-content`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data || json
          if (Array.isArray(data?.testimonials) && data.testimonials.length > 0) {
            setTestimonialsData(data.testimonials)
          }
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchTestimonials()
  }, [])

  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Doctor & Clinic Testimonials</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Trusted by Doctors & Clinics Across the Country
          </h2>
          <p className="text-lg text-muted-foreground">
            See how doctors, clinic owners, and healthcare administrators simplified their daily practice with Daktar Khata.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonialsData.map((testimonial, index) => (
            <Card key={index} className="flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <blockquote className="text-sm leading-relaxed text-foreground/90 italic mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <Avatar className="size-11 border">
                    <AvatarImage
                      alt={testimonial.name}
                      src={testimonial.image}
                      loading="lazy"
                    />
                    <AvatarFallback className="font-semibold text-primary">
                      {testimonial.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground">
                      {testimonial.name}
                    </h3>
                    <p className="text-xs font-medium text-primary truncate">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {testimonial.clinic}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
