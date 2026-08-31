import { ApiError } from '@/api/errors';
import { buildUrl, getRequestAuth } from '@/api/http';
import { get } from '@/api/http';
import type {
  LimitedContractBillingSummary,
  LimitedContractPaymentSchedule,
} from '@/features/billing-portal/types';

export interface SignedContractDownloadLink {
  url: string;
  expiresInSeconds: number;
}

export interface BillingContractListFilters {
  status?: string;
  since?: string;
  signingProvider?: 'native' | 'legacy';
}

export async function getLimitedBillingContracts(
  filters?: BillingContractListFilters
): Promise<LimitedContractBillingSummary[]> {
  return get<LimitedContractBillingSummary[]>('/api/billing/contracts', {
    params: filters,
  });
}

export async function getLimitedContractPaymentSchedule(
  contractId: string
): Promise<LimitedContractPaymentSchedule> {
  return get<LimitedContractPaymentSchedule>(
    `/api/billing/contracts/${contractId}`
  );
}

export async function getSignedContractDownloadLink(
  contractId: string
): Promise<SignedContractDownloadLink> {
  return get<SignedContractDownloadLink>(
    `/api/billing/contracts/${encodeURIComponent(contractId)}/download`
  );
}

export async function fetchSignedContractPdfBlob(
  contractId: string
): Promise<Blob> {
  const auth = await getRequestAuth();
  const response = await fetch(
    buildUrl(
      `/api/billing/contracts/${encodeURIComponent(contractId)}/document`
    ),
    {
      method: 'GET',
      credentials: auth.credentials,
      headers: auth.headers,
    }
  );

  if (!response.ok) {
    let message = 'Unable to open the signed contract PDF.';
    try {
      const parsed = (await response.json()) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // Non-JSON error bodies are ignored.
    }
    throw new ApiError(message, response.status);
  }

  return response.blob();
}

function writePdfPreviewLoadingState(previewTab: Window): void {
  previewTab.document.title = 'Loading signed contract…';
  previewTab.document.body.innerHTML =
    '<p style="font-family: system-ui, sans-serif; padding: 24px;">Loading signed contract…</p>';
}

export async function openSignedContractPdf(contractId: string): Promise<void> {
  const previewTab = window.open('about:blank', '_blank');
  if (!previewTab) {
    throw new ApiError(
      'Pop-up blocked. Allow pop-ups for this site to view the contract PDF.',
      0
    );
  }

  previewTab.opener = null;
  writePdfPreviewLoadingState(previewTab);

  try {
    const blob = await fetchSignedContractPdfBlob(contractId);
    const objectUrl = URL.createObjectURL(blob);
    previewTab.location.href = objectUrl;
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
  } catch (error) {
    previewTab.close();
    throw error;
  }
}
