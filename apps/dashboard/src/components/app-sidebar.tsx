"use client"

import * as React from "react"
import { useSelector } from "react-redux"
import { useLocation } from "react-router"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { sidebarMenuItems } from "@/constants/sidebar-menu-items"
import { type RootState } from "@/lib/store/store"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/sidebar"
import { IconLayoutRows } from "@tabler/icons-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const currentRole = authUser?.user?.role
  const currentPermissions = authUser?.user?.permissions || []

  const hasRequiredPermissions = React.useCallback(
    (permissions?: string[]) => {
      if (!permissions || permissions.length === 0) {
        return true
      }

      if (currentRole !== "STAFF") {
        return true
      }

      return permissions.every((permission) =>
        currentPermissions.includes(permission)
      )
    },
    [currentPermissions, currentRole]
  )

  const navMainItems = React.useMemo(() => {
    if (!currentRole) {
      return []
    }

    return sidebarMenuItems
      .filter(
        (item) =>
          item.roles.includes(currentRole) &&
          hasRequiredPermissions(item.permissions)
      )
      .map((item) => ({
        title: item.label,
        url: item.path,
        icon: React.createElement(item.icon, { className: "size-4" }),
        isActive:
          location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`),
        items: item.children
          ?.filter(
            (child) =>
              child.roles.includes(currentRole) &&
              hasRequiredPermissions((child as any).permissions)
          )
          .map((child) => ({
            title: child.label,
            url: child.path,
          })),
      }))
  }, [currentRole, hasRequiredPermissions, location.pathname])

  const sidebarUser = React.useMemo(
    () => ({
      name: authUser?.profile?.name || "User",
      email: authUser?.user?.phone || "",
      role: authUser?.user?.role || "User",
      avatar: "/avatars/shadcn.jpg",
    }),
    [authUser]
  )

  const teams = React.useMemo(
    () => [
      {
        name: "Daktar Khata",
        logo: <IconLayoutRows />,
        plan: currentRole || "User",
      },
    ],
    [currentRole]
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
