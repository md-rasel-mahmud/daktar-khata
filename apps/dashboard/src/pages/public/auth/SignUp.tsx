import React, { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Gender } from "@/enums/gender.enums"
import { BloodGroup } from "@/enums/blood-group.enum"
import { APP_CONFIG } from "@/config/app.config"
import { useSignupMutation } from "@/lib/store/api/services/auth.service"
import { useGetPublicClinicsQuery } from "@/lib/store/api/services/clinic.service"
import { RolesEnum } from "@/enums/role.enum"
import {
  User,
  Building2,
  Stethoscope,
  Check,
  Search,
  Loader2,
  MapPin,
  Phone,
  Building,
  Sparkles,
} from "lucide-react"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Textarea } from "@repo/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { Badge } from "@repo/ui/badge"
import { toast } from "sonner"

type SignupType = "PATIENT" | "MERCHANT" | "DOCTOR"

const phoneRegex = /^(?:\+?8801|01)[3-9]\d{8}$/

export const SignUp: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [signupType, setSignupType] = useState<SignupType>("PATIENT")
  const [selectedClinicId, setSelectedClinicId] = useState<string>("")
  const [clinicSearch, setClinicSearch] = useState<string>("")
  const [signupMutation, { isLoading: isSubmitting }] = useSignupMutation()

  const { data: publicClinics = [], isLoading: isLoadingClinics } =
    useGetPublicClinicsQuery()

  const filteredClinics = useMemo(() => {
    if (!clinicSearch.trim()) return publicClinics
    const q = clinicSearch.toLowerCase()
    return publicClinics.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.contactNumber?.includes(q)
    )
  }, [publicClinics, clinicSearch])

  const selectedClinic = useMemo(
    () => publicClinics.find((c: any) => c._id === selectedClinicId),
    [publicClinics, selectedClinicId]
  )

  // Validation Schema
  const signupSchema = z
    .object({
      name: z.string().min(2, t("Name must be at least 2 characters")),
      phone: z.string().regex(phoneRegex, t("Enter a valid Bangladeshi phone number (e.g. 017xxxxxxxx)")),
      password: z.string().min(6, t("Password must be at least 6 characters")),
      confirmPassword: z.string().min(6, t("Confirm password is required")),
      email: z.string().email(t("Invalid email address")).optional().or(z.literal("")),
      gender: z.enum([Gender.MALE, Gender.FEMALE]),
      address: z.string().optional(),

      // Patient specific
      bloodGroup: z.string().optional(),
      emergencyContact: z.string().optional(),
      medicalHistory: z.string().optional(),

      // Clinic owner specific
      clinicName: z.string().optional(),
      clinicAddress: z.string().optional(),
      subdomain: z.string().optional(),
      licenseNumber: z.string().optional(),

      // Doctor specific
      specialization: z.string().optional(),
      designation: z.string().optional(),
      experienceInYears: z.number().optional(),
      fee: z.number().optional(),
      degree: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("Passwords do not match"),
      path: ["confirmPassword"],
    })
    .refine(
      (data) => {
        if (signupType === "MERCHANT") {
          return !!data.clinicName && data.clinicName.length >= 2
        }
        return true
      },
      {
        message: t("Clinic name is required for Clinic Owners"),
        path: ["clinicName"],
      }
    )
    .refine(
      (data) => {
        if (signupType === "MERCHANT") {
          return !!data.subdomain && /^[a-z0-9-]+$/.test(data.subdomain)
        }
        return true
      },
      {
        message: t("A valid subdomain slug is required (e.g. apollo-clinic)"),
        path: ["subdomain"],
      }
    )

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
      email: "",
      gender: Gender.MALE,
      address: "",
      bloodGroup: BloodGroup.A_POSITIVE,
      subdomain: "",
      clinicName: "",
      clinicAddress: "",
      licenseNumber: "",
      specialization: "General Physician",
      designation: "Consultant",
      experienceInYears: 3,
      fee: 500,
      degree: "MBBS",
    },
  })

  const onSubmit = async (values: any) => {
    try {
      const payload: any = {
        name: values.name,
        phone: values.phone,
        password: values.password,
        email: values.email || undefined,
        gender: values.gender,
        address: values.address || "",
      }

      if (signupType === "PATIENT") {
        payload.role = RolesEnum.PATIENT
        payload.bloodGroup = values.bloodGroup
        payload.emergencyContact = values.emergencyContact
        payload.medicalHistory = values.medicalHistory
        if (selectedClinic) {
          payload.merchant = selectedClinic.merchant
          payload.clinic = selectedClinic._id
        }
      } else if (signupType === "MERCHANT") {
        payload.role = RolesEnum.MERCHANT
        payload.clinicName = values.clinicName
        payload.clinicAddress = values.clinicAddress || values.address
        payload.subdomain = values.subdomain?.trim().toLowerCase()
        payload.domain = `${values.subdomain?.trim().toLowerCase()}.localhost`
        payload.licenseNumber = values.licenseNumber || `LIC-${Date.now()}`
      } else if (signupType === "DOCTOR") {
        payload.role = RolesEnum.DOCTOR
        payload.specialization = [values.specialization || "General Physician"]
        payload.designation = values.designation || "Doctor"
        payload.experienceInYears = Number(values.experienceInYears) || 0
        payload.fee = Number(values.fee) || 500
        payload.degree = [{ name: values.degree || "MBBS", university: "Medical College", year: 2020 }]
        if (selectedClinic) {
          payload.merchant = selectedClinic.merchant
          payload.clinic = selectedClinic._id
        }
      }

      await signupMutation({ postBody: payload, setError, navigate }).unwrap()

      if (signupType === "DOCTOR" && payload.merchant) {
        toast.info(t("Doctor Account Registered"), {
          description: t("Your account has been submitted and is pending clinic approval."),
        })
      } else if (signupType === "MERCHANT") {
        toast.success(t("Clinic Created Successfully!"), {
          description: t("Welcome! Your 3-day demo period is now active."),
        })
      } else {
        toast.success(t("Registration Successful"), {
          description: t("Welcome to Daktar Khata!"),
        })
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || t("Registration failed")
      toast.error(t("Signup Failed"), { description: msg })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {APP_CONFIG.appName}
          </h1>
          <p className="text-muted-foreground">
            {t("Choose your registration type to get started")}
          </p>
        </div>

        {/* 3 User Types Selector */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setSignupType("PATIENT")
              setSelectedClinicId("")
            }}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
              signupType === "PATIENT"
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className={`rounded-full p-2.5 ${signupType === "PATIENT" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold">{t("Patient")}</div>
              <div className="text-xs text-muted-foreground">
                {t("Book appointments & manage health records")}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSignupType("MERCHANT")
              setSelectedClinicId("")
            }}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
              signupType === "MERCHANT"
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className={`rounded-full p-2.5 ${signupType === "MERCHANT" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 font-semibold">
                {t("Clinic Owner")}
                <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">
                  {t("3-Day Demo")}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {t("Manage clinics, doctors, staff & patients")}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSignupType("DOCTOR")
              setSelectedClinicId("")
            }}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
              signupType === "DOCTOR"
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className={`rounded-full p-2.5 ${signupType === "DOCTOR" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold">{t("Doctor")}</div>
              <div className="text-xs text-muted-foreground">
                {t("Join a clinic or practice independently")}
              </div>
            </div>
          </button>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>
              {signupType === "PATIENT" && t("Patient Registration")}
              {signupType === "MERCHANT" && t("Clinic Owner Registration")}
              {signupType === "DOCTOR" && t("Doctor Registration")}
            </CardTitle>
            <CardDescription>
              {signupType === "PATIENT" &&
                t("Create your patient account. You can optionally link with your local clinic.")}
              {signupType === "MERCHANT" &&
                t("Register your clinic tenant. You receive an automatic 3-day full demo period.")}
              {signupType === "DOCTOR" &&
                t("Register as a doctor. Select your clinic to request approval or register independently.")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Common Account Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("Full Name")} *</Label>
                  <Input
                    id="name"
                    placeholder={t("e.g. Dr. John Doe or Jane Doe")}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message as string}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("Phone Number")} *</Label>
                  <Input
                    id="phone"
                    placeholder="017xxxxxxxx"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message as string}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("Email Address")} ({t("Optional")})</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message as string}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender">{t("Gender")} *</Label>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select Gender")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Gender.MALE}>{t("Male")}</SelectItem>
                          <SelectItem value={Gender.FEMALE}>{t("Female")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("Password")} *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message as string}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">{t("Confirm Password")} *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* CLINIC OWNER SPECIFIC FIELDS */}
              {signupType === "MERCHANT" && (
                <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="h-4 w-4" />
                    {t("Clinic Setup & Multi-Tenant Domain")}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="clinicName">{t("Clinic Name")} *</Label>
                      <Input
                        id="clinicName"
                        placeholder="e.g. Apollo Diagnostics"
                        {...register("clinicName")}
                      />
                      {errors.clinicName && (
                        <p className="text-xs text-destructive">
                          {errors.clinicName.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subdomain">{t("Tenant Subdomain")} *</Label>
                      <div className="flex items-center">
                        <Input
                          id="subdomain"
                          placeholder="apollo"
                          className="rounded-r-none"
                          {...register("subdomain")}
                        />
                        <span className="flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-3 text-xs text-muted-foreground">
                          .localhost
                        </span>
                      </div>
                      {errors.subdomain && (
                        <p className="text-xs text-destructive">
                          {errors.subdomain.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="clinicAddress">{t("Clinic Address")} *</Label>
                      <Input
                        id="clinicAddress"
                        placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
                        {...register("clinicAddress")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PATIENT SPECIFIC FIELDS */}
              {signupType === "PATIENT" && (
                <div className="space-y-4 rounded-xl border border-muted p-4">
                  <div className="font-semibold text-sm">{t("Medical & Emergency Information")}</div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bloodGroup">{t("Blood Group")}</Label>
                      <Controller
                        control={control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select Blood Group")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={BloodGroup.A_POSITIVE}>A+ (Positive)</SelectItem>
                              <SelectItem value={BloodGroup.A_NEGATIVE}>A- (Negative)</SelectItem>
                              <SelectItem value={BloodGroup.B_POSITIVE}>B+ (Positive)</SelectItem>
                              <SelectItem value={BloodGroup.B_NEGATIVE}>B- (Negative)</SelectItem>
                              <SelectItem value={BloodGroup.AB_POSITIVE}>AB+ (Positive)</SelectItem>
                              <SelectItem value={BloodGroup.AB_NEGATIVE}>AB- (Negative)</SelectItem>
                              <SelectItem value={BloodGroup.O_POSITIVE}>O+ (Positive)</SelectItem>
                              <SelectItem value={BloodGroup.O_NEGATIVE}>O- (Negative)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="emergencyContact">{t("Emergency Contact Number")}</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="018xxxxxxxx"
                        {...register("emergencyContact")}
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="address">{t("Patient Address")}</Label>
                      <Input
                        id="address"
                        placeholder={t("Enter your address")}
                        {...register("address")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DOCTOR SPECIFIC FIELDS */}
              {signupType === "DOCTOR" && (
                <div className="space-y-4 rounded-xl border border-muted p-4">
                  <div className="font-semibold text-sm">{t("Medical Qualifications")}</div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="specialization">{t("Specialization")} *</Label>
                      <Input
                        id="specialization"
                        placeholder="e.g. Cardiology, Pediatrics"
                        {...register("specialization")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="designation">{t("Designation")} *</Label>
                      <Input
                        id="designation"
                        placeholder="e.g. Senior Consultant"
                        {...register("designation")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="experienceInYears">{t("Experience (Years)")}</Label>
                      <Input
                        id="experienceInYears"
                        type="number"
                        min="0"
                        {...register("experienceInYears", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="fee">{t("Consultation Fee (BDT)")}</Label>
                      <Input
                        id="fee"
                        type="number"
                        min="0"
                        {...register("fee", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CLINIC / TENANT SELECTION (For Patient or Doctor) */}
              {(signupType === "PATIENT" || signupType === "DOCTOR") && (
                <div className="space-y-3 rounded-xl border p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        {signupType === "DOCTOR"
                          ? t("Select Clinic to Join (Required for clinic affiliation)")
                          : t("Select Clinic (Optional)")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {signupType === "DOCTOR"
                          ? t("Your application will be sent to the clinic administrator for approval.")
                          : t("Link your account directly with your preferred clinic or branch.")}
                      </div>
                    </div>
                    {selectedClinicId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClinicId("")}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t("Clear Selection")}
                      </Button>
                    )}
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("Search clinics by name, address, or phone...")}
                      value={clinicSearch}
                      onChange={(e) => setClinicSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {isLoadingClinics ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredClinics.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                      {t("No clinics found matching your search. You can continue without selecting a clinic.")}
                    </div>
                  ) : (
                    <div className="grid max-h-56 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                      {filteredClinics.map((clinic: any) => {
                        const isSelected = selectedClinicId === clinic._id
                        return (
                          <div
                            key={clinic._id}
                            onClick={() => setSelectedClinicId(clinic._id)}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                              {clinic.logo ? (
                                <img
                                  src={clinic.logo}
                                  alt={clinic.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <Building className="h-5 w-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="truncate text-sm font-semibold">{clinic.name}</p>
                                {isSelected && (
                                  <Check className="h-4 w-4 shrink-0 text-primary" />
                                )}
                              </div>
                              {clinic.address && (
                                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {clinic.address}
                                </p>
                              )}
                              {clinic.contactNumber && (
                                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Phone className="h-3 w-3 shrink-0" />
                                  {clinic.contactNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full py-5 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Registering...")}
                  </>
                ) : (
                  <>
                    {signupType === "MERCHANT" && t("Create Clinic & Start 3-Day Demo")}
                    {signupType === "DOCTOR" && t("Register as Doctor")}
                    {signupType === "PATIENT" && t("Complete Patient Registration")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t py-4">
            <div className="text-sm text-muted-foreground">
              {t("Already have an account?")}{" "}
              <Link to="/auth/login" className="font-semibold text-primary hover:underline">
                {t("Login here")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default SignUp
