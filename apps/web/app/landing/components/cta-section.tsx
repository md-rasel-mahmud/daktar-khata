"use client"

import { ArrowRight, Stethoscope, CalendarClock, HeartPulse } from 'lucide-react'
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Separator } from "@repo/ui/separator"

export function CTASection() {
  return (
    <section className='py-16 lg:py-24 bg-muted/80'>
      <div className='container mx-auto px-4 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='text-center'>
            <div className='space-y-8'>
              {/* Badge and Stats */}
              <div className='flex flex-col items-center gap-4'>
                <Badge variant='outline' className='flex items-center gap-2'>
                  <Stethoscope className='size-3' />
                  All-in-One Clinic Suite
                </Badge>

                <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                  <span className='flex items-center gap-1'>
                    <div className='size-2 rounded-full bg-green-500' />
                    50+ Clinics
                  </span>
                  <Separator orientation='vertical' className='!h-4' />
                  <span>10K+ Patients</span>
                  <Separator orientation='vertical' className='!h-4' />
                  <span>4.9★ Rating</span>
                </div>
              </div>

              {/* Main Content */}
              <div className='space-y-6'>
                <h1 className='text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
                  Give your practice
                  <span className='flex sm:inline-flex justify-center'>
                    <span className='relative mx-2'>
                      <span className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        a digital khata
                      </span>
                      <div className='absolute start-0 -bottom-2 h-1 w-full bg-gradient-to-r from-primary/30 to-secondary/30' />
                    </span>
                  </span>
                </h1>

                <p className='text-muted-foreground mx-auto max-w-2xl text-balance lg:text-xl'>
                  Stop juggling paper registers and scattered notes. Daktar Khata brings
                  patient records, appointments, prescriptions, and billing together —
                  built for the way you actually practice.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className='flex flex-col justify-center gap-4 sm:flex-row sm:gap-6'>
                <a href="http://localhost:7722/auth/signup" target="_blank" rel="noopener noreferrer">
                  <Button size='lg' className='cursor-pointer px-8 py-6 text-lg font-medium'>
                    <HeartPulse className='me-2 size-5' />
                    Start Free Trial
                  </Button>
                </a>
                <a href="#features">
                  <Button variant='outline' size='lg' className='cursor-pointer px-8 py-6 text-lg font-medium group'>
                    <CalendarClock className='me-2 size-5' />
                    Explore Features
                    <ArrowRight className='ms-2 size-4 transition-transform group-hover:translate-x-1' />
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className='text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                    <div className='size-2 rounded-full bg-green-600 dark:bg-green-400 me-1' />

                  <span>Multi-user & multi-clinic support</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='size-2 rounded-full bg-blue-600 dark:bg-blue-400 me-1' />

                  <span>Secure, local data control</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='size-2 rounded-full bg-purple-600 dark:bg-purple-400 me-1' />

                  <span>Regular updates & support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}