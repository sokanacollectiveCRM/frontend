import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/common/components/ui/sidebar'
import { Link, useLocation } from 'react-router-dom'

interface SidebarSectionProps {
  label: string
  items: {
    title: string
    url: string
    icon: React.ElementType
  }[]
}

export function SidebarSection({ label, items }: SidebarSectionProps) {
  const location = useLocation()
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-extrabold text-lg">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}