"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Badge } from "@repo/ui/badge"
import { Card, CardContent } from "@repo/ui/card"
import { CardDecorator } from "@/components/card-decorator"
import { Github, Linkedin, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/api'

const fallbackTeam = [
  {
    name: 'Dr. Nahid Hasan',
    role: 'Founder & CEO',
    description: 'Practicing physician turned builder, automating clinic workflows across Bangladesh.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=60&w=150&auto=format&fit=crop',
    fallback: 'NH',
    social: {
      linkedin: '#',
      github: '#',
      website: '#'
    }
  },
  {
    name: 'Dr. Farhana Akter',
    role: 'Co-founder & Clinical Success',
    description: 'Leads onboarding and ensures every doctor gets real value from day one.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=60&w=150&auto=format&fit=crop',
    fallback: 'FA',
    social: {
      linkedin: '#',
      github: '#',
      website: '#'
    }
  },
  {
    name: 'Sohel Rana',
    role: 'Engineering Lead',
    description: 'Brings 10+ years of platform engineering to keep Daktar Khata fast and reliable.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=60&w=150&auto=format&fit=crop',
    fallback: 'SR',
    social: {
      linkedin: '#',
      github: '#',
      website: '#'
    }
  },
  {
    name: 'Nusrat Jahan',
    role: 'Product Designer',
    description: 'Designs the simple, warm interfaces doctors actually enjoy using.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=60&w=150&auto=format&fit=crop',
    fallback: 'NJ',
    social: {
      linkedin: '#',
      github: '#',
      website: '#'
    }
  },
  {
    name: 'Rakibul Islam',
    role: 'Backend Engineer',
    description: 'Owns the khata — billing, records, and the data doctors trust every day.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=60&w=150&auto=format&fit=crop',
    fallback: 'RI',
    social: {
      linkedin: '#',
      github: '#',
      website: '#'
    }
  },
  {
    name: 'Tanzina Rahman',
    role: 'Customer Success',
    description: 'Makes sure clinics, receptionists, and doctors all get the help they need.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=60&w=150&auto=format&fit=crop',
    fallback: 'TR',
    social: {
      linkedin: '#',
      github: '#',
      website: '#'
    }
  }
]

export function TeamSection() {
  const [teamMembers, setTeamMembers] = useState(fallbackTeam)
  const [title, setTitle] = useState('Meet the people behind Daktar Khata')
  const [subtitle, setSubtitle] = useState(
    'A team of healthcare practitioners, engineers, and designers working to give every clinic a simpler way to run its practice.'
  )

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`${API_BASE_URL}/landing-content`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data || json
          if (data?.teamTitle) setTitle(data.teamTitle)
          if (data?.teamSubtitle) setSubtitle(data.teamSubtitle)
          if (Array.isArray(data?.team) && data.team.length > 0) {
            setTeamMembers(data.team)
          }
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchTeam()
  }, [])

  return (
    <section id="team" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Our Team
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {subtitle}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {teamMembers.map((member, idx) => {
            const initials = member.name
              ? member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
              : 'DK'

            return (
              <Card key={idx} className="shadow-xs py-2">
                <CardContent className="p-4">
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <CardDecorator>
                        <Avatar className="h-24 w-24 border shadow-lg">
                          <AvatarImage
                            src={member.image}
                            alt={member.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-lg font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </CardDecorator>
                    </div>

                    {/* Name and Role */}
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-primary mb-3">
                      {member.role}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {member.description}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-3">
                      {member.social?.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {member.social?.github && (
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} GitHub`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {member.social?.website && (
                        <a
                          href={member.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} Website`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
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
