import { Form } from '@/common/components/ui/form';
import { logFailure } from '@/utils/safeLog';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  RequestFormProvider,
  useRequestFormContext,
} from './contexts/RequestFormContext';
import styles from './RequestForm.module.scss';
import RequestFormDesktop from './RequestFormDesktop';
import { Step1Personal } from './Step1Personal';
import { Step2Home } from './Step2Health';
import {
  Step10ClientDemographics,
  Step4Referral,
  Step5HealthHistory,
  Step6PregnancyBaby,
  Step7PastPregnancies,
  Step8ServicesInterested,
  Step9Payment,
} from './Step3Home';
import { RequestFormValues } from './useRequestForm';
import { StepNavigation } from './components/StepNavigation';
import { StepHeader } from './components/StepHeader';
import { apiBaseUrl } from '@/config/env';
import { useParams } from 'react-router-dom';
import { usePublicIntakeBranding } from './application/usePublicIntakeBranding';
import { IntakeFormHeader } from './components/IntakeFormHeader';
import {
  IntakeBrandingProvider,
  useIntakeBranding,
} from './contexts/IntakeBrandingContext';
import { IntakeHoneypotFields } from './IntakeHoneypotFields';
import {
  formatIntakeRateLimitError,
  resetIntakeHoneypotValues,
} from './intakeAbuse';
import { buildIntakeSubmitPayload } from './domain/intakePayload';
import {
  IntakeSubmitError,
  formatIntakeSubmitError,
  mapServerErrorToFields,
  missingBackendUrlError,
} from './domain/intakeSubmitErrors';

function RefreshWarningModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 8,
          padding: '24px',
          maxWidth: 400,
          margin: '0 16px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ marginBottom: 16, color: '#d32f2f', fontWeight: 600 }}>
          Unsaved Changes
        </h3>
        <p style={{ marginBottom: 24, color: '#666', lineHeight: 1.5 }}>
          You have unsaved changes in your form. If you refresh or leave this
          page, all your progress will be lost.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Stay on Page
          </button>
          <button
            onClick={() => {
              onClose();
              window.location.reload();
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 4,
              background: '#d32f2f',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Refresh Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestFormContent() {
  const { branding: orgBranding } = useIntakeBranding();
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 600px)').matches
  );
  const {
    form,
    step,
    totalSteps,
    handleNextStep,
    handleBack,
    isSubmitting,
    submitted,
    showRefreshWarning,
    setShowRefreshWarning,
    fillTestData,
    stepGateMessage,
  } = useRequestFormContext();

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 600px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (isDesktop) {
    return (
      <>
        <RequestFormDesktop />
        <RefreshWarningModal
          isOpen={showRefreshWarning}
          onClose={() => setShowRefreshWarning(false)}
        />
      </>
    );
  }

  const progress = ((step + 1) / totalSteps) * 100;

  if (isSubmitting) {
    return (
      <div
        className={styles.requestForm}
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className={styles.spinner}
            style={{
              margin: '0 auto 24px auto',
              width: 48,
              height: 48,
              border: '6px solid #e0e0e0',
              borderTop: '6px solid var(--intake-accent, #00bcd4)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: 'var(--intake-accent, #00bcd4)',
            }}
          >
            Submitting your request...
          </div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className={styles.requestForm}
        style={{
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: '#f6fffa',
            border: '1px solid #b2dfdb',
            borderRadius: 8,
            padding: '32px 24px',
            maxWidth: 500,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--intake-primary, #009688)',
              fontWeight: 700,
              fontSize: '1.7rem',
              marginBottom: 16,
            }}
          >
            Thank you for contacting {orgBranding.branding.displayName}!
          </h2>
          <p style={{ color: '#333', fontSize: 17, marginBottom: 16 }}>
            We are excited to get to know you and find out how we can support
            you. We have received your request for service and have started
            working on your match. We will be in touch soon with a doula
            introduction. In the meantime if you have any questions please let
            us know.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.requestForm}>
        <IntakeFormHeader onFillTestData={fillTestData} />

        {/* Combined Progress and Navigation Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: 4,
              background: '#e0e0e0',
              borderRadius: 2,
              margin: '0 0 1.5rem 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--intake-accent, #00bcd4)',
                transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
              }}
            />
          </div>

          {/* Step Navigation */}
          <StepNavigation currentStep={step} isDesktop={false} />
        </div>

        {/* Step Header */}
        <StepHeader currentStep={step} totalSteps={totalSteps} />
        {stepGateMessage ? (
          <div
            role='alert'
            className={styles['form-validation-banner']}
            aria-live='polite'
          >
            {stepGateMessage}
          </div>
        ) : null}
        <Form {...form}>
          <IntakeHoneypotFields />
          {step === 0 && (
            <Step8ServicesInterested
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
          {step === 1 && (
            <Step1Personal
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
          {step === 2 && (
            <Step2Home
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
              isDesktopOrTablet={false}
            />
          )}
          {step === 3 && (
            <Step4Referral
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
          {step === 4 && (
            <Step5HealthHistory
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
          {step === 5 && (
            <Step6PregnancyBaby
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
          {step === 6 && (
            <Step7PastPregnancies
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
          {step === 7 && (
            <Step9Payment
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
          {step === 8 && (
            <Step10ClientDemographics
              form={form}
              handleBack={handleBack}
              handleNextStep={handleNextStep}
              step={step}
              totalSteps={totalSteps}
            />
          )}
        </Form>
      </div>
      <RefreshWarningModal
        isOpen={showRefreshWarning}
        onClose={() => setShowRefreshWarning(false)}
      />
    </>
  );
}

function RequestFormInner({ tenantSlug }: { tenantSlug: string }) {
  const onSubmit = async (
    formData: RequestFormValues,
    options?: { isUsingTestData: boolean }
  ) => {
    const payload = buildIntakeSubmitPayload(formData, options);
    const backendUrl = apiBaseUrl.replace(/\/+$/, '');

    if (!backendUrl) {
      const configError = missingBackendUrlError();
      toast.error(configError.message);
      throw configError;
    }

    try {
      // Do not send Idempotency-Key until backend CORS allowlists it.
      // Requesting that header currently makes the browser fail preflight
      // with TypeError "Failed to fetch" (no fields flagged). See
      // `.cursor/handoffs/open/2026-10-09-backend-intake-cors-language.md`.
      const response = await fetch(
        `${backendUrl}/requestService/${encodeURIComponent(tenantSlug)}/requestSubmission`,
        {
          method: 'POST',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        message?: string;
      };

      const rateLimitMessage = formatIntakeRateLimitError(
        response.status,
        responseData,
        response.headers.get('Retry-After')
      );
      if (rateLimitMessage) {
        throw new IntakeSubmitError(rateLimitMessage, {
          status: response.status,
        });
      }

      if (!response.ok || responseData.error) {
        const serverMessage =
          responseData.error ||
          responseData.message ||
          `We could not submit your request (server error ${response.status}).`;
        throw new IntakeSubmitError(serverMessage, {
          status: response.status,
          fields: mapServerErrorToFields(serverMessage),
        });
      }
      resetIntakeHoneypotValues();
      toast.success('Request Form Submitted Successfully!');
    } catch (error) {
      logFailure('request-form', 'request_submission_error');
      const submitError =
        error instanceof IntakeSubmitError
          ? error
          : new IntakeSubmitError(formatIntakeSubmitError(error));
      const message = formatIntakeSubmitError(submitError);
      toast.error(message);
      throw submitError;
    }
  };

  return (
    <RequestFormProvider onSubmit={onSubmit}>
      <RequestFormContent />
    </RequestFormProvider>
  );
}

export default function RequestForm() {
  const { tenantSlug: routeSlug } = useParams<{ tenantSlug: string }>();
  const tenantSlug = routeSlug?.trim() || 'sokana360';
  const brandingState = usePublicIntakeBranding(tenantSlug);

  useEffect(() => {
    if (brandingState.status !== 'ready') return;
    document.title = `${brandingState.data.branding.pageTitle} | ${brandingState.data.branding.displayName}`;
  }, [brandingState]);

  if (brandingState.status === 'loading') {
    return (
      <div
        className={styles.requestForm}
        style={{ minHeight: 240, display: 'grid', placeItems: 'center' }}
      >
        Loading intake form…
      </div>
    );
  }

  if (brandingState.status === 'error') {
    return (
      <div
        className={styles.requestForm}
        style={{
          minHeight: 240,
          display: 'grid',
          placeItems: 'center',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        {brandingState.message}
      </div>
    );
  }

  return (
    <IntakeBrandingProvider branding={brandingState.data}>
      <RequestFormInner tenantSlug={tenantSlug} />
    </IntakeBrandingProvider>
  );
}
