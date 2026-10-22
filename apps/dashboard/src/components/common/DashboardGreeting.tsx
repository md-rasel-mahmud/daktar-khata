
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Sun, Sunrise, Sunset, Moon, Sparkles } from "lucide-react"

interface DashboardGreetingProps {
    profile?: {
        name?: string | null
    } | null
}

export function DashboardGreeting({ profile }: DashboardGreetingProps) {
    const { t } = useTranslation()

    const greeting = useMemo(() => {
        const hour = new Date().getHours()

        if (hour >= 5 && hour < 12) {
            return {
                title: "good_morning",
                fallback: "Good morning",
                Icon: Sunrise,
                iconClass: "text-amber-500",
                iconBg: "bg-amber-500/10",
            }
        }

        if (hour >= 12 && hour < 17) {
            return {
                title: "good_afternoon",
                fallback: "Good afternoon",
                Icon: Sun,
                iconClass: "text-orange-500",
                iconBg: "bg-orange-500/10",
            }
        }

        if (hour >= 17 && hour < 21) {
            return {
                title: "good_evening",
                fallback: "Good evening",
                Icon: Sunset,
                iconClass: "text-indigo-500",
                iconBg: "bg-indigo-500/10",
            }
        }

        return {
            title: "good_night",
            fallback: "Hello",
            Icon: Moon,
            iconClass: "text-violet-500",
            iconBg: "bg-violet-500/10",
        }
    }, [])

    const Icon = greeting.Icon
    const name = profile?.name?.trim()

    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${greeting.iconBg}`}
            >
                <Icon className={`size-5 ${greeting.iconClass}`} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t(greeting.title, greeting.fallback)}
                {name && (
                    <>
                        {", "}
                        <span className="text-primary">{name}</span>
                    </>
                )}

            </h1>
        </div>
    )
}
