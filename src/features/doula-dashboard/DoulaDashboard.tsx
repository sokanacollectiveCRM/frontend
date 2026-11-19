import { Header } from '@/common/layouts/Header';
import { Main } from '@/common/layouts/Main';
import { ProfileDropdown } from '@/common/components/user/ProfileDropdown';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function DoulaDashboard() {
  const location = useLocation();
  const stepsNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = stepsNavRef.current;
    const activeStep = nav?.querySelector<HTMLElement>(
      '[aria-current="step"]'
    );
    if (!nav || !activeStep) return;

    const navRect = nav.getBoundingClientRect();
    const stepRect = activeStep.getBoundingClientRect();
    if (stepRect.left < navRect.left) {
      nav.scrollLeft -= navRect.left - stepRect.left;
    } else if (stepRect.right > navRect.right) {
      nav.scrollLeft += stepRect.right - navRect.right;
    }
  }, [location.pathname, location.search]);

  return (
    <>
      <Header className='relative z-10 h-auto min-h-16'>
        <div className='flex w-full items-center gap-4'>
          <div className='min-w-0'>
            <h1 className='text-lg font-semibold text-slate-900'>
              {location.pathname.endsWith('/documents')
                ? 'Documents & credentials'
                : location.pathname.endsWith('/profile')
                  ? 'Finish your profile'
                  : 'Your dashboard'}
            </h1>
            <p className='hidden text-sm text-slate-500 sm:block'>
              {location.pathname.endsWith('/profile') ||
              location.pathname.endsWith('/documents')
                ? 'Your progress saves automatically.'
                : 'Manage your clients, hours, and activities.'}
            </p>
          </div>
          <div className='ml-auto flex items-center gap-4'>
            <ProfileDropdown />
          </div>
        </div>
      </Header>

      <Main className='min-h-0 !h-auto !max-h-none !overflow-visible py-2'>
        <div className='min-h-0 p-4 sm:p-6'>
          <section className='min-h-0 w-full min-w-0 max-w-full'>
            {(location.pathname.endsWith('/profile') ||
              location.pathname.endsWith('/documents')) && (
              <nav
                ref={stepsNavRef}
                aria-label='Profile setup steps'
                className='mb-4 flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain border-b border-slate-200 bg-background px-1 py-3'
              >
                {[
                  {
                    label: '1. About you',
                    to: '/doula-dashboard/profile?step=about',
                    id: 'about-you',
                  },
                  {
                    label: '2. Address',
                    to: '/doula-dashboard/profile?step=address',
                    id: 'address',
                  },
                  {
                    label: '3. Documents & credentials',
                    to: '/doula-dashboard/documents#required-documents',
                    id: 'documents',
                  },
                  {
                    label: '4. Scheduling',
                    to: '/doula-dashboard/profile?step=scheduling',
                    id: 'scheduling',
                  },
                  {
                    label: '5. Demographics',
                    to: '/doula-dashboard/profile?step=demographics',
                    id: 'demographics',
                  },
                  {
                    label: '6. Review',
                    to: '/doula-dashboard/profile?step=review',
                    id: 'review',
                  },
                ].map((step) => {
                  const selected =
                    (step.id === 'documents' &&
                      location.pathname.endsWith('/documents')) ||
                    (step.id !== 'documents' &&
                      location.pathname.endsWith('/profile') &&
                      (location.search ===
                        `?step=${step.id === 'about-you' ? 'about' : step.id}` ||
                        (step.id === 'about-you' && !location.search)));
                  return (
                    <Link
                      key={step.id}
                      to={step.to}
                      aria-current={selected ? 'step' : undefined}
                      className={`min-h-11 whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition ${selected ? 'border-teal-300 bg-teal-50 text-teal-950' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      {step.label}
                    </Link>
                  );
                })}
              </nav>
            )}
            <Outlet />
          </section>
        </div>
      </Main>
    </>
  );
}
