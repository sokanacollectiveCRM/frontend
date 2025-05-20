import { Template } from '@/common/types/template';
import { useState } from 'react';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTemplates = async (): Promise<Template[]> => {
    const token = localStorage.getItem('authToken');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/contracts/templates`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Could not fetch templates');

      const data = await response.json();
      console.log("template",data);
      setTemplates(data as Template[]);
      return data as Template[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching templates';
      console.error(message);
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