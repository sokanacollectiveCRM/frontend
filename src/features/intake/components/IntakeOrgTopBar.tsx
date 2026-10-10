import { Button } from '@/common/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { useIntakeBranding } from '@/features/intake/contexts/IntakeBrandingContext';

/** Org-branded public header for intake (replaces platform Cove NavBar). */
export function IntakeOrgTopBar() {
  const { branding } = useIntakeBranding();
  const navigate = useNavigate();
  const { displayName, logoPath } = branding;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 20px',
        borderBottom: '2px solid var(--intake-nav-border, #e0e0e0)',
        background: 'var(--intake-page-bg, #fff)',
      }}
    >
      <img
        src={logoPath}
        alt={`${displayName} logo`}
        style={{
          height: 44,
          width: 'auto',
          maxWidth: 'min(220px, 55vw)',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      <Button
        variant='ghost'
        type='button'
        onClick={() => navigate('/login')}
        style={{ color: 'var(--intake-primary, #0a3147)', fontWeight: 600 }}
      >
        Login
      </Button>
    </header>
  );
}
