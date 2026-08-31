export type SigningFieldKind =
  | 'snapshot_text'
  | 'signature'
  | 'initials'
  | 'signing_date'
  | 'acknowledgment';

export interface SigningCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SigningManifestField {
  id: string;
  kind: SigningFieldKind;
  page: number;
  coordinates: SigningCoordinates;
  required: boolean;
  label?: string;
  fontSize?: number;
}

export interface SigningSession {
  contractId: string;
  title: string;
  signerName: string;
  status: string;
  pdfUrl: string;
  signingManifest: SigningManifestField[];
  progress: Array<{ fieldId: string; completedAt: string }>;
  consent: { language: string; version: string };
  expiresAt: string;
  canContinue: boolean;
}

export type SignatureValue =
  | { type: 'typed'; text: string; fontFamily?: string }
  | { type: 'drawn'; dataUrl: string };

export interface SigningCompletion {
  contractId: string;
  status: 'signed';
  signature: {
    id: string;
    signerId: string;
    signerName: string;
    type: 'typed' | 'drawn';
    signedAt: string;
    completedFieldIds: string[];
  };
  signedAt: string;
}

export interface CompleteSigningBody {
  signature: SignatureValue;
  consent: true;
  initials: string;
  completedFieldIds: string[];
}
