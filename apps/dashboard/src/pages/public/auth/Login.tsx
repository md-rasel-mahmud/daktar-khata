import React, { useEffect } from "react"
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
import { useForm, type FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  FormInput,
  type FormInputConfig,
} from "@/components/common/form/FormInput"
import { APP_CONFIG } from "@/config/app.config"
import { useLoginMutation } from "@/lib/store/api/services/auth.service"

import { useSelector } from "react-redux"
import { RolesEnum } from "@/enums/role.enum"
import { type RootState } from "@/lib/store/store"

type LoginFormValues = {
  phone: string
  password: string
}

const LOGIN_DEFAULT_VALUES: LoginFormValues = {
  phone: "",
  password: "",
}

const Login: React.FC = () => {
  const [loginMutation, { isLoading }] = useLoginMutation()
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const loginValidationSchema = z.object({
    phone: z.string().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })

  const { t } = useTranslation()
  const navigate = useNavigate()
  const { handleSubmit, control, setError } = useForm({
    defaultValues: LOGIN_DEFAULT_VALUES,
    mode: "all",
    resolver: zodResolver(loginValidationSchema),
  })

  const formData: FormInputConfig[] = [
    {
      name: "phone",
      label: t("phone number"),
      placeholder: t("enter your phone number"),
      type: "text",
      required: true,
    },
    {
      name: "password",
      label: t("password"),
      type: "password",
      placeholder: t("enter your password"),
      required: true,
    },
  ]

  const formSubmit = (data: FieldValues) => {
    const postBody = { ...data }
    delete postBody.confirmPassword

    loginMutation({ postBody, setError, navigate })
  }

  useEffect(() => {
    if (currentUser) {
      if (currentUser?.user.role === RolesEnum.SUPER_ADMIN) {
        navigate("/admin")
      } else if (currentUser?.user.role === RolesEnum.DOCTOR) {
        navigate("/doctor")
      } else if (currentUser?.user.role === RolesEnum.MERCHANT) {
        navigate("/merchant")
      } else if (currentUser?.user.role === RolesEnum.PATIENT) {
        navigate("/patient")
      } else if (currentUser?.user.role === RolesEnum.STAFF) {
        navigate("/staff")
      }
    }
  }, [currentUser])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-clinic-dark text-3xl font-bold">
            {APP_CONFIG.appName}
          </h1>
          <p className="text-muted-foreground">
            {t("login to access your dashboard and manage your health records")}
          </p>
        </div>

        <Card className="border-clinic-light shadow-md">
          <CardHeader>
            <CardTitle>{t("login to your account")}</CardTitle>
            <CardDescription>
              {t("create an account to get started")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(formSubmit)}
              className="grid grid-cols-1 gap-2"
            >
              <FormInput
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as unknown as any}
                formData={formData}
              />

              <Button
                type="submit"
                className="w-full py-5"
                disabled={isLoading}
              >
                {isLoading ? t("logging_in") : t("login")}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="w-full text-center text-sm text-muted-foreground">
              <div>
                {t("don't have an account?")}{" "}
                <Link
                  to="/auth/signup"
                  className="text-clinic-primary hover:underline"
                >
                  {t("signup now")}
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
