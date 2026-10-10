import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from 'react';

import type { PublicIntakeBrandingResponse } from '@/features/intake/application/usePublicIntakeBranding';
import { buildIntakeThemeVars } from '@/features/intake/intakeTheme';
import '@/features/intake/intakeBranded.scss';

const IntakeBrandingContext =
  createContext<PublicIntakeBrandingResponse | null>(null);

export function IntakeBrandingProvider({
  branding,
  children,
}: {
  branding: PublicIntakeBrandingResponse;
  children: ReactNode;
}) {
  const themeStyle = buildIntakeThemeVars(
    branding.branding.primaryColor,
    branding.branding.accentColor
  );

  return (
    <IntakeBrandingContext.Provider value={branding}>
      <div className='intake-branded' style={themeStyle}>
        {children}
      </div>
    </IntakeBrandingContext.Provider>
  );
}

export function useIntakeBranding(): PublicIntakeBrandingResponse {
  const value = useContext(IntakeBrandingContext);
  if (!value) {
    throw new Error('useIntakeBranding requires IntakeBrandingProvider');
  }
  return value;
}
