import { Button } from '@/common/components/ui/button';
import { Checkbox } from '@/common/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/components/ui/tabs';
import { SignatureCanvas } from '@/features/public-signing/SignatureCanvas';
import {
  defaultTypedSignatureValue,
  TYPED_SIGNATURE_FONT,
} from '@/features/public-signing/signingDisplay';
import type { SignatureValue } from '@/features/public-signing/types';

interface SignatureAdoptionModalProps {
  open: boolean;
  signerName: string;
  consentLanguage: string;
  signatureType: 'typed' | 'drawn';
  typedSignature: string;
  drawnSignature: string | null;
  initials: string;
  consent: boolean;
  drawingError: string | null;
  onSignatureTypeChange: (value: 'typed' | 'drawn') => void;
  onTypedSignatureChange: (value: string) => void;
  onDrawnSignatureChange: (value: string | null) => void;
  onInitialsChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onDrawingError: (message: string | null) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function buildSignature(
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

export function SignatureAdoptionModal({
  open,
  signerName,
  consentLanguage,
  signatureType,
  typedSignature,
  drawnSignature,
  initials,
  consent,
  drawingError,
  onSignatureTypeChange,
  onTypedSignatureChange,
  onDrawnSignatureChange,
  onInitialsChange,
  onConsentChange,
  onDrawingError,
  onClose,
  onConfirm,
}: SignatureAdoptionModalProps) {
  const signature = buildSignature(
    signatureType,
    typedSignature,
    drawnSignature
  );
  const canConfirm =
    Boolean(signature) &&
    initials.trim().length > 0 &&
    initials.trim().length <= 16 &&
    consent;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Adopt your signature</DialogTitle>
          <DialogDescription>
            Choose how you want to sign, enter your initials, and confirm that
            you agree to sign electronically.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='space-y-2'>
            <Label>Signature</Label>
            <Tabs
              value={signatureType}
              onValueChange={(value) =>
                onSignatureTypeChange(value as 'typed' | 'drawn')
              }
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='typed'>Type</TabsTrigger>
                <TabsTrigger value='drawn'>Draw</TabsTrigger>
              </TabsList>
              <TabsContent value='typed'>
                <Label htmlFor='adopt-typed-signature' className='sr-only'>
                  Typed signature
                </Label>
                <Input
                  id='adopt-typed-signature'
                  value={typedSignature}
                  maxLength={200}
                  autoComplete='name'
                  placeholder={signerName}
                  className='h-14 text-2xl'
                  style={{ fontFamily: TYPED_SIGNATURE_FONT }}
                  onChange={(event) =>
                    onTypedSignatureChange(event.target.value)
                  }
                />
              </TabsContent>
              <TabsContent value='drawn'>
                <SignatureCanvas
                  onChange={onDrawnSignatureChange}
                  onError={onDrawingError}
                />
                {drawingError && (
                  <p className='mt-2 text-sm text-destructive' role='alert'>
                    {drawingError}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='adopt-signer-initials'>Initials</Label>
            <Input
              id='adopt-signer-initials'
              value={initials}
              maxLength={16}
              autoComplete='off'
              onChange={(event) => onInitialsChange(event.target.value)}
            />
            <p className='text-xs text-muted-foreground'>
              Up to 16 characters. These will be applied to each initials field
              individually.
            </p>
          </div>

          <label className='flex items-start gap-2 rounded-lg border p-3'>
            <Checkbox
              checked={consent}
              onCheckedChange={(checked) => onConsentChange(checked === true)}
              aria-describedby='adopt-consent-language'
            />
            <span id='adopt-consent-language' className='text-sm leading-5'>
              {consentLanguage}
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button type='button' disabled={!canConfirm} onClick={onConfirm}>
            Adopt and continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
