import type { ReactNode } from 'react';
import {
  ArrowRight,
  Building2,
  FileLock2,
  LogOut,
  Mail,
  UserRoundCheck,
} from 'lucide-react';
import { Sokana360Logo } from '@/common/components/brand/Sokana360Logo';
import { Button } from '@/common/components/ui/button';

function AccountAccessLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-dvh bg-[#f4f7f5] text-[#173d47]'>
      <header className='mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10 sm:py-8'>
        <div className='flex items-center gap-3'>
          <Sokana360Logo
            variant='mark'
            alt=''
            className='size-10 object-contain'
          />
          <div>
            <p className='text-lg font-semibold tracking-tight'>Sokana360</p>
            <p className='text-xs text-[#647873]'>Connect. Care. Coordinate.</p>
          </div>
        </div>
        <span className='hidden text-xs font-medium text-[#647873] sm:block'>
          Your account
        </span>
      </header>
      <main className='mx-auto flex min-h-[calc(100dvh-112px)] max-w-3xl items-center justify-center px-5 pb-10 sm:px-8 sm:pb-20'>
        {children}
      </main>
    </div>
  );
}

export function NoOrganizationScreen({
  email,
  onLogout,
}: {
  email?: string;
  onLogout: () => void;
}) {
  return (
    <AccountAccessLayout>
      <section
        className='w-full max-w-xl rounded-3xl border border-[#dce6e0] bg-white p-6 shadow-[0_12px_48px_-24px_rgba(23,61,71,0.25)] sm:p-10'
        aria-labelledby='no-organization-title'
      >
        <div
          className='mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#eaf3ee]'
          aria-hidden='true'
        >
          <Building2 className='size-7 text-[#357565]' strokeWidth={1.5} />
        </div>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#527767]'>
          Organization access
        </p>
        <h1
          id='no-organization-title'
          className='text-2xl font-semibold leading-tight tracking-tight sm:text-3xl'
        >
          No active organization membership
        </h1>
        <p className='mt-4 text-sm leading-6 text-[#647873] sm:text-base'>
          Your Sokana360 account is still active. To open a workspace, you’ll
          need an invitation from an organization.
        </p>
        <div className='mt-7 space-y-5 rounded-2xl bg-[#f5f8f6] p-5'>
          <div className='flex gap-3'>
            <UserRoundCheck
              className='mt-0.5 size-5 shrink-0 text-[#527767]'
              aria-hidden='true'
            />
            <div>
              <p className='text-sm font-medium'>Your account stays with you</p>
              <p className='mt-1 text-sm leading-5 text-[#647873]'>
                Keep using the same email and password when you’re invited
                again.
              </p>
            </div>
          </div>
          <div className='flex gap-3'>
            <FileLock2
              className='mt-0.5 size-5 shrink-0 text-[#527767]'
              aria-hidden='true'
            />
            <div>
              <p className='text-sm font-medium'>
                Documents stay with their organization
              </p>
              <p className='mt-1 text-sm leading-5 text-[#647873]'>
                Previous uploads remain with the organization they were uploaded
                for.
              </p>
            </div>
          </div>
        </div>
        <div className='mt-6 flex gap-2.5 text-sm leading-5 text-[#647873]'>
          <Mail className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
          <p>
            Already received a new invitation? Open the link in your email to
            rejoin.
          </p>
        </div>
        <div className='mt-8 flex flex-col gap-4 border-t border-[#e7ede9] pt-6 sm:flex-row sm:items-center sm:justify-between'>
          {email && (
            <p className='min-w-0 break-words text-xs text-[#647873]'>
              Signed in as
              <br />
              <span className='mt-1 inline-block font-medium text-[#173d47]'>
                {email}
              </span>
            </p>
          )}
          <Button
            className='h-11 w-full rounded-xl bg-[#0b665b] px-5 text-white hover:bg-[#085349] sm:w-auto'
            onClick={onLogout}
          >
            <LogOut className='size-4' aria-hidden='true' />
            Log out
          </Button>
        </div>
      </section>
    </AccountAccessLayout>
  );
}

export function OrganizationChooser({
  organizations,
  onSelect,
  onLogout,
}: {
  organizations: { id: string; name: string; slug: string }[];
  onSelect: (id: string) => void;
  onLogout: () => void;
}) {
  return (
    <AccountAccessLayout>
      <section
        className='w-full max-w-xl rounded-3xl border border-[#dce6e0] bg-white p-6 shadow-[0_12px_48px_-24px_rgba(23,61,71,0.25)] sm:p-10'
        aria-labelledby='choose-organization-title'
      >
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#527767]'>
          Your workspaces
        </p>
        <h1
          id='choose-organization-title'
          className='text-2xl font-semibold tracking-tight sm:text-3xl'
        >
          Choose an organization
        </h1>
        <p className='mt-3 text-sm leading-6 text-[#647873] sm:text-base'>
          Pick the workspace you’d like to open.
        </p>
        <div className='mt-7 space-y-3'>
          {organizations.map((org) => (
            <button
              key={org.id}
              aria-label={org.name}
              className='group flex w-full items-center gap-3 rounded-2xl border border-[#dce6e0] bg-white p-4 text-left transition-colors hover:border-[#78a593] hover:bg-[#f4f9f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#357565] focus-visible:ring-offset-2 sm:gap-4'
              onClick={() => onSelect(org.id)}
            >
              <span
                className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4ef]'
                aria-hidden='true'
              >
                <Building2
                  className='size-5 text-[#527767]'
                  strokeWidth={1.5}
                />
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block break-words text-sm font-semibold sm:text-base'>
                  {org.name}
                </span>
                <span className='mt-1 block text-xs text-[#647873]'>
                  Open workspace
                </span>
              </span>
              <ArrowRight
                className='size-4 shrink-0 text-[#527767] transition-transform group-hover:translate-x-0.5'
                aria-hidden='true'
              />
            </button>
          ))}
        </div>
        <div className='mt-6 flex gap-3 rounded-xl bg-[#f5f8f6] p-4 text-sm leading-5 text-[#647873]'>
          <FileLock2
            className='mt-0.5 size-4 shrink-0 text-[#527767]'
            aria-hidden='true'
          />
          <p>Your profile and documents stay separate in each organization.</p>
        </div>
        <div className='mt-6 flex items-center justify-between gap-3 border-t border-[#e7ede9] pt-5'>
          <p className='text-xs text-[#647873]'>Need a different account?</p>
          <Button
            variant='ghost'
            className='h-10 rounded-xl text-[#173d47]'
            onClick={onLogout}
          >
            Log out
            <LogOut className='size-4' aria-hidden='true' />
          </Button>
        </div>
      </section>
    </AccountAccessLayout>
  );
}
