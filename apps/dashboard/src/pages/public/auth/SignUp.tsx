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
import { type FieldValues, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Gender } from "@/enums/gender.enums"
import { BloodGroup } from "@/enums/blood-group.enum"
import {
  FormInput,
  type FormInputConfig,
} from "@/components/common/form/FormInput"
import { APP_CONFIG } from "@/config/app.config"
import { useSignupMutation } from "@/lib/store/api/services/auth.service"
import { RolesEnum } from "@/enums/role.enum"


type SignupFormValues = {
  phone: string
  password: string
  confirmPassword: string
  email?: string

  name: string
  gender: Gender
  dob: string
  address: string
  bio?: string

  bloodGroup: BloodGroup
  emergencyContact?: string
  medicalHistory?: string
  currentMedications?: string[]
}

const SIGNUP_DEFAULT_VALUES: SignupFormValues = {
  phone: "",
  password: "",
  confirmPassword: "",
  email: "",

  name: "",
  gender: Gender.MALE,
  dob: "",
  address: "",
  bio: "",

  bloodGroup: BloodGroup.A_POSITIVE,
  emergencyContact: "",
  medicalHistory: "",
  currentMedications: [],
}

const Signup: React.FC = () => {
  const [signupMutation, { isLoading }] = useSignupMutation()

  const signupValidationSchema = z
    .object({
      phone: z
        .string()
        .min(1, "Phone number is required")
        // Regex for Bangladeshi mobile numbers starting with +8801 or 01 and
        .regex(
          /^(?:\+?8801|01)[3-9]\d{8}$/,
          "Invalid phone number format. Must be a valid Bangladeshi mobile number starting with +8801 or 01"
        ),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm password is required"),
      email: z.string().email("Invalid email format").optional(),

      name: z.string().min(1, "Full name is required"),
      gender: z.enum(Object.values(Gender) as [string, ...string[]]),
      dob: z.string().min(1, "Date of birth is required"),
      address: z.string().min(1, "Address is required"),
      bio: z.string().optional(),

      bloodGroup: z.enum(Object.values(BloodGroup) as [string, ...string[]]),
      emergencyContact: z.string().optional(),
      medicalHistory: z.string().optional(),
      currentMedications: z.array(z.string()).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })

  const { t } = useTranslation()
  const navigate = useNavigate()
  const { handleSubmit, control, setError } = useForm({
    defaultValues: SIGNUP_DEFAULT_VALUES,
    mode: "all",
    resolver: zodResolver(signupValidationSchema),
  })

  const bloodGroupOptions = [
    { label: "A+ (Positive)", value: BloodGroup.A_POSITIVE },
    { label: "A- (Negative)", value: BloodGroup.A_NEGATIVE },
    { label: "B+ (Positive)", value: BloodGroup.B_POSITIVE },
    { label: "B- (Negative)", value: BloodGroup.B_NEGATIVE },
    { label: "AB+ (Positive)", value: BloodGroup.AB_POSITIVE },
    { label: "AB- (Negative)", value: BloodGroup.AB_NEGATIVE },
    { label: "O+ (Positive)", value: BloodGroup.O_POSITIVE },
    { label: "O- (Negative)", value: BloodGroup.O_NEGATIVE },
  ]

  const formData: FormInputConfig[] = [
    {
      name: "name",
      label: t("full name"),
      type: "text",
      placeholder: t("enter your full name"),
      required: true,
    },
    {
      name: "phone",
      label: t("phone number"),
      placeholder: t("enter your phone number"),
      type: "text",
      required: true,
    },
    {
      name: "gender",
      label: t("gender"),
      type: "select",
      options: Object.values(Gender).map((gender) => ({
        label: gender,
        value: gender,
      })),
      required: true,
    },
    {
      name: "dob",
      label: t("date of birth"),
      type: "date",
      placeholder: t("select your date of birth"),
      required: true,
    },
    {
      name: "password",
      label: t("password"),
      type: "password",
      placeholder: t("enter your password"),
      required: true,
    },
    {
      name: "confirmPassword",
      label: t("confirm password"),
      type: "password",
      placeholder: t("confirm your password"),
      required: true,
    },
    {
      name: "email",
      label: t("email"),
      type: "email",
      placeholder: t("enter your email (optional)"),
      required: false,
    },
    {
      name: "bloodGroup",
      label: t("blood group"),
      type: "select",
      options: bloodGroupOptions,
      required: true,
    },
    {
      name: "emergencyContact",
      label: t("emergency contact"),
      type: "text",
      placeholder: t("enter emergency contact number (optional)"),
      required: false,
    },
    {
      name: "medicalHistory",
      label: t("medical history"),
      type: "textarea",
      placeholder: t("enter your medical history (optional)"),
      required: false,
    },
    {
      name: "currentMedications",
      label: t("current medications"),
      type: "multiple-checkbox",
      placeholder: t("enter current medications (optional)"),
      required: false,
    },
    {
      name: "address",
      label: t("address"),
      type: "textarea",
      placeholder: t("enter your address"),
      className: "lg:col-span-2",
      required: true,
    },
  ]

  const formSubmit = (data: FieldValues) => {
    console.log("data :>> ", data)

    const postBody = { ...data }

    postBody.role = RolesEnum.PATIENT
    delete postBody.confirmPassword

    signupMutation({ postBody, setError, navigate })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-clinic-dark text-3xl font-bold">
            {APP_CONFIG.appName}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "sign up to access your dashboard and manage your health records"
            )}
          </p>
        </div>

        <Card className="border-clinic-light shadow-md">
          <CardHeader>
            <CardTitle>{t("sign up to your account")}</CardTitle>
            <CardDescription>
              {t("create an account to get started")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(formSubmit)}
              className="grid grid-cols-1 gap-2 lg:grid-cols-2"
            >
              <FormInput
                control={control as unknown as any}
                formData={formData}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full lg:col-span-2 py-5"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="w-full text-center text-sm text-muted-foreground">
              <div>
                {t("don't have an account?")}{" "}
                <Link
                  to="/auth/login"
                  className="text-clinic-primary hover:underline"
                >
                  {t("login now")}
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Signup
