import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from 'react';

import type { PublicIntakeBrandingResponse } from 'features/intake/application/usePublicIntakeBranding';

const IntakeBrandingContext =
  createContext<PublicIntakeBrandingResponse | null>(null);

export function IntakeBrandingProvider({
  branding,
  children,
}: {
  branding: PublicIntakeBrandingResponse;
  children: ReactNode;
}) {
  const themeStyle = {
    '--intake-primary': branding.branding.primaryColor,
    '--intake-accent': branding.branding.accentColor,
  } as CSSProperties;

  return (
    <IntakeBrandingContext.Provider value={branding}>
      <div style={themeStyle}>{children}</div>
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
