import { apiBaseUrl } from '@/config/env';
import { fetchWithAuth } from '@/api/http';

import { IntakeDefinition, IntakeEditorState, IntakeOrgPicker } from './types';

async function throwIfFailed(response: Response): Promise<void> {
  if (response.ok) return;
  const error = await readError(response);
  const wrapped = new Error(error.message) as Error & {
    retryAfterSec?: number;
  };
  wrapped.retryAfterSec = error.retryAfterSec;
  throw wrapped;
}
async function readError(response: Response): Promise<{
  message: string;
  retryAfterSec?: number;
}> {
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    retryAfterSec?: number;
  };
  const header = response.headers.get('Retry-After');
  const retryAfterSec =
    typeof body.retryAfterSec === 'number'
      ? body.retryAfterSec
      : header
        ? Number(header)
        : undefined;
  return {
    message: body.error || 'The intake form could not be updated.',
    retryAfterSec: Number.isFinite(retryAfterSec) ? retryAfterSec : undefined,
  };
}

function withTenant(path: string, tenantId?: string | null): string {
  const url = new URL(`${apiBaseUrl}${path}`);
  if (tenantId) url.searchParams.set('tenantId', tenantId);
  return url.toString();
}

export async function getIntakeDraft(
  tenantId?: string | null
): Promise<IntakeEditorState | IntakeOrgPicker> {
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/draft', tenantId)
  );
  await throwIfFailed(response);
  return response.json();
}

export async function saveIntakeDraft(
  definition: IntakeDefinition,
  tenantId?: string | null
): Promise<IntakeEditorState> {
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/draft', tenantId),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(definition),
    }
  );
  await throwIfFailed(response);
  return response.json();
}

export async function publishIntakeDraft(
  tenantId?: string | null
): Promise<IntakeEditorState & { publishedVersion: number }> {
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/draft/publish', tenantId),
    { method: 'POST' }
  );
  await throwIfFailed(response);
  return response.json();
}

export async function discardIntakeDraft(
  tenantId?: string | null
): Promise<IntakeEditorState> {
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/draft/discard', tenantId),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    }
  );
  await throwIfFailed(response);
  return response.json();
}

export async function restoreIntakeVersion(
  version: number,
  tenantId?: string | null
): Promise<IntakeEditorState> {
  const response = await fetchWithAuth(
    withTenant(`/api/intake-forms/versions/${version}/restore`, tenantId),
    { method: 'POST' }
  );
  await throwIfFailed(response);
  return response.json();
}

export async function listIntakeVersions(
  tenantId?: string | null
): Promise<
  Array<{ version: number; publishedBy: string | null; publishedAt: string }>
> {
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/versions', tenantId)
  );
  await throwIfFailed(response);
  const body = (await response.json()) as {
    versions: Array<{
      version: number;
      publishedBy: string | null;
      publishedAt: string;
    }>;
  };
  return body.versions;
}

export async function uploadIntakeLogo(
  file: File,
  tenantId?: string | null
): Promise<IntakeEditorState> {
  const body = new FormData();
  body.set('logo', file);
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/draft/logo', tenantId),
    { method: 'POST', body }
  );
  await throwIfFailed(response);
  return response.json();
}

export async function removeIntakeLogo(
  tenantId?: string | null
): Promise<IntakeEditorState> {
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/draft/logo', tenantId),
    { method: 'DELETE' }
  );
  await throwIfFailed(response);
  return response.json();
}

export async function submitIntakeTest(
  answers: Record<string, unknown>,
  tenantId?: string | null,
  version?: number
): Promise<void> {
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/test-submissions', tenantId),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, version }),
    }
  );
  if (!response.ok) {
    const error = await readError(response);
    const wrapped = new Error(error.message) as Error & {
      retryAfterSec?: number;
    };
    wrapped.retryAfterSec = error.retryAfterSec;
    throw wrapped;
  }
}

export async function uploadIntakeAnswerImage(
  file: File,
  tenantId?: string | null
): Promise<string> {
  const body = new FormData();
  body.append('image', file);
  const response = await fetchWithAuth(
    withTenant('/api/intake-forms/answer-images', tenantId),
    { method: 'POST', body }
  );
  await throwIfFailed(response);
  const payload = (await response.json()) as { assetId?: string };
  if (!payload.assetId)
    throw new Error('The image upload did not return an id.');
  return payload.assetId;
}

export function liveLogoUrl(tenantId?: string | null): string {
  return withTenant('/api/intake-forms/live-logo', tenantId);
}
