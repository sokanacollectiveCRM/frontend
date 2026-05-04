import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, ShieldCheck, X } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/common/components/ui/alert';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { cn } from '@/lib/utils';

import {
  createPaymentMethodRequestId,
  getPaymentMethod,
  parseExpiration,
  savePaymentMethod,
  tokenizeIntuitCard,
  PaymentMethodApiError,
  type QuickBooksCardTokenizationInput,
  type PaymentMethodMetadata,
} from './quickbooksPayments';

type FormFieldKey =
  | 'cardholderName'
  | 'cardNumber'
  | 'expiration'
  | 'cvc'
  | 'billingAddress1'
  | 'billingAddress2'
  | 'billingCity'
  | 'billingState'
  | 'billingPostalCode'
  | 'billingCountry';

type FormValues = Record<FormFieldKey, string>;
type FormErrors = Partial<Record<FormFieldKey, string>> & { form?: string };

export type QuickBooksCardOnFileFormStatus = 'idle' | 'submitting' | 'tokenizing' | 'saving' | 'success' | 'error';
export type QuickBooksCardOnFileFormDisplayMode = 'full' | 'compact';

export interface QuickBooksCardOnFileFormProps {
  clientId: string;
  onSuccess?: (metadata: PaymentMethodMetadata) => void;
  onError?: (message: string) => void;
  onCancel?: () => void;
  initialDisplayMode?: QuickBooksCardOnFileFormDisplayMode;
  className?: string;
  tokenEndpoint?: string;
  saveEndpoint?: string;
}

const DEFAULT_VALUES: FormValues = {
  cardholderName: '',
  cardNumber: '',
  expiration: '',
  cvc: '',
  billingAddress1: '',
  billingAddress2: '',
  billingCity: '',
  billingState: '',
  billingPostalCode: '',
  billingCountry: 'US',
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function validateValues(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.cardholderName.trim()) errors.cardholderName = 'Enter the name on the card.';
  if (digitsOnly(values.cardNumber).length < 13) {
    errors.cardNumber = 'Enter the full card number.';
  }
  if (!parseExpiration(values.expiration)) errors.expiration = 'Enter the expiration as MM/YY.';
  if (digitsOnly(values.cvc).length < 3) errors.cvc = 'Enter the 3-digit or 4-digit security code.';
  if (!values.billingAddress1.trim()) errors.billingAddress1 = 'Enter the billing street address.';
  if (!values.billingCity.trim()) errors.billingCity = 'Enter the billing city.';
  if (!values.billingState.trim()) errors.billingState = 'Enter the billing state.';
  if (!values.billingPostalCode.trim()) errors.billingPostalCode = 'Enter the billing postal code.';
  if (!values.billingCountry.trim()) errors.billingCountry = 'Enter the billing country.';

  return errors;
}

function toFriendlyErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  switch (code) {
    case 'validation_error':
      return 'Please fix the highlighted fields and try again.';
    case 'unauthorized':
    case 'forbidden':
      return 'Please sign in again or reconnect your account.';
    case 'client_not_found':
      return 'We could not find this client. Please refresh and try again.';
    case 'quickbooks_not_connected':
      return 'QuickBooks is not connected right now.';
    case 'provider_timeout':
      return 'The payment service took too long to respond. Please try again.';
    case 'provider_save_failure':
    case 'database_persistence_failure':
      return 'We could not save this card. Please try again.';
    case 'invalid_token':
    case 'expired_token':
      return 'The payment token expired. Please try again.';
    case 'duplicate_request':
      return 'This request was already processed. Refreshing your saved card.';
    default:
      return 'We could not save this card. Please try again.';
  }
}

function buildTokenizationInput(clientId: string, values: FormValues): QuickBooksCardTokenizationInput {
  return {
    clientId,
    cardholderName: values.cardholderName.trim(),
    cardNumber: digitsOnly(values.cardNumber),
    expiration: values.expiration.trim(),
    cvc: digitsOnly(values.cvc),
    billingAddress1: values.billingAddress1.trim(),
    billingAddress2: values.billingAddress2.trim() || undefined,
    billingCity: values.billingCity.trim(),
    billingState: values.billingState.trim(),
    billingPostalCode: values.billingPostalCode.trim(),
    billingCountry: values.billingCountry.trim() || 'US',
  };
}

function makeInitialValues(initialDisplayMode: QuickBooksCardOnFileFormDisplayMode | undefined): FormValues {
  if (initialDisplayMode === 'compact') {
    return { ...DEFAULT_VALUES };
  }
  return { ...DEFAULT_VALUES };
}

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof PaymentMethodApiError) return error.code;
  if (error instanceof Error && 'code' in error && typeof (error as { code?: unknown }).code === 'string') {
    return (error as { code?: string }).code;
  }
  return undefined;
}

function getErrorDetails(error: unknown): Record<string, unknown> | undefined {
  if (error instanceof PaymentMethodApiError && error.details) return error.details;
  if (error instanceof Error && 'details' in error && typeof (error as { details?: unknown }).details === 'object') {
    return (error as { details?: Record<string, unknown> }).details;
  }
  return undefined;
}

function extractFieldErrors(error: unknown): FormErrors {
  const details = getErrorDetails(error);
  if (!details) return {};
  const fields =
    (details.fieldErrors as Record<string, string | string[] | undefined> | undefined) ??
    (details.fields as Record<string, string | string[] | undefined> | undefined) ??
    (details.errors as Record<string, string | string[] | undefined> | undefined);
  if (!fields) return {};

  const nextErrors: FormErrors = {};
  Object.entries(fields).forEach(([key, value]) => {
    const message = Array.isArray(value) ? value[0] : value;
    if (typeof message !== 'string' || !message.trim()) return;
    if (key in DEFAULT_VALUES) {
      nextErrors[key as FormFieldKey] = message;
    } else {
      nextErrors.form = message;
    }
  });
  return nextErrors;
}

export default function QuickBooksCardOnFileForm({
  clientId,
  onSuccess,
  onError,
  onCancel,
  initialDisplayMode = 'full',
  className,
  tokenEndpoint = import.meta.env.VITE_QUICKBOOKS_PAYMENTS_TOKEN_ENDPOINT || '',
  saveEndpoint = import.meta.env.VITE_QUICKBOOKS_PAYMENTS_SAVE_ENDPOINT || '/api/quickbooks/payments/cards',
}: QuickBooksCardOnFileFormProps) {
  const [values, setValues] = useState<FormValues>(() => makeInitialValues(initialDisplayMode));
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<QuickBooksCardOnFileFormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Your card is securely stored for future billing use.'
  );
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethodMetadata | null>(null);
  const [loadingCurrentPaymentMethod, setLoadingCurrentPaymentMethod] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isBusy = status === 'submitting' || status === 'tokenizing' || status === 'saving';

  const maskedSummary = useMemo(() => {
    if (!currentPaymentMethod?.last4) return '';
    const brand = currentPaymentMethod.card_brand ? currentPaymentMethod.card_brand : 'Card';
    return `${brand} ending in ${currentPaymentMethod.last4}`;
  }, [currentPaymentMethod]);

  useEffect(() => {
    if (!clientId.trim()) return;

    let active = true;
    setLoadingCurrentPaymentMethod(true);
    void (async () => {
      try {
        const paymentMethod = await getPaymentMethod({ clientId });
        if (!active || !mountedRef.current) return;
        setCurrentPaymentMethod(paymentMethod);
      } catch {
        if (!active || !mountedRef.current) return;
        setCurrentPaymentMethod(null);
      } finally {
        if (active && mountedRef.current) {
          setLoadingCurrentPaymentMethod(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [clientId]);

  function resetSensitiveState() {
    setValues({ ...DEFAULT_VALUES });
  }

  function updateField(field: FormFieldKey, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    if (status === 'error') {
      setStatus('idle');
      setStatusMessage('Your card is securely stored for future billing use.');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});
    setStatusMessage('Checking the card details.');

    if (!clientId.trim()) {
      const message = 'We could not save this card. Please try again.';
      setStatus('error');
      setStatusMessage(message);
      setErrors({ form: message });
      onError?.(message);
      resetSensitiveState();
      return;
    }

    const submittedValues = { ...values };
    const validationErrors = validateValues(submittedValues);
    if (Object.keys(validationErrors).length > 0) {
      setStatus('error');
      setErrors(validationErrors);
      setStatusMessage('Please fix the highlighted fields and try again.');
      onError?.('Please fix the highlighted fields and try again.');
      resetSensitiveState();
      return;
    }

    try {
      setStatus('tokenizing');
      setStatusMessage('Sending the card details to Intuit securely.');

      const token = await tokenizeIntuitCard(buildTokenizationInput(clientId, submittedValues), {
        endpoint: tokenEndpoint,
      });

      if (!mountedRef.current) return;

      resetSensitiveState();
      setStatus('saving');
      setStatusMessage('Saving the token with QuickBooks.');

      let metadata: PaymentMethodMetadata | null = null;
      let retriedTokenization = false;
      let retriedSaveTimeout = false;
      let currentToken = token;
      const requestId = createPaymentMethodRequestId();

      while (mountedRef.current && metadata === null) {
        try {
          metadata = await savePaymentMethod(
            {
              client_id: clientId,
              intuit_token: currentToken,
              request_id: requestId,
            },
            {
              endpoints: [
                saveEndpoint,
                '/api/payment-methods',
                '/api/quickbooks/payment-methods',
                '/quickbooks/payment-methods',
              ],
            }
          );
          break;
        } catch (error) {
          const code = getErrorCode(error);

          if ((code === 'invalid_token' || code === 'expired_token') && !retriedTokenization) {
            retriedTokenization = true;
            setStatus('tokenizing');
            setStatusMessage('Reconnecting to Intuit and trying again.');
            currentToken = await tokenizeIntuitCard(buildTokenizationInput(clientId, submittedValues), {
              endpoint: tokenEndpoint,
            });
            resetSensitiveState();
            setStatus('saving');
            setStatusMessage('Saving the token with QuickBooks.');
            continue;
          }

          if (code === 'provider_timeout' && !retriedSaveTimeout) {
            retriedSaveTimeout = true;
            setStatus('saving');
            setStatusMessage('Saving the card...');
            continue;
          }

          if (code === 'duplicate_request') {
            metadata = (await getPaymentMethod({ clientId })) ?? currentPaymentMethod;
            if (!metadata) {
              throw error;
            }
            break;
          }

          throw error;
        }
      }

      if (!mountedRef.current) return;

      if (!metadata) {
        metadata = await getPaymentMethod({ clientId });
      }

      if (!metadata) {
        throw new PaymentMethodApiError('The card was saved, but no metadata was returned.', 502);
      }

      setCurrentPaymentMethod(metadata);
      setStatus('success');
      setStatusMessage('The card was saved successfully.');
      onSuccess?.(metadata);
    } catch (error) {
      if (!mountedRef.current) return;
      const safeMessage = toFriendlyErrorMessage(error);
      setStatus('error');
      setStatusMessage(safeMessage);
      const fieldErrors = extractFieldErrors(error);
      setErrors((current) => ({
        ...current,
        ...fieldErrors,
        form: safeMessage,
      }));
      onError?.(safeMessage);
    } finally {
      if (mountedRef.current) {
        resetSensitiveState();
      }
    }
  }

  function handleCancel() {
    resetSensitiveState();
    setErrors({});
    setStatus('idle');
    setStatusMessage('Your card is securely stored for future billing use.');
    onCancel?.();
  }

  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      <CardHeader className={cn(initialDisplayMode === 'compact' ? 'px-4 pb-0 pt-4' : undefined)}>
        <div className='flex items-start justify-between gap-3'>
          <div className='space-y-1.5'>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <CreditCard className='h-5 w-5' />
              Save a card for future billing
            </CardTitle>
            <CardDescription>
              Securely store a customer card in QuickBooks Payments without sending card details to your server.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-6', initialDisplayMode === 'compact' ? 'px-4 pb-4' : undefined)}>
        <div className='flex items-start gap-3 rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground'>
          <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
          <p>
            Card details are entered in the browser, tokenized with Intuit, and stored securely by QuickBooks.
          </p>
        </div>

        <div className='rounded-lg border bg-muted/20 p-4 space-y-2'>
          <div className='text-sm font-medium'>QuickBooks card on file</div>
          {loadingCurrentPaymentMethod ? (
            <p className='text-sm text-muted-foreground'>Loading saved card details...</p>
          ) : currentPaymentMethod ? (
            <div className='grid gap-2 text-sm sm:grid-cols-2'>
              <MetadataLine label='Brand' value={currentPaymentMethod.card_brand || 'Card'} />
              <MetadataLine label='Last 4' value={currentPaymentMethod.last4 || '—'} />
              <MetadataLine label='Expires' value={formatExpiry(currentPaymentMethod.exp_month, currentPaymentMethod.exp_year)} />
              <MetadataLine label='Status' value={currentPaymentMethod.status || 'Saved'} />
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No card is stored with QuickBooks yet.</p>
          )}
        </div>

        <div aria-live='polite' className='space-y-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <span className={cn(
              'inline-flex h-2.5 w-2.5 rounded-full',
              status === 'success'
                ? 'bg-emerald-500'
                : status === 'error'
                  ? 'bg-destructive'
                  : status === 'tokenizing' || status === 'saving'
                    ? 'bg-amber-500'
                    : 'bg-muted-foreground'
            )} />
            <span>{statusMessage}</span>
          </div>

          {status === 'error' && errors.form ? (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>We could not save this card</AlertTitle>
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          ) : null}

          {status === 'success' && currentPaymentMethod ? (
            <Alert className='border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'>
              <CheckCircle2 className='h-4 w-4' />
              <AlertTitle>Card saved</AlertTitle>
              <AlertDescription>
                <div className='mt-3 grid gap-2 text-sm sm:grid-cols-2'>
                  <MetadataLine label='Client ID' value={currentPaymentMethod.client_id} />
                  <MetadataLine label='Status' value={currentPaymentMethod.status || 'Saved'} />
                  <MetadataLine label='Card' value={maskedSummary || 'Saved card'} />
                  <MetadataLine label='Last 4' value={currentPaymentMethod.last4 || '—'} />
                  <MetadataLine label='Expires' value={formatExpiry(currentPaymentMethod.exp_month, currentPaymentMethod.exp_year)} />
                  <MetadataLine label='QuickBooks customer' value={currentPaymentMethod.quickbooks_customer_id || '—'} />
                </div>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <form className='space-y-5' onSubmit={handleSubmit} autoComplete='off'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Field
              htmlFor='qb-cardholder-name'
              label='Name on card'
              error={errors.cardholderName}
              input={
                <Input
                  id='qb-cardholder-name'
                  value={values.cardholderName}
                  onChange={(event) => updateField('cardholderName', event.target.value)}
                  placeholder='Jane Doe'
                  autoComplete='off'
                  disabled={isBusy}
                />
              }
            />

            <Field
              htmlFor='qb-card-number'
              label='Card number'
              error={errors.cardNumber}
              input={
                <Input
                  id='qb-card-number'
                  value={values.cardNumber}
                  onChange={(event) => updateField('cardNumber', digitsOnly(event.target.value))}
                  placeholder='1234 1234 1234 1234'
                  inputMode='numeric'
                  autoComplete='off'
                  disabled={isBusy}
                  maxLength={19}
                />
              }
            />
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <Field
              htmlFor='qb-expiration'
              label='Expiration'
              error={errors.expiration}
              helper='Use MM/YY'
              input={
                <Input
                  id='qb-expiration'
                  value={values.expiration}
                  onChange={(event) => updateField('expiration', event.target.value)}
                  placeholder='MM/YY'
                  inputMode='numeric'
                  autoComplete='off'
                  disabled={isBusy}
                  maxLength={7}
                />
              }
            />

            <Field
              htmlFor='qb-cvc'
              label='Security code'
              error={errors.cvc}
              helper='3 or 4 digits'
              input={
                <Input
                  id='qb-cvc'
                  value={values.cvc}
                  onChange={(event) => updateField('cvc', digitsOnly(event.target.value))}
                  placeholder='123'
                  inputMode='numeric'
                  autoComplete='off'
                  disabled={isBusy}
                  maxLength={4}
                />
              }
            />

            <Field
              htmlFor='qb-billing-country'
              label='Country'
              error={errors.billingCountry}
              input={
                <Input
                  id='qb-billing-country'
                  value={values.billingCountry}
                  onChange={(event) => updateField('billingCountry', event.target.value)}
                  placeholder='US'
                  autoComplete='off'
                  disabled={isBusy}
                />
              }
            />
          </div>

          <div className='space-y-4'>
            <Field
              htmlFor='qb-billing-address-1'
              label='Billing address'
              error={errors.billingAddress1}
              input={
                <Input
                  id='qb-billing-address-1'
                  value={values.billingAddress1}
                  onChange={(event) => updateField('billingAddress1', event.target.value)}
                  placeholder='123 Main St'
                  autoComplete='off'
                  disabled={isBusy}
                />
              }
            />

            <Field
              htmlFor='qb-billing-address-2'
              label='Apartment, suite, or unit'
              error={errors.billingAddress2}
              input={
                <Input
                  id='qb-billing-address-2'
                  value={values.billingAddress2}
                  onChange={(event) => updateField('billingAddress2', event.target.value)}
                  placeholder='Apt 4B'
                  autoComplete='off'
                  disabled={isBusy}
                />
              }
            />
          </div>

          <div className='grid gap-4 md:grid-cols-3'>
            <Field
              htmlFor='qb-billing-city'
              label='City'
              error={errors.billingCity}
              input={
                <Input
                  id='qb-billing-city'
                  value={values.billingCity}
                  onChange={(event) => updateField('billingCity', event.target.value)}
                  placeholder='Boston'
                  autoComplete='off'
                  disabled={isBusy}
                />
              }
            />

            <Field
              htmlFor='qb-billing-state'
              label='State'
              error={errors.billingState}
              input={
                <Input
                  id='qb-billing-state'
                  value={values.billingState}
                  onChange={(event) => updateField('billingState', event.target.value)}
                  placeholder='MA'
                  autoComplete='off'
                  disabled={isBusy}
                />
              }
            />

            <Field
              htmlFor='qb-billing-postal-code'
              label='Postal code'
              error={errors.billingPostalCode}
              input={
                <Input
                  id='qb-billing-postal-code'
                  value={values.billingPostalCode}
                  onChange={(event) => updateField('billingPostalCode', event.target.value)}
                  placeholder='02118'
                  inputMode='numeric'
                  autoComplete='off'
                  disabled={isBusy}
                />
              }
            />
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
            <div className='flex flex-col gap-2'>
              <div className='text-xs text-muted-foreground'>
                Card values are cleared after each submit attempt. No raw payment data is stored in app state.
              </div>
            </div>
            <div className='flex gap-2 sm:justify-end'>
              {onCancel ? (
                <Button type='button' variant='outline' onClick={handleCancel} disabled={isBusy}>
                  <X className='h-4 w-4' />
                  Cancel
                </Button>
              ) : null}
              <Button type='submit' disabled={isBusy}>
                {status === 'submitting' || status === 'tokenizing' || status === 'saving' ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : null}
                {status === 'submitting'
                  ? 'Checking details...'
                  : status === 'tokenizing'
                    ? 'Tokenizing...'
                    : status === 'saving'
                      ? 'Saving card...'
                      : 'Save card'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  htmlFor,
  label,
  error,
  helper,
  input,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  helper?: string;
  input: ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={htmlFor} className='text-sm font-medium'>
        {label}
      </Label>
      {input}
      {helper ? <p className='text-xs text-muted-foreground'>{helper}</p> : null}
      {error ? <p className='text-xs text-destructive'>{error}</p> : null}
    </div>
  );
}

function MetadataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-md border bg-background/70 px-3 py-2'>
      <div className='text-xs font-medium text-muted-foreground'>{label}</div>
      <div className='text-sm'>{value}</div>
    </div>
  );
}

function formatExpiry(month?: number | string | null, year?: number | string | null): string {
  if (!month || !year) return '—';
  const monthPart = String(month).padStart(2, '0');
  const yearPart = String(year).slice(-2);
  return `${monthPart}/${yearPart}`;
}
