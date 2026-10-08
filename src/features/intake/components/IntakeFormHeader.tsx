import { isRequestTestDataEnabled } from '@/config/env';

import { useIntakeBranding } from '../contexts/IntakeBrandingContext';

type IntakeFormHeaderProps = {
  onFillTestData?: () => void;
};

export function IntakeFormHeader({ onFillTestData }: IntakeFormHeaderProps) {
  const { branding } = useIntakeBranding();
  const { displayName, logoPath, pageTitle } = branding.branding;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <img
        src={logoPath}
        alt={`${displayName} logo`}
        style={{
          width: 140,
          height: 'auto',
          margin: '0 auto 0.8rem auto',
          display: 'block',
        }}
      />
      <h1
        style={{
          fontWeight: 700,
          fontSize: '1.5rem',
          margin: 0,
          textAlign: 'center',
          color: '#333',
        }}
      >
        {pageTitle}
      </h1>
      <div
        style={{
          color: '#666',
          fontSize: '0.9rem',
          margin: '0.6rem 0 0 0',
          textAlign: 'center',
          maxWidth: 500,
          lineHeight: 1.4,
          padding: '0 1rem',
        }}
      >
        Please complete this form as thoroughly as possible so we can match you
        with a doula according to your needs.
      </div>
      {isRequestTestDataEnabled() && onFillTestData && (
        <button
          type='button'
          onClick={onFillTestData}
          title='Loads a complete sample (including age, provider type, primary + secondary insurance). Resets the form and returns to the first step. Dev/QA only.'
          style={{
            marginTop: 10,
            padding: '5px 10px',
            fontSize: 11,
            color: 'var(--intake-primary, #009688)',
            background: 'transparent',
            border: '1px dashed var(--intake-primary, #009688)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Fill with test data
        </button>
      )}
    </div>
  );
}
