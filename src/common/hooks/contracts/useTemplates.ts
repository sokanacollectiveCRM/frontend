import { Template } from '@/common/types/template';
import { logFailure } from '@/utils/safeLog';
import { useState } from 'react';
import { fetchWithAuth, buildUrl } from '@/api/http';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTemplates = async (): Promise<Template[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithAuth(buildUrl('/contracts/templates'), {
        cache: 'no-store',
        headers: {},
      });

      if (!response.ok) {
        throw new Error(`Could not fetch templates (${response.status})`);
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? (data as Template[])
        : Array.isArray((data as { data?: Template[] })?.data)
          ? (data as { data: Template[] }).data
          : [];
      setTemplates(list);
      return list;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching templates';
      logFailure('hooks', 'operation_failed');
      setError(message);
      setTemplates([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    isLoading,
    error,
    getTemplates,
  };
}
