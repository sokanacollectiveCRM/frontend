// src/common/components/navigation/sidebar/AppSidebar.tsx
import { BusinessCard } from '@/common/components/navigation/sidebar/BusinessCard'
import { NavUser } from '@/common/components/navigation/sidebar/NavUser'
import { SidebarSection } from '@/common/components/navigation/sidebar/SidebarSection'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/common/components/ui/sidebar'
import { sidebarSections } from '@/common/data/sidebar-data'
import { useContext } from 'react'
import { UserContext } from '../../../contexts/UserContext'; // wherever you defined it

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useContext(UserContext)

  // while we’re still loading auth, render nothing or a spinner
  if (isLoading) {
    return null
  }

  const isAdmin = user?.role === 'admin'

  // filter out “Integrations” unless admin
  const visible = sidebarSections.filter(
    section => section.label !== 'Integrations' || isAdmin
  )

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <BusinessCard />
      </SidebarHeader>

      <SidebarContent>
        {visible.map(section => (
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
    </Sidebar>
  )
}
