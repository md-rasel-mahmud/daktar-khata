"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from "@repo/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/accordion"
import { Badge } from "@repo/ui/badge"

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'What is Daktar Khata?',
    answer:
      'Daktar Khata is a clinic management platform for doctors, clinics, and hospitals. It brings patient records, appointment scheduling, digital prescriptions, and billing into one simple system — replacing paper khata and scattered notes.',
  },
  {
    value: 'item-2',
    question: 'Do I need separate software for billing?',
    answer:
      'No. Billing is built in. Every visit is recorded against the patient, fees and payments are tracked in your daily khata, and you always know how much the practice collected — no separate billing software required.',
  },
  {
    value: 'item-3',
    question: 'Can multiple doctors and staff use it?',
    answer:
      'Yes. Daktar Khata is multi-user and multi-tenant by design. Each clinic gets its own workspace, and doctors, receptionists, and admins get role-based access to only what they need.',
  },
  {
    value: 'item-4',
    question: 'Is my patient data safe?',
    answer:
      'Patient data is stored in your clinic\'s own database, and the system uses secure authentication and role-based access. You control who can view and edit records — patient confidentiality comes first.',
  },
  {
    value: 'item-5',
    question: 'Can I write digital prescriptions?',
    answer:
      'Yes. Write clean, printable prescriptions with saved templates and medicine lists. Every prescription is attached to the patient\'s history, so follow-ups are quick and consistent.',
  },
  {
    value: 'item-6',
    question: 'How do I get started?',
    answer:
      'Create a free account from the Get Started button, set up your clinic profile, and start adding patients the same day. A guided setup walks you through appointments, prescriptions, and billing.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Daktar Khata — from patient records to billing. Still have questions? We&apos;re here to help!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion multiple={false} className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-open:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? We&apos;re here to help.
            </p>
            <a href="#contact">
              <Button className='cursor-pointer'>Contact Support</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }