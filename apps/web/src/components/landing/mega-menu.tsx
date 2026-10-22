"use client"

import {
  ShieldCheck,
  BarChart3,
  Stethoscope,
  Building2,
  CalendarCheck,
  FileText,
  CreditCard,
  Users,
  Bed,
  HeartPulse,
  Receipt,
  Clock
} from 'lucide-react'

const menuSections = [
  {
    title: 'Clinical Solutions',
    items: [
      {
        title: 'Appointments & Scheduling',
        description: 'Multi-slot doctor calendar with live queue control',
        icon: CalendarCheck,
        href: '#features'
      },
      {
        title: 'Digital Prescriptions',
        description: 'Printable templates, diagnosis records, and medicine lists',
        icon: FileText,
        href: '#features'
      },
      {
        title: 'Patient Medical Records',
        description: 'Longitudinal histories, past visits, and lab test reports',
        icon: Users,
        href: '#features'
      },
      {
        title: 'OT & Inpatient Admissions',
        description: 'Bed allocations, admission khata, and surgery planning',
        icon: Bed,
        href: '#features'
      }
    ]
  },
  {
    title: 'Clinic Administration',
    items: [
      {
        title: 'Daily Khata & Billing',
        description: 'Consultation fees, test billing, and patient invoices',
        icon: CreditCard,
        href: '#features'
      },
      {
        title: 'Multi-Branch Management',
        description: 'Switch between clinics and diagnostic desks seamlessly',
        icon: Building2,
        href: '#about'
      },
      {
        title: 'Doctor Commission Tracking',
        description: 'Automated rules for OPD, tests, and operation shares',
        icon: Receipt,
        href: '#features'
      },
      {
        title: 'Staff Roles & HR Attendance',
        description: 'Granular permissions for nurses, billing staff, and admins',
        icon: ShieldCheck,
        href: '#features'
      }
    ]
  },
  {
    title: 'Platform & Insights',
    items: [
      {
        title: 'Financial Reports',
        description: 'Income, expense, and daily collection balance sheets',
        icon: BarChart3,
        href: '#pricing'
      },
      {
        title: 'Live Consultation Queue',
        description: 'Prevent reception bottlenecks with token-based queues',
        icon: Clock,
        href: '#features'
      },
      {
        title: 'SaaS Subscription Plans',
        description: 'Flexible starter, clinic, and hospital packages',
        icon: HeartPulse,
        href: '#pricing'
      },
      {
        title: 'Medical Blog & Guides',
        description: 'Insights on clinic transformation and digital records',
        icon: Stethoscope,
        href: '#blog'
      }
    ]
  }
]

export function MegaMenu() {
  return (
    <div className="w-[720px] max-w-[95vw] p-4 sm:p-6 lg:p-8 bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-4 lg:space-y-5">
            {/* Section Header */}
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>

            {/* Section Links */}
            <div className="space-y-2 lg:space-y-3">
              {section.items.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group block space-y-1 hover:bg-accent rounded-lg p-2.5 -mx-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6.5">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
