"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Card, CardContent } from "@repo/ui/card"
import { CardDecorator } from "@/components/card-decorator"
import { Github, Linkedin, Globe } from 'lucide-react'


const team = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
  return (
    <section id="team" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Our Team
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Meet the people behind Daktar Khata
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            A team of healthcare practitioners, engineers, and designers working to give every clinic a simpler way to run its practice.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {team.map((member) => (
            <Card key={member.id} className="shadow-xs py-2">
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
                          {member.fallback}
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
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} GitHub`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                    <a
                      href={member.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} Website`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
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
