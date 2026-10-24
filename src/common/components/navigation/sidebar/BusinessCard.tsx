import { Sokana360Logo } from '@/common/components/brand/Sokana360Logo';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/common/components/ui/sidebar';
import { useUser } from '@/common/hooks/user/useUser';

const TENANT_B_SLUG = 'synthetic-tenant-b';

export function BusinessCard() {
  const { user } = useUser();
  const tenant = user?.tenant;
  const isTenantB = tenant?.slug === TENANT_B_SLUG;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' className='cursor-default' asChild>
          <div className='flex w-full items-center gap-3'>
            {isTenantB ? (
              <img
                src='/tenant-b-mark.svg'
                alt=''
                className='size-8 shrink-0 rounded-md object-contain'
              />
            ) : (
              <Sokana360Logo
                variant='mark'
                alt=''
                className='size-8 shrink-0 object-contain'
              />
            )}
            <div className='grid min-w-0 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {isTenantB ? tenant?.name || 'Tenant B' : 'Sokana360'}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {isTenantB ? 'Organization' : 'Connect. Care. Coordinate.'}
              </span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
