"use client"

import {
  Building2,
  Stethoscope,
  Users,
  ShieldCheck,
  Activity,
  Award
} from 'lucide-react'
import { Card, CardContent } from "@repo/ui/card"
import { DotPattern } from '@/components/dot-pattern'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/api'

const iconMap: Record<string, any> = {
  Building2,
  Stethoscope,
  Users,
  ShieldCheck,
  Activity,
  Award,
}

const fallbackStats = [
  {
    icon: 'Building2',
    value: '50+',
    label: 'Clinics & Hospitals',
    description: 'Empowered across Bangladesh'
  },
  {
    icon: 'Stethoscope',
    value: '350+',
    label: 'Verified Doctors',
    description: 'Prescribing & consulting daily'
  },
  {
    icon: 'Users',
    value: '50K+',
    label: 'Patient Records',
    description: 'Safely maintained in khata'
  },
  {
    icon: 'ShieldCheck',
    value: '99.9%',
    label: 'Reliability & Uptime',
    description: 'Multi-tenant cloud platform'
  }
]

export function StatsSection() {
  const [statsData, setStatsData] = useState(fallbackStats)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE_URL}/landing-content`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data || json
          if (Array.isArray(data?.stats) && data.stats.length > 0) {
            setStatsData(data.stats)
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
    fetchStats()
  }, [])

  return (
    <section className="py-12 sm:py-16 relative">
      {/* Background with transparency */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/20" />
      <DotPattern className="opacity-75" size="md" fadeStyle="circle" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {statsData.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || ShieldCheck

            return (
              <Card
                key={index}
                className="text-center bg-background/60 backdrop-blur-sm border-border/50 py-0"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                    <p className="font-semibold text-foreground">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
