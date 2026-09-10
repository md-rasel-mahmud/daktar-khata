import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router"
import { type FieldValues, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Gender } from "@/enums/gender.enums"
import {
  FormInput,
  type FormInputConfig,
} from "@/components/common/form/FormInput"
import { APP_CONFIG } from "@/config/app.config"
import { useSignupMutation } from "@/lib/store/api/services/auth.service"
import { RolesEnum } from "@/enums/role.enum"

// {
//   "phone": "+8801300000000",                 // ✅ required | valid mobile number
//   "password": "000000",                      // ✅ required | string
//   "email": "patient@example.com",            // 🟡 optional  | valid email format

//   "bloodGroup": "O+",                        // ✅ required | string
//   "emergencyContact": "01812345678",         // 🟡 optional  | string
//   "medicalHistory": "Diabetic, allergic to penicillin", // 🟡 optional  | string
//   "currentMedications": ["Metformin", "Antihistamine"], // 🟡 optional  | string array

//   "fullName": "Md. Rasel Mahmud Rana",       // ✅ required | string
//   "gender": "MALE",                          // 🟡 optional  | must match Gender enum
//   "dob": "1998-04-10T00:00:00.000Z",         // 🟡 optional  | ISO date string
//   "address": "Rajshahi, Bangladesh",         // 🟡 optional  | string
//   "bio": "Frontend developer, passionate about healthcare technology." // 🟡 optional | string
// }

type SignupFormValues = {
  phone: string
  password: string
  confirmPassword: string
  email?: string

  fullName: string
  gender: Gender
  dob: string
  address: string
  bio?: string

  bloodGroup: string
  emergencyContact?: string
  medicalHistory?: string
  currentMedications?: string[]
}

const SIGNUP_DEFAULT_VALUES: SignupFormValues = {
  phone: "",
  password: "",
  confirmPassword: "",
  email: "",

  fullName: "",
  gender: Gender.MALE,
  dob: "",
  address: "",
  bio: "",

  bloodGroup: "",
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

      fullName: z.string().min(1, "Full name is required"),
      gender: z.enum(Object.values(Gender) as [string, ...string[]]),
      dob: z.string().min(1, "Date of birth is required"),
      address: z.string().min(1, "Address is required"),
      bio: z.string().optional(),

      bloodGroup: z.string().min(1, "Blood group is required"),
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

  const formData: FormInputConfig[] = [
    {
      name: "fullName",
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
      type: "text",
      placeholder: t("enter your blood group"),
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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
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
                className="bg-clinic-primary hover:bg-clinic-dark w-full lg:col-span-2"
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
