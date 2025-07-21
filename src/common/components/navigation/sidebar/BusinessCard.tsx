import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/common/components/ui/sidebar';
import { Building2 } from 'lucide-react';

export function BusinessCard() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' className='cursor-default' asChild>
          <div className='flex w-full items-center gap-3'>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <Building2 className='size-4' />
            </div>
            <div className='grid text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>Sokana Collective</span>
              <span className='truncate text-xs text-muted-foreground'>
                Personal Platform
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
