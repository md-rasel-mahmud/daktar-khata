"use client"

import { Check, Loader2 } from 'lucide-react'
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/toggle-group"
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/api'

interface SubscriptionPlan {
  _id: string
  planName: string
  description?: string
  monthlyPrice: number
  halfYearlyPrice: number
  yearlyPrice: number
  doctorLimit: number
  patientLimit: number
  staffLimit: number
}

// Fallback plans if backend is initializing
const fallbackPlans: SubscriptionPlan[] = [
  {
    _id: "starter",
    planName: 'Starter Clinic',
    description: 'For solo doctors and emerging private practices',
    monthlyPrice: 0,
    halfYearlyPrice: 0,
    yearlyPrice: 0,
    doctorLimit: 1,
    patientLimit: 500,
    staffLimit: 2,
  },
  {
    _id: "growth",
    planName: 'Growth Clinic',
    description: 'For growing clinics with multiple doctors and diagnostic desk',
    monthlyPrice: 1500,
    halfYearlyPrice: 8000,
    yearlyPrice: 15000,
    doctorLimit: 5,
    patientLimit: 2500,
    staffLimit: 10,
  },
  {
    _id: "enterprise",
    planName: 'Hospital Enterprise',
    description: 'For multi-branch hospitals, admitted patient care and OT workflows',
    monthlyPrice: 4500,
    halfYearlyPrice: 24000,
    yearlyPrice: 45000,
    doctorLimit: -1,
    patientLimit: -1,
    staffLimit: -1,
  }
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [plans, setPlans] = useState<SubscriptionPlan[]>(fallbackPlans)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch(`${API_BASE_URL}/subscription/plans`, {
          cache: 'no-store'
        })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data || json
          if (Array.isArray(data) && data.length > 0) {
            setPlans(data)
          }
        }
      } catch (err) {
        console.error("Failed to fetch subscription plans, using fallback:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadPlans()
  }, [])

  const signupUrl =
    (process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:7722") +
    "/auth/signup"

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">Transparent Pricing</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, honest pricing for clinics & doctors
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Manage your appointments, digital prescriptions, patient records, and billing with zero hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              value={isYearly ? ["yearly"] : ["monthly"]}
              onValueChange={(value) => setIsYearly(value[0] === "yearly")}
              className="bg-secondary text-secondary-foreground border-none rounded-full p-1 cursor-pointer shadow-none"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-pressed:bg-background data-pressed:border-border border-transparent border px-6 !rounded-full data-pressed:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="data-pressed:bg-background data-pressed:border-border border-transparent border px-6 !rounded-full data-pressed:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Annually
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Save more</span> with Annual Billing
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => {
                const isPopular = index === 1
                const price = isYearly
                  ? (plan.yearlyPrice || plan.monthlyPrice * 10)
                  : (plan.monthlyPrice || 0)

                return (
                  <div
                    key={plan._id || plan.planName}
                    className={`p-8 grid grid-rows-subgrid row-span-4 gap-6 ${isPopular
                      ? 'my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur'
                      : ''
                      }`}
                  >
                    {/* Plan Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-medium tracking-tight mb-2">
                          {plan.planName}
                        </div>
                        {isPopular && (
                          <Badge className="bg-primary text-white text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-balance text-sm">
                        {plan.description || "Comprehensive clinic management plan with instant activation."}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <div className="text-4xl font-bold mb-1">
                        {price === 0 ? (
                          'Free'
                        ) : (
                          <>৳{price.toLocaleString()}</>
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {price === 0
                          ? 'Forever free for solo doctors'
                          : isYearly
                          ? 'Per year (Billed annually)'
                          : 'Per month'}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div>
                      <a
                        href={signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          className={`w-full cursor-pointer my-2 ${isPopular
                            ? 'shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90'
                            : 'shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50'
                            }`}
                          variant={isPopular ? 'default' : 'secondary'}
                        >
                          {price === 0 ? 'Get Started Free' : 'Start 3-Day Free Demo'}
                        </Button>
                      </a>
                    </div>

                    {/* Features */}
                    <div>
                      <ul role="list" className="space-y-3 text-sm">
                        <li className="flex items-center gap-3">
                          <Check className="text-emerald-600 size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>
                            {plan.doctorLimit === -1
                              ? "Unlimited Doctors & Specialists"
                              : `Up to ${plan.doctorLimit} Doctors`}
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="text-emerald-600 size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>
                            {plan.patientLimit === -1
                              ? "Unlimited Patient Records"
                              : `Up to ${plan.patientLimit.toLocaleString()} Patients`}
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="text-emerald-600 size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>
                            {plan.staffLimit === -1
                              ? "Unlimited Staff & Receptionists"
                              : `Up to ${plan.staffLimit} Staff Accounts`}
                          </span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="text-emerald-600 size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>Digital Prescriptions & Patient History</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="text-emerald-600 size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>Appointment Scheduling & Daily Khata</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Check className="text-emerald-600 size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>Income, Expense & Billing Reports</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Enterprise Note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need a custom multi-branch hospital setup or private cloud?{' '}
            <a href="#contact" className="inline-flex">
              <Button variant="link" className="p-0 h-auto cursor-pointer font-semibold">
                Contact our sales team
              </Button>
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}