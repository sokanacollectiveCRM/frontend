// src/common/hooks/clients/useClients.ts
import {
    getSessionExpirationMessage,
    isSessionExpiredError,
} from '@/common/utils/sessionUtils';
import { fetchClients, fetchClientById, updateClientStatus } from '@/api/services/clients.service';
import { fetchActivities, createActivity } from '@/api/services/activities.service';
import { ApiError } from '@/api/errors';
import type { Client, ClientDetail, ClientStatus } from '@/domain/client';
import type { Activity, CreateActivityInput } from '@/domain/activity';
import { useCallback, useState } from 'react';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchClients();
      setClients(data);
      return data;
    } catch (err: unknown) {
      // Handle session expiration
      if (err instanceof ApiError) {
        if (isSessionExpiredError(err.status, err.message)) {
          setError(getSessionExpirationMessage());
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setClients([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a single client by ID using the migrated service.
   * Returns domain ClientDetail type (canonical mode only).
   */
  const getClientById = async (id: string): Promise<ClientDetail | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchClientById(id);
      return data;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (isSessionExpiredError(err.status, err.message)) {
          setError(getSessionExpirationMessage());
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a client's status using the migrated service.
   * Returns domain ClientDetail type (canonical mode only).
   */
  const updateStatus = async (
    clientId: string,
    status: ClientStatus
  ): Promise<ClientDetail | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await updateClientStatus(clientId, status);
      return data;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (isSessionExpiredError(err.status, err.message)) {
          setError(getSessionExpirationMessage());
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch all activities for a client.
   * Returns Activity[] or null on error (canonical mode only).
   */
  const getActivities = async (clientId: string): Promise<Activity[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchActivities(clientId);
      return data;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (isSessionExpiredError(err.status, err.message)) {
          setError(getSessionExpirationMessage());
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new activity for a client.
   * Returns the created Activity or null on error (canonical mode only).
   */
  const addActivity = async (
    clientId: string,
    input: CreateActivityInput
  ): Promise<Activity | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await createActivity(clientId, input);
      return data;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (isSessionExpiredError(err.status, err.message)) {
          setError(getSessionExpirationMessage());
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    isLoading,
    error,
    getClients,
    getClientById,
    updateStatus,
    getActivities,
    addActivity,
    setIsLoading,
  };
}
