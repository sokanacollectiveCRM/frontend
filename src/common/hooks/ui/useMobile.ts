import * as React from 'react';

/** Hamburger / Sheet below this width. Matches Tailwind `lg` (1024px). */
export const MOBILE_BREAKPOINT = 1024;

function getIsMobileWidth(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobileWidth);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(getIsMobileWidth());
    };
    mql.addEventListener('change', onChange);
    setIsMobile(getIsMobileWidth());
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
