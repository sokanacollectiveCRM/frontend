import { useEffect, useState } from 'react';

import { usePublicIntakeBranding } from '@/features/intake/application/usePublicIntakeBranding';
import { IntakeOrgTopBar } from '@/features/intake/components/IntakeOrgTopBar';
import { IntakeBrandingProvider } from '@/features/intake/contexts/IntakeBrandingContext';
import {
  DEFAULT_INTAKE_ACCENT,
  DEFAULT_INTAKE_PRIMARY,
} from '@/features/intake/intakeTheme';
import type { PublicIntakeBrandingResponse } from '@/features/intake/application/usePublicIntakeBranding';

import { DynamicIntakeForm } from './DynamicIntakeForm';
import {
  intakePreviewStorageKey,
  readIntakeClientPreview,
  type IntakeClientPreviewPayload,
} from './previewSession';

export function IntakeFormClientPreview() {
  const [payload, setPayload] = useState<IntakeClientPreviewPayload | null>(
    () => readIntakeClientPreview()
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === intakePreviewStorageKey()) {
        setPayload(readIntakeClientPreview());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!payload) {
    return (
      <main style={{ padding: 32, maxWidth: 640 }}>
        <h1>Form preview</h1>
        <p>
          Open Preview from the intake form settings to see the form the way a
          client would.
        </p>
      </main>
    );
  }

  return <ClientPreviewBody payload={payload} />;
}

function ClientPreviewBody({
  payload,
}: {
  payload: IntakeClientPreviewPayload;
}) {
  const brandingState = usePublicIntakeBranding(payload.slug);
  const [submitted, setSubmitted] = useState(false);
  const branding = brandingForPreview(
    payload,
    brandingState.status === 'ready' ? brandingState.data : null
  );

  useEffect(() => {
    document.title = `${branding.branding.pageTitle} | ${branding.branding.displayName}`;
  }, [branding]);

  return (
    <IntakeBrandingProvider branding={branding}>
      <IntakeOrgTopBar />
      <main style={{ padding: '8px 16px 48px' }}>
        {submitted ? (
          <div
            style={{
              background: 'var(--intake-success-bg, #fbf4f0)',
              border: '1px solid var(--intake-success-border, #d6704d)',
              borderRadius: 8,
              padding: '32px 24px',
              maxWidth: 560,
              margin: '48px auto',
              textAlign: 'center',
            }}
          >
            <h2 style={{ color: 'var(--intake-primary, #0a3147)' }}>
              Thank you for submitting your Service Request!
            </h2>
            <p>This is the page a client would see. Nothing was sent.</p>
          </div>
        ) : (
          <DynamicIntakeForm
            definition={payload.definition}
            catalog={payload.catalog}
            mode='preview'
            submitLabel='Submit'
            onSubmit={async () => {
              setSubmitted(true);
            }}
          />
        )}
      </main>
    </IntakeBrandingProvider>
  );
}

function brandingForPreview(
  payload: IntakeClientPreviewPayload,
  loaded: PublicIntakeBrandingResponse | null
): PublicIntakeBrandingResponse {
  const base: PublicIntakeBrandingResponse = loaded ?? {
    slug: payload.slug,
    name: payload.tenantName,
    branding: {
      displayName: payload.tenantName,
      logoPath: payload.logoUrl || '/sokana360-logo.png',
      markPath: null,
      pageTitle: 'Request service',
      primaryColor: DEFAULT_INTAKE_PRIMARY,
      accentColor: DEFAULT_INTAKE_ACCENT,
    },
  };
  return {
    ...base,
    branding: {
      ...base.branding,
      displayName: payload.tenantName || base.branding.displayName,
      logoPath: payload.logoUrl || base.branding.logoPath,
    },
  };
}

export default IntakeFormClientPreview;
