
"use client"

import {
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  Database,
  Package,
  CalendarCheck,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  FileText,
  CreditCard,
  Activity,
} from "lucide-react"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Image3D } from "@/components/image-3d"

const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:7722"

const mainFeatures = [
  {
    icon: Users,
    title: "Patient Management",
    description:
      "Maintain patient profiles, medical history, contact details, and visit records in one place.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Scheduling",
    description:
      "Organize doctor appointments, manage schedules, and reduce waiting times.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Management",
    description:
      "Manage doctor profiles, specialties, availability, and consultation schedules.",
  },
  {
    icon: ClipboardList,
    title: "Digital Prescriptions",
    description:
      "Create, manage, and access patient prescriptions and clinical records efficiently.",
  },
]

const secondaryFeatures = [
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description:
      "Manage consultation fees, invoices, payments, and patient billing records.",
  },
  {
    icon: Database,
    title: "Centralized Records",
    description:
      "Keep patient information, clinical records, and operational data organized.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Monitor appointments, patient visits, revenue, and clinic performance.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Data Access",
    description:
      "Support role-based access and protect sensitive patient information.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="outline" className="mb-4">
            Clinic Management Features
          </Badge>

          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything Your Clinic Needs to Run Smoothly
          </h2>

          <p className="text-lg text-muted-foreground">
            Simplify everyday clinic operations with a centralized platform
            for patient records, appointments, doctors, prescriptions, billing,
            and performance reports. Spend less time on administrative tasks
            and more time delivering quality patient care.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="mb-24 grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <Image3D
            lightSrc="/feature-1-light.png"
            darkSrc="/feature-1-dark.png"
            alt="Clinic management dashboard with patient and appointment information"
            direction="left"
          />

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Manage Your Clinic from One Place
              </h3>

              <p className="text-pretty text-base text-muted-foreground">
                Bring your essential clinic workflows together in one
                easy-to-use system. From registering patients to scheduling
                appointments and managing prescriptions, keep your daily
                operations organized and accessible.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature) => (
                <li
                  key={feature.title}
                  className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/5"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground">
                      {feature.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button size="lg" className="cursor-pointer">
                <a href={DASHBOARD_URL} className="flex items-center">
                  Get Started
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Smarter Workflows for Better Clinic Operations
              </h3>

              <p className="text-pretty text-base text-muted-foreground">
                Make informed decisions with organized records, transparent
                billing, and meaningful reports. Give your team a consistent
                workflow while maintaining appropriate access to sensitive
                healthcare information.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature) => (
                <li
                  key={feature.title}
                  className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/5"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground">
                      {feature.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button size="lg" className="cursor-pointer">
                <a href={`${DASHBOARD_URL}/documentation`} className="flex items-center">
                  Explore Features
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a >
              </Button >

              <Button

                size="lg"
                variant="outline"
                className="cursor-pointer"
              >
                <a
                  href="https://github.com/silicondeck/shadcn-dashboard-landing-template"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Repository
                </a>
              </Button>
            </div >
          </div >

          <Image3D
            lightSrc="/feature-2-light.png"
            darkSrc="/feature-2-dark.png"
            alt="Clinic analytics dashboard displaying operational performance"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div >
      </div >
    </section >
  )
}
