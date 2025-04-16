import { BusinessCard } from '@/common/components/navigation/sidebar/BusinessCard'
import { NavUser } from '@/common/components/navigation/sidebar/NavUser'
import { SidebarSection } from '@/common/components/navigation/sidebar/SidebarSection'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/common/components/ui/sidebar"
import { sidebarSections } from '@/common/data/sidebar-data'


export function AppSidebar({ ...props}: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar 
      collapsible='icon'
      variant='floating'
      {...props}>
      <SidebarHeader>
        <BusinessCard />
      </SidebarHeader>
      
      <SidebarContent>
        {sidebarSections.map((section) => (
          <SidebarSection
            key={section.label}
            label={section.label}
            items={section.items}
          />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}