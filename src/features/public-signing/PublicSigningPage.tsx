import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/components/ui/alert';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { defaultTypedSignatureValue } from '@/features/public-signing/signingDisplay';
import { SignatureAdoptionModal } from '@/features/public-signing/SignatureAdoptionModal';
import { SigningPdf } from '@/features/public-signing/SigningPdf';
import {
  completeSigning,
  getSigningSession,
  saveSigningProgress,
  SigningApiError,
} from '@/features/public-signing/signingApi';
import {
  buildFieldQueue,
  canApplyField,
  completedFieldCount,
  completedFieldIds,
  missingRequiredFieldIds,
  nextIncompleteFieldId,
  requiredSigningFieldCount,
} from '@/features/public-signing/signingFields';
import type {
  SignatureValue,
  SigningManifestField,
  SigningSession,
} from '@/features/public-signing/types';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function errorMessage(error: unknown): string {
  if (error instanceof SigningApiError) {
    if (error.status === 404) return 'This signing link is unavailable.';
    if (error.status === 429)
      return 'Too many attempts. Please wait and retry.';
    if (error.status === 400) return error.message;
  }
  return 'We could not reach the signing service. Please try again.';
}

function buildAdoptedSignature(
  signatureType: 'typed' | 'drawn',
  typedSignature: string,
  drawnSignature: string | null
): SignatureValue | null {
  if (signatureType === 'typed') {
    const text = typedSignature.trim();
    return text ? defaultTypedSignatureValue(text) : null;
  }
  return drawnSignature ? { type: 'drawn', dataUrl: drawnSignature } : null;
}

export default function PublicSigningPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<SigningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'saving' | 'completing' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [guidedMode, setGuidedMode] = useState(false);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [adoptedSignature, setAdoptedSignature] =
    useState<SignatureValue | null>(null);
  const [adoptedInitials, setAdoptedInitials] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [appliedFieldIds, setAppliedFieldIds] = useState<Set<string>>(
    new Set()
  );
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [signatureType, setSignatureType] = useState<'typed' | 'drawn'>(
    'typed'
  );
  const [typedSignature, setTypedSignature] = useState('');
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);
  const [drawingError, setDrawingError] = useState<string | null>(null);
  const [modalInitials, setModalInitials] = useState('');
  const [modalConsent, setModalConsent] = useState(false);
  const pdfRefreshAttempted = useRef(false);
  const autoSavePending = useRef(false);

  const load = useCallback(async (refreshPdf = false) => {
    if (!refreshPdf) setLoading(true);
    setError(null);
    try {
      const next = await getSigningSession();
      setSession(next);
      setAppliedFieldIds(new Set(next.progress.map((item) => item.fieldId)));
    } catch (requestError) {
      setError(errorMessage(requestError));
      setRetryAfter(
        requestError instanceof SigningApiError
          ? requestError.retryAfterSeconds
          : null
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!session || session.status !== 'signed') return;
    navigate(
      `/contract-signed?contract_id=${encodeURIComponent(session.contractId)}&service_type=${encodeURIComponent(session.title)}`,
      { replace: true }
    );
  }, [navigate, session]);

  useEffect(() => {
    if (!session?.canContinue) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [session?.canContinue]);

  const fieldQueue = useMemo(
    () => (session ? buildFieldQueue(session.signingManifest) : []),
    [session]
  );

  const requiredCount = useMemo(
    () => (session ? requiredSigningFieldCount(session.signingManifest) : 0),
    [session]
  );

  const completedCount = useMemo(
    () =>
      session
        ? completedFieldCount(session.signingManifest, appliedFieldIds)
        : 0,
    [appliedFieldIds, session]
  );

  const missingIds = useMemo(
    () =>
      session
        ? missingRequiredFieldIds(session.signingManifest, appliedFieldIds)
        : [],
    [appliedFieldIds, session]
  );

  const activeField = useMemo(
    () => fieldQueue.find((field) => field.id === activeFieldId) ?? null,
    [activeFieldId, fieldQueue]
  );

  const activeIndex = useMemo(
    () => fieldQueue.findIndex((field) => field.id === activeFieldId),
    [activeFieldId, fieldQueue]
  );

  const persistProgress = useCallback(async (fieldIds: string[]) => {
    setBusy('saving');
    setError(null);
    try {
      const next = await saveSigningProgress(fieldIds);
      setSession(next);
      setSaved(true);
    } catch (requestError) {
      setError(errorMessage(requestError));
      setRetryAfter(
        requestError instanceof SigningApiError
          ? requestError.retryAfterSeconds
          : null
      );
    } finally {
      setBusy(null);
    }
  }, []);

  const focusField = useCallback((fieldId: string | null) => {
    setActiveFieldId(fieldId);
  }, []);

  const advanceAfterApply = useCallback(
    (manifest: SigningManifestField[], nextApplied: Set<string>) => {
      const queue = buildFieldQueue(manifest);
      const currentIndex = queue.findIndex(
        (field) => field.id === activeFieldId
      );
      const nextId =
        nextIncompleteFieldId(
          queue,
          nextApplied,
          currentIndex >= 0 ? currentIndex + 1 : 0
        ) ?? nextIncompleteFieldId(queue, nextApplied, 0);
      focusField(nextId);
    },
    [activeFieldId, focusField]
  );

  const applyField = useCallback(
    async (fieldId: string) => {
      if (!session || appliedFieldIds.has(fieldId)) return;
      const field = session.signingManifest.find((item) => item.id === fieldId);
      if (!field) return;
      if (
        !canApplyField(
          field,
          appliedFieldIds,
          adoptedInitials,
          adoptedSignature !== null
        )
      ) {
        setShowAdoptionModal(true);
        return;
      }

      const nextApplied = new Set(appliedFieldIds);
      nextApplied.add(fieldId);
      setAppliedFieldIds(nextApplied);
      setSaved(false);
      advanceAfterApply(session.signingManifest, nextApplied);

      if (session.canContinue) {
        autoSavePending.current = true;
        const ids = completedFieldIds(session.signingManifest, nextApplied);
        await persistProgress(ids);
        autoSavePending.current = false;
      }
    },
    [
      adoptedInitials,
      adoptedSignature,
      advanceAfterApply,
      appliedFieldIds,
      persistProgress,
      session,
    ]
  );

  const startGuidedSession = () => {
    if (!session) return;
    if (!adoptedSignature || !adoptedInitials.trim() || !consentAccepted) {
      setShowAdoptionModal(true);
      return;
    }
    setGuidedMode(true);
    const firstIncomplete =
      nextIncompleteFieldId(fieldQueue, appliedFieldIds, 0) ??
      fieldQueue[0]?.id ??
      null;
    focusField(firstIncomplete);
  };

  const confirmAdoption = () => {
    const signature = buildAdoptedSignature(
      signatureType,
      typedSignature,
      drawnSignature
    );
    if (!signature || !modalInitials.trim() || !modalConsent) return;
    setAdoptedSignature(signature);
    setAdoptedInitials(modalInitials.trim());
    setConsentAccepted(true);
    setShowAdoptionModal(false);
    if (!guidedMode) {
      setGuidedMode(true);
      const firstIncomplete =
        nextIncompleteFieldId(fieldQueue, appliedFieldIds, 0) ??
        fieldQueue[0]?.id ??
        null;
      focusField(firstIncomplete);
    }
  };

  const goToPreviousField = useCallback(() => {
    if (activeIndex <= 0) return;
    focusField(fieldQueue[activeIndex - 1]?.id ?? null);
  }, [activeIndex, fieldQueue, focusField]);

  const goToNextField = useCallback(() => {
    if (activeIndex < 0) {
      focusField(fieldQueue[0]?.id ?? null);
      return;
    }
    if (activeIndex >= fieldQueue.length - 1) return;
    focusField(fieldQueue[activeIndex + 1]?.id ?? null);
  }, [activeIndex, fieldQueue, focusField]);

  const goToNextRequiredField = useCallback(() => {
    const startIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextId =
      nextIncompleteFieldId(fieldQueue, appliedFieldIds, startIndex) ??
      nextIncompleteFieldId(fieldQueue, appliedFieldIds, 0);
    if (nextId) focusField(nextId);
  }, [activeIndex, appliedFieldIds, fieldQueue, focusField]);

  const submit = async () => {
    if (!session || !adoptedSignature) return;
    if (!consentAccepted || !adoptedInitials.trim() || missingIds.length > 0) {
      setError(
        'Complete every required field and accept the consent statement.'
      );
      return;
    }
    setBusy('completing');
    setError(null);
    try {
      const ids = completedFieldIds(session.signingManifest, appliedFieldIds);
      const result = await completeSigning({
        signature: adoptedSignature,
        consent: true,
        initials: adoptedInitials.trim(),
        completedFieldIds: ids,
      });
      navigate(
        `/contract-signed?contract_id=${encodeURIComponent(result.contractId)}&service_type=${encodeURIComponent(session.title)}`,
        { replace: true }
      );
    } catch (requestError) {
      setError(errorMessage(requestError));
      setRetryAfter(
        requestError instanceof SigningApiError
          ? requestError.retryAfterSeconds
          : null
      );
      setBusy(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!guidedMode || showAdoptionModal) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousField();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextField();
      }
      if (
        (event.key === 'Enter' || event.key === ' ') &&
        activeFieldId &&
        (document.activeElement as HTMLElement | null)?.dataset.fieldId ===
          activeFieldId
      ) {
        event.preventDefault();
        void applyField(activeFieldId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeFieldId,
    applyField,
    goToNextField,
    goToPreviousField,
    guidedMode,
    showAdoptionModal,
  ]);

  if (loading) {
    return (
      <main className='flex min-h-dvh items-center justify-center bg-slate-50 p-6'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='size-5 animate-spin' aria-hidden='true' />
          Loading your contract…
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className='flex min-h-dvh items-center justify-center bg-slate-50 p-6'>
        <Alert variant='destructive' className='max-w-lg bg-white'>
          <AlertCircle aria-hidden='true' />
          <AlertTitle>Contract unavailable</AlertTitle>
          <AlertDescription className='space-y-3'>
            <p>{error || 'This signing link is unavailable.'}</p>
            {retryAfter !== null && <p>Retry after {retryAfter} seconds.</p>}
            <Button type='button' variant='outline' onClick={() => void load()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const canFinish =
    session.canContinue &&
    consentAccepted &&
    Boolean(adoptedSignature) &&
    adoptedInitials.trim().length > 0 &&
    adoptedInitials.trim().length <= 16 &&
    missingIds.length === 0 &&
    busy === null;

  return (
    <main
      className={`min-h-dvh bg-slate-300 text-slate-950 ${guidedMode || !session.canContinue ? 'pb-28' : 'pb-32'}`}
    >
      <header className='border-b bg-white'>
        <div className='mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6'>
          <div className='rounded-lg bg-primary p-2 text-primary-foreground'>
            <FileSignature className='size-5' aria-hidden='true' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Secure contract signing
            </p>
            <h1 className='truncate text-lg font-semibold'>{session.title}</h1>
            {!guidedMode && (
              <p className='mt-1 text-sm text-muted-foreground'>
                Review your contract below, then start to sign step by step.
              </p>
            )}
          </div>
          {!guidedMode && (
            <p
              className='hidden text-sm text-muted-foreground sm:block'
              aria-live='polite'
            >
              {completedCount} of {requiredCount} required fields completed
            </p>
          )}
        </div>
      </header>

      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6'>
        {!session.canContinue && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Signing unavailable</AlertTitle>
            <AlertDescription>
              This contract can no longer be signed from this link.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle aria-hidden='true' />
            <AlertTitle>Could not continue</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              {retryAfter !== null && (
                <p className='mt-1'>Retry after {retryAfter} seconds.</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <section aria-label='Contract preview' className='min-w-0'>
          <SigningPdf
            pdfUrl={session.pdfUrl}
            fields={session.signingManifest}
            adoptedSignature={adoptedSignature}
            adoptedInitials={adoptedInitials}
            appliedFieldIds={appliedFieldIds}
            activeFieldId={activeFieldId}
            guidedMode={guidedMode}
            onFieldActivate={(fieldId) => void applyField(fieldId)}
            onLoadFailure={() => {
              if (pdfRefreshAttempted.current) return;
              pdfRefreshAttempted.current = true;
              void load(true);
            }}
            onLoadSuccess={() => {
              pdfRefreshAttempted.current = false;
            }}
          />
        </section>

        {guidedMode && (
          <Card className='mt-6'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Guided signing</CardTitle>
              <CardDescription>
                Signing as {session.signerName}. Click each highlighted field on
                the document to apply your signature, initials, or date.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {activeField && (
                <p className='text-sm'>
                  Current field:{' '}
                  <span className='font-medium'>
                    {activeField.label || activeField.kind}
                  </span>
                </p>
              )}
              {saved && (
                <p className='flex items-center gap-1 text-xs text-emerald-700'>
                  <CheckCircle2 className='size-3.5' aria-hidden='true' />
                  Progress saved
                </p>
              )}
              <p className='text-xs text-muted-foreground'>
                This link expires{' '}
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(session.expiresAt))}
                .
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {!guidedMode && session.canContinue && (
        <div
          className='fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur'
          role='region'
          aria-label='Start signing'
        >
          <div className='mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
            <div className='min-w-0'>
              <p className='text-sm font-medium text-slate-900'>
                Ready to sign?
              </p>
              <p className='text-sm text-muted-foreground' aria-live='polite'>
                {completedCount} of {requiredCount} required fields completed.
                Scroll to review the contract, then start guided signing.
              </p>
            </div>
            <Button
              type='button'
              size='lg'
              className='h-14 shrink-0 bg-yellow-400 px-10 text-lg font-bold text-slate-900 hover:bg-yellow-300 sm:min-w-48'
              onClick={startGuidedSession}
            >
              START
            </Button>
          </div>
        </div>
      )}

      {guidedMode && (
        <div
          className='fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 backdrop-blur'
          role='toolbar'
          aria-label='Signing navigation'
        >
          <div className='mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
            <div className='flex items-center gap-2'>
              <div
                className='h-2 flex-1 overflow-hidden rounded-full bg-slate-200 sm:w-48'
                role='progressbar'
                aria-valuemin={0}
                aria-valuemax={requiredCount}
                aria-valuenow={completedCount}
                aria-label='Signing progress'
              >
                <div
                  className='h-full bg-yellow-400 transition-all'
                  style={{
                    width:
                      requiredCount > 0
                        ? `${(completedCount / requiredCount) * 100}%`
                        : '0%',
                  }}
                />
              </div>
              <span className='whitespace-nowrap text-sm font-medium'>
                {completedCount}/{requiredCount}
              </span>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={activeIndex <= 0}
                onClick={goToPreviousField}
              >
                <ChevronLeft className='size-4' aria-hidden='true' />
                Previous
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={
                  activeIndex < 0 || activeIndex >= fieldQueue.length - 1
                }
                onClick={goToNextField}
              >
                Next
                <ChevronRight className='size-4' aria-hidden='true' />
              </Button>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                disabled={missingIds.length === 0}
                onClick={goToNextRequiredField}
              >
                Next required field
              </Button>
              <Button
                type='button'
                size='sm'
                className='bg-yellow-400 font-semibold text-slate-900 hover:bg-yellow-300'
                disabled={!canFinish}
                onClick={() => void submit()}
              >
                {busy === 'completing' && (
                  <Loader2 className='animate-spin' aria-hidden='true' />
                )}
                FINISH
              </Button>
            </div>
          </div>
        </div>
      )}

      <SignatureAdoptionModal
        open={showAdoptionModal}
        signerName={session.signerName}
        consentLanguage={session.consent.language}
        signatureType={signatureType}
        typedSignature={typedSignature}
        drawnSignature={drawnSignature}
        initials={modalInitials}
        consent={modalConsent}
        drawingError={drawingError}
        onSignatureTypeChange={setSignatureType}
        onTypedSignatureChange={setTypedSignature}
        onDrawnSignatureChange={setDrawnSignature}
        onInitialsChange={setModalInitials}
        onConsentChange={setModalConsent}
        onDrawingError={setDrawingError}
        onClose={() => setShowAdoptionModal(false)}
        onConfirm={confirmAdoption}
      />
    </main>
  );
}
