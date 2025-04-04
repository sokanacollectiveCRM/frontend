import { Calendar, FileText, Home, Inbox, LucideChartColumnIncreasing, LucideCircleDollarSign, LucideClock5, LucideCreditCard, LucideUsers, Search } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/common/components/ui/sidebar"

// Menu items.
const GeneralItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Clients",
    url: "#",
    icon: Search,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  }
]

const ManageIcons = [
  {
    title: "Team",
    url: "#",
    icon : LucideUsers
  },
  {
   title: "Contracts",
   url: "#",
   icon: FileText 
  },
  {
    title: "Hours",
    url: "#",
    icon: LucideClock5
   },
   {
    title: "Payments",
    url: "#",
    icon: LucideCreditCard 
   }
]
const AnalyticsIcons = [
  {
    title: "Financial",
    url: "#",
    icon: LucideCircleDollarSign
  },
  {
    title: "Demographics",
    url: "#",
    icon: LucideChartColumnIncreasing
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-extrabold text-lg">General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {GeneralItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="font-extrabold text-lg">Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ManageIcons.map((item) =>(
                <SidebarMenuItem key = {item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mb-80">
          <SidebarGroupLabel className="font-extrabold text-lg">Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {AnalyticsIcons.map((item) =>(
                <SidebarMenuItem key = {item.title}>
                <SidebarMenuButton asChild>
                  <a href = {item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>wew</SidebarGroupLabel>
          <SidebarGroupContent>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
