"use client"

import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Card, CardContent } from "@repo/ui/card"
import { CardDecorator } from "@/components/card-decorator"
import { Users, CalendarClock, FileText, BadgeDollarSign } from 'lucide-react'

const values = [
  {
    icon: Users,
    title: 'Patient First',
    description: 'Every feature is designed around the patient-doctor relationship, keeping records clear, complete, and always at hand.'
  },
  {
    icon: CalendarClock,
    title: 'Effortless Scheduling',
    description: 'Appointments that just work — daily, weekly, and repeat visits managed in a few clicks, with no double-booking.'
  },
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    description: 'Write legible, printable prescriptions with saved templates. Medication history stays with the patient record.'
  },
  {
    icon: BadgeDollarSign,
    title: 'Honest Billing',
    description: 'A transparent khata of every visit, fee, and payment. Know exactly where your practice stands, every single day.'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About Daktar Khata
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Built for doctors, by people who love clinics
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We started Daktar Khata to replace the paper khata with something better —
            a platform that helps doctors, clinics, and hospitals manage care and
            earnings without drowning in admin work.
          </p>
        </div>

        {/* Modern Values Grid with Enhanced Design */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className='group shadow-xs py-2'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <CardDecorator>
                    <value.icon className='h-6 w-6' aria-hidden />
                  </CardDecorator>
                  <h3 className='mt-6 font-medium text-balance'>{value.title}</h3>
                  <p className='text-muted-foreground mt-3 text-sm'>{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">Made with care for the healthcare community</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="http://localhost:7722/auth/signup" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="cursor-pointer">
                Start Free Trial
              </Button>
            </a>
            <a href="#contact">
              <Button size="lg" variant="outline" className="cursor-pointer">
                Book a Demo
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}