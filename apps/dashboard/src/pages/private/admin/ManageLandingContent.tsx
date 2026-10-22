import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Textarea } from "@repo/ui/textarea"
import { Skeleton } from "@repo/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs"
import {
  Plus,
  Trash2,
  Save,
  Users,
  Building2,
  BarChart3,
  HelpCircle,
  Upload,
  ExternalLink,
  MessageSquareQuote,
  LayoutTemplate,
} from "lucide-react"
import {
  useGetLandingContentQuery,
  useUpdateLandingContentMutation,
  useUploadImageMutation,
  type LandingContentData,
  type TeamMember,
  type ClientCompany,
  type CounterStat,
} from "@/lib/store/api/services/landing-content.service"
import { toast } from "sonner"

export const ManageLandingContent: React.FC = () => {
  const { t } = useTranslation()
  const { data: initialContent, isLoading } = useGetLandingContentQuery()
  const [updateLandingContent, { isLoading: isSaving }] =
    useUpdateLandingContentMutation()
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation()

  const [form, setForm] = useState<LandingContentData>({
    heroTitle: "",
    heroSubtitle: "",
    heroBadge: "",
    stats: [],
    partnersTitle: "",
    partners: [],
    teamTitle: "",
    teamSubtitle: "",
    team: [],
    testimonialsTitle: "",
    testimonials: [],
    faqs: [],
  })

  useEffect(() => {
    if (initialContent) {
      setForm({
        heroTitle: initialContent.heroTitle || "",
        heroSubtitle: initialContent.heroSubtitle || "",
        heroBadge: initialContent.heroBadge || "",
        stats: initialContent.stats || [],
        partnersTitle: initialContent.partnersTitle || "",
        partners: initialContent.partners || [],
        teamTitle: initialContent.teamTitle || "",
        teamSubtitle: initialContent.teamSubtitle || "",
        team: initialContent.team || [],
        testimonialsTitle: initialContent.testimonialsTitle || "",
        testimonials: initialContent.testimonials || [],
        faqs: initialContent.faqs || [],
      })
    }
  }, [initialContent])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      await updateLandingContent(form).unwrap()
      toast.success(t("Landing page content updated successfully!"))
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to update landing content"))
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await uploadImage(formData).unwrap()
      if (res?.url) {
        onSuccess(res.url)
        toast.success(t("Image uploaded successfully"))
      }
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to upload image"))
    }
  }

  // Team Member Helpers
  const addTeamMember = () => {
    setForm((prev) => ({
      ...prev,
      team: [
        ...(prev.team || []),
        {
          name: "Dr. New Specialist",
          role: "Consultant / Lead",
          description: "Healthcare practitioner focused on patient outcomes.",
          image: "",
          fallback: "DR",
          social: { linkedin: "", github: "", website: "" },
        },
      ],
    }))
  }

  const updateTeamMember = (index: number, field: keyof TeamMember, val: any) => {
    setForm((prev) => {
      const nextTeam = [...(prev.team || [])]
      nextTeam[index] = { ...nextTeam[index], [field]: val }
      return { ...prev, team: nextTeam }
    })
  }

  const removeTeamMember = (index: number) => {
    setForm((prev) => ({
      ...prev,
      team: (prev.team || []).filter((_, i) => i !== index),
    }))
  }

  // Partners / Companies Helpers
  const addPartner = () => {
    setForm((prev) => ({
      ...prev,
      partners: [
        ...(prev.partners || []),
        { name: "New Partner Hospital / Clinic", logo: "", website: "" },
      ],
    }))
  }

  const updatePartner = (index: number, field: keyof ClientCompany, val: any) => {
    setForm((prev) => {
      const nextPartners = [...(prev.partners || [])]
      nextPartners[index] = { ...nextPartners[index], [field]: val }
      return { ...prev, partners: nextPartners }
    })
  }

  const removePartner = (index: number) => {
    setForm((prev) => ({
      ...prev,
      partners: (prev.partners || []).filter((_, i) => i !== index),
    }))
  }

  // Counter Stats Helpers
  const addStat = () => {
    setForm((prev) => ({
      ...prev,
      stats: [
        ...(prev.stats || []),
        { label: "New Metric", value: "100+", description: "Metric description" },
      ],
    }))
  }

  const updateStat = (index: number, field: keyof CounterStat, val: any) => {
    setForm((prev) => {
      const nextStats = [...(prev.stats || [])]
      nextStats[index] = { ...nextStats[index], [field]: val }
      return { ...prev, stats: nextStats }
    })
  }

  const removeStat = (index: number) => {
    setForm((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index),
    }))
  }

  // Testimonial Helpers
  const addTestimonial = () => {
    setForm((prev) => ({
      ...prev,
      testimonials: [
        ...(prev.testimonials || []),
        {
          name: "Dr. Consultant",
          role: "Chief Physician",
          clinic: "Prime Care Hospital",
          image: "",
          quote: "Daktar Khata modernized our entire clinic appointment and prescription workflow.",
        },
      ],
    }))
  }

  const updateTestimonial = (index: number, field: string, val: any) => {
    setForm((prev) => {
      const nextTestimonials = [...(prev.testimonials || [])]
      nextTestimonials[index] = { ...nextTestimonials[index], [field]: val }
      return { ...prev, testimonials: nextTestimonials }
    })
  }

  const removeTestimonial = (index: number) => {
    setForm((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((_, i) => i !== index),
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="fadeIn space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("Manage Landing Page Content")}
          </h1>
          <p className="text-muted-foreground">
            {t("Configure all public sections dynamically: Hero, Team, Trusted Companies, Counters, and Testimonials.")}
          </p>
        </div>

        <Button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="font-semibold cursor-pointer shadow-sm"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? t("Saving Changes...") : t("Save All Changes")}
        </Button>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="team" className="font-semibold">
            <Users className="mr-2 h-4 w-4" />
            {t("Team Section")}
          </TabsTrigger>
          <TabsTrigger value="partners" className="font-semibold">
            <Building2 className="mr-2 h-4 w-4" />
            {t("Trusted Partners / Logos")}
          </TabsTrigger>
          <TabsTrigger value="stats" className="font-semibold">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t("Counter Stats")}
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="font-semibold">
            <MessageSquareQuote className="mr-2 h-4 w-4" />
            {t("Testimonials")}
          </TabsTrigger>
          <TabsTrigger value="hero" className="font-semibold">
            <LayoutTemplate className="mr-2 h-4 w-4" />
            {t("Hero Header")}
          </TabsTrigger>
        </TabsList>

        {/* 1. TEAM SECTION TAB */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("Our Team Members")}</CardTitle>
                <CardDescription>
                  {t("Add, edit, or remove leadership and doctors displayed in the Team section.")}
                </CardDescription>
              </div>
              <Button onClick={addTeamMember} size="sm" variant="outline">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("Add Team Member")}
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
                <div className="space-y-1.5">
                  <Label>{t("Section Heading")}</Label>
                  <Input
                    value={form.teamTitle}
                    onChange={(e) =>
                      setForm({ ...form, teamTitle: e.target.value })
                    }
                    placeholder="Meet the people behind Daktar Khata"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("Section Subtitle")}</Label>
                  <Input
                    value={form.teamSubtitle}
                    onChange={(e) =>
                      setForm({ ...form, teamSubtitle: e.target.value })
                    }
                    placeholder="Brief description about your mission..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(form.team || []).map((member, index) => (
                  <Card key={index} className="p-4 border bg-card/60 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => removeTeamMember(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="space-y-3 pr-8">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("Name")} *</Label>
                          <Input
                            value={member.name}
                            onChange={(e) =>
                              updateTeamMember(index, "name", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("Role / Title")} *</Label>
                          <Input
                            value={member.role}
                            onChange={(e) =>
                              updateTeamMember(index, "role", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("Bio / Description")}</Label>
                        <Textarea
                          rows={2}
                          value={member.description || ""}
                          onChange={(e) =>
                            updateTeamMember(index, "description", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("Avatar Image (Upload or URL)")}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={member.image || ""}
                            onChange={(e) =>
                              updateTeamMember(index, "image", e.target.value)
                            }
                            placeholder="https://... or upload"
                            className="text-xs flex-1"
                          />
                          <label className="cursor-pointer">
                            <span className="inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-medium bg-secondary hover:bg-secondary/80">
                              <Upload className="h-3.5 w-3.5 mr-1" />
                              {t("Upload")}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) =>
                                  updateTeamMember(index, "image", url)
                                )
                              }
                            />
                          </label>
                        </div>
                        {member.image && (
                          <div className="flex items-center gap-2 mt-1">
                            <img
                              src={member.image}
                              alt="Avatar"
                              className="h-10 w-10 rounded-full object-cover border"
                            />
                            <span className="text-[11px] text-muted-foreground truncate">
                              {member.image}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. TRUSTED PARTNERS / LOGOS */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("Trusted by Leading Companies / Clinics")}</CardTitle>
                <CardDescription>
                  {t("Logos and names of hospitals and clinics featured in the infinite scrolling carousel.")}
                </CardDescription>
              </div>
              <Button onClick={addPartner} size="sm" variant="outline">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("Add Partner / Clinic")}
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-1.5 max-w-lg pb-4 border-b">
                <Label>{t("Carousel Heading")}</Label>
                <Input
                  value={form.partnersTitle}
                  onChange={(e) =>
                    setForm({ ...form, partnersTitle: e.target.value })
                  }
                  placeholder="Trusted by Leading Healthcare Clinics & Medical Centers"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(form.partners || []).map((partner, index) => (
                  <Card key={index} className="p-4 border relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removePartner(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    <div className="space-y-2.5 pr-6">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("Clinic / Company Name")}</Label>
                        <Input
                          value={partner.name}
                          onChange={(e) =>
                            updatePartner(index, "name", e.target.value)
                          }
                          placeholder="e.g. Medicare Center"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("Logo (Upload image or leave empty for text badge)")}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={partner.logo || ""}
                            onChange={(e) =>
                              updatePartner(index, "logo", e.target.value)
                            }
                            placeholder="Logo URL or upload"
                            className="text-xs flex-1"
                          />
                          <label className="cursor-pointer">
                            <span className="inline-flex items-center px-2.5 py-1.5 border rounded-md text-xs font-medium bg-secondary hover:bg-secondary/80">
                              <Upload className="h-3.5 w-3.5" />
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) =>
                                  updatePartner(index, "logo", url)
                                )
                              }
                            />
                          </label>
                        </div>
                        {partner.logo && partner.logo.startsWith("http") && (
                          <div className="h-8 w-24 bg-muted/40 rounded p-1 border flex items-center justify-center">
                            <img
                              src={partner.logo}
                              alt="Logo"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. COUNTER STATS (NICHER COUNT) */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("Platform Impact Numbers (Nicher Count)")}</CardTitle>
                <CardDescription>
                  {t("Dynamic count values displayed in the statistics section under the hero.")}
                </CardDescription>
              </div>
              <Button onClick={addStat} size="sm" variant="outline">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("Add Stat Metric")}
              </Button>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(form.stats || []).map((stat, index) => (
                  <Card key={index} className="p-4 border relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeStat(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    <div className="space-y-2.5 pr-6">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("Number Value")}</Label>
                        <Input
                          value={stat.value}
                          onChange={(e) =>
                            updateStat(index, "value", e.target.value)
                          }
                          placeholder="e.g. 50+ or 99.9%"
                          className="font-bold text-lg"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("Metric Label")}</Label>
                        <Input
                          value={stat.label}
                          onChange={(e) =>
                            updateStat(index, "label", e.target.value)
                          }
                          placeholder="e.g. Clinics & Hospitals"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("Description")}</Label>
                        <Input
                          value={stat.description || ""}
                          onChange={(e) =>
                            updateStat(index, "description", e.target.value)
                          }
                          placeholder="e.g. Empowered nationwide"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. TESTIMONIALS */}
        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("Doctor & Clinic Testimonials")}</CardTitle>
                <CardDescription>
                  {t("Client reviews and doctor quotes displayed on the landing page.")}
                </CardDescription>
              </div>
              <Button onClick={addTestimonial} size="sm" variant="outline">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("Add Testimonial")}
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-1.5 max-w-lg pb-4 border-b">
                <Label>{t("Section Heading")}</Label>
                <Input
                  value={form.testimonialsTitle}
                  onChange={(e) =>
                    setForm({ ...form, testimonialsTitle: e.target.value })
                  }
                  placeholder="Trusted by Doctors & Clinics Across the Country"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(form.testimonials || []).map((testi, index) => (
                  <Card key={index} className="p-4 border relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeTestimonial(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    <div className="space-y-3 pr-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("Doctor / Client Name")} *</Label>
                          <Input
                            value={testi.name}
                            onChange={(e) =>
                              updateTestimonial(index, "name", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("Designation / Role")}</Label>
                          <Input
                            value={testi.role}
                            onChange={(e) =>
                              updateTestimonial(index, "role", e.target.value)
                            }
                            placeholder="Consultant, Medicine"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("Clinic / Hospital Name")}</Label>
                        <Input
                          value={testi.clinic || ""}
                          onChange={(e) =>
                            updateTestimonial(index, "clinic", e.target.value)
                          }
                          placeholder="Care Diagnostic Center"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("Quote / Review")} *</Label>
                        <Textarea
                          rows={3}
                          value={testi.quote}
                          onChange={(e) =>
                            updateTestimonial(index, "quote", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("Photo (Upload or URL)")}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={testi.image || ""}
                            onChange={(e) =>
                              updateTestimonial(index, "image", e.target.value)
                            }
                            placeholder="Image URL or upload"
                            className="text-xs flex-1"
                          />
                          <label className="cursor-pointer">
                            <span className="inline-flex items-center px-2.5 py-1.5 border rounded-md text-xs font-medium bg-secondary hover:bg-secondary/80">
                              <Upload className="h-3.5 w-3.5" />
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) =>
                                  updateTestimonial(index, "image", url)
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. HERO TAB */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Hero Header Configuration")}</CardTitle>
              <CardDescription>
                {t("The primary headline, badge, and value proposition at the top of the landing page.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="space-y-1.5">
                <Label>{t("Badge Text")}</Label>
                <Input
                  value={form.heroBadge}
                  onChange={(e) =>
                    setForm({ ...form, heroBadge: e.target.value })
                  }
                  placeholder="Tailored for the Modern Patient"
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("Main Headline")}</Label>
                <Input
                  value={form.heroTitle}
                  onChange={(e) =>
                    setForm({ ...form, heroTitle: e.target.value })
                  }
                  placeholder="Run Your Clinic with One Simple Khata"
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("Subheading")}</Label>
                <Textarea
                  rows={4}
                  value={form.heroSubtitle}
                  onChange={(e) =>
                    setForm({ ...form, heroSubtitle: e.target.value })
                  }
                  placeholder="Brief summary of your platform benefits..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ManageLandingContent
