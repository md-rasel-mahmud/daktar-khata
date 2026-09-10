import { useTheme } from "@repo/ui/theme-provider"
import { useTranslation } from "react-i18next"
import { Moon, Sun } from "lucide-react"
import { Button } from "@repo/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function HeaderControls() {
  const { theme, setTheme } = useTheme()
  const { i18n, t } = useTranslation()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem("language", lang)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9"
        aria-label={t("theme")}
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label={t("language")}
            />
          }
        >
          <Globe className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => changeLanguage("en")}>
            {t("english")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeLanguage("bn")}>
            {t("bangla")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
