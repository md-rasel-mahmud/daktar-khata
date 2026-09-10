import { useState } from "react"
import { useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslation } from "react-i18next"

import { Gender } from "@/enums/gender.enums"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconUser,
} from "@tabler/icons-react"
import type { RootState } from "@/lib/store/store"
import { useUpdateCurrentUserMutation } from "@/lib/store/api/services/user.service"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gender: z.nativeEnum(Gender, { message: "Gender is required" }),
  address: z.string().optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

const ProfilePage = () => {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.auth.user)
  const [isEditing, setIsEditing] = useState(false)
  const [updateCurrentUser, { isLoading: isSaving }] =
    useUpdateCurrentUserMutation()

  const profile = user?.profile
  const userData = user?.user

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    )
  }

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      phone: userData?.phone || "",
      password: "",
      email: userData?.email || "",
      gender: (profile?.gender as Gender) || Gender.MALE,
      address: profile?.address || "",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateCurrentUser({
        body: {
          name: data.name,
          phone: data.phone,
          password: data.password,
          email: data.email || undefined,
          gender: data.gender,
          address: data.address || undefined,
        },
      }).unwrap()
      setIsEditing(false)
      form.setValue("password", "")
    } catch {
      // error handled by middleware
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  const roleLabel = t(String(userData?.role).toLowerCase(), {
    defaultValue: userData?.role,
  })

  return (
    <div className="fadeIn mx-auto w-full max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("profile")}</h1>
          <p className="text-muted-foreground">
            {t("manage_your_profile_information")}
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <IconEdit className="size-4" />
            {t("edit")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <IconX className="size-4" />
              {t("cancel")}
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              <IconDeviceFloppy className="size-4" />
              {isSaving ? t("saving") : t("save")}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{t("basic_information")}</CardTitle>
                    <CardDescription>
                      {t("basic_info_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("full name")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("phone")}</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("gender")}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value || ""}
                              onValueChange={(val) =>
                                field.onChange(val as Gender)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("select_gender")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Gender.MALE}>
                                  {t("male")}
                                </SelectItem>
                                <SelectItem value={Gender.FEMALE}>
                                  {t("female")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("address")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </Form>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("basic_information")}</CardTitle>
                <CardDescription>{t("basic_info_description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {t("full name")}
                    </dt>
                    <dd className="font-medium">{profile?.name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {t("phone")}
                    </dt>
                    <dd className="font-medium">{userData?.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {t("email")}
                    </dt>
                    <dd className="font-medium">{userData?.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {t("gender")}
                    </dt>
                    <dd className="font-medium">
                      {profile?.gender
                        ? t(profile.gender.toLowerCase())
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {t("address")}
                    </dt>
                    <dd className="font-medium">{profile?.address || "—"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
              <Avatar size="lg" className="size-20">
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {profile?.name || "—"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userData?.email || userData?.phone}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                <IconUser className="mr-1 size-3" />
                {roleLabel}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
