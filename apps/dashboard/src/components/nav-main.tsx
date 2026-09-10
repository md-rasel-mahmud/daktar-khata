import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { IconChevronRight } from "@tabler/icons-react"
import { Link, useLocation } from "react-router"
import { useTranslation } from "react-i18next"

const toTranslationKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("platform")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = Boolean(item.items?.length)
          const isItemActive = location.pathname === item.url
          const title = t(toTranslationKey(item.title), {
            defaultValue: item.title,
          })

          return (
            <Collapsible
              key={`${item.title}-${isItemActive ? "active" : "inactive"}`}
              defaultOpen={isItemActive || item.isActive}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              {hasChildren ? (
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      tooltip={title}
                      isActive={isItemActive}
                    />
                  }
                >
                  {item.icon}
                  <span>{title}</span>
                  <IconChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                </CollapsibleTrigger>
              ) : (
                <SidebarMenuButton
                  tooltip={title}
                  isActive={isItemActive}
                  render={<Link to={item.url} />}
                >
                  {item.icon}
                  <span>{title}</span>
                </SidebarMenuButton>
              )}

              {hasChildren ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubItemActive =
                        location.pathname === subItem.url ||
                        location.pathname.startsWith(`${subItem.url}/`)

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={isSubItemActive}
                            render={<Link to={subItem.url} />}
                          >
                            <span>
                              {t(toTranslationKey(subItem.title), {
                                defaultValue: subItem.title,
                              })}
                            </span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
