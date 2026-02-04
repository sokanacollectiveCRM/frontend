// src/common/hooks/clients/useClients.ts
import {
    getSessionExpirationMessage,
    isSessionExpiredError,
} from '@/common/utils/sessionUtils';
import type { Client } from '@/features/pipeline/data/schema';
import { useCallback, useState } from 'react';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const BASE = import.meta.env.VITE_APP_BACKEND_URL;

      const res = await fetch(`${BASE}/clients`, {
        credentials: 'include',
      });

      console.log('🔍 DEBUG: API Response status:', res.status);
      console.log('🔍 DEBUG: API Response ok:', res.ok);

      if (!res.ok) {
        const txt = await res.text();
        console.error('🔍 DEBUG: API Error response:', res.status, txt);

        // Check for authentication/session expiration errors
        if (isSessionExpiredError(res.status, txt)) {
          throw new Error(getSessionExpirationMessage());
        }

        throw new Error(`Failed (${res.status}): ${txt || res.statusText}`);
      }

      // cast it to Client[] so setClients has the right shape
      const apiData = (await res.json()) as any[];
      console.log('🔍 DEBUG: Raw API data:', apiData);
      console.log('🔍 DEBUG: API data length:', apiData?.length);
      console.log('🔍 DEBUG: First API client structure:', apiData[0]);
      console.log('🔍 DEBUG: First API client user object:', apiData[0]?.user);

      // Flatten user object into top-level and map database fields to frontend fields
      const data = apiData.map((client) => {
        const mappedClient = {
          // Start with user object (contains most fields)
          ...client.user,
          // Override with top-level client properties (contains relationships and computed fields)
          ...client,
          // Map database field names to frontend field names
          phoneNumber: client.phone_number || client.phoneNumber || client.user?.phoneNumber || '',
          // Ensure firstname and lastname are properly mapped from user object
          firstname: client.user?.firstname || client.user?.firstName || client.firstname || client.firstName || '',
          lastname: client.user?.lastname || client.user?.lastName || client.lastname || client.lastName || '',
          // Map service needed from top level or user object
          serviceNeeded: client.serviceNeeded || client.user?.service_needed || '',
          // Map dates properly
          requestedAt: client.requestedAt ? new Date(client.requestedAt) : new Date(),
          updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date(),
          // Map status from top level or user object
          status: client.status || client.user?.status || 'lead',
          // Preserve portal-related fields (from backend or top-level)
          portal_status: client.portal_status || client.user?.portal_status || undefined,
          // Backend-computed eligibility field (preferred - server-side computation)
          is_eligible: client.is_eligible !== undefined ? client.is_eligible : (client.user?.is_eligible !== undefined ? client.user.is_eligible : undefined),
          portal_eligible: client.portal_eligible || client.user?.portal_eligible || undefined,
          is_portal_eligible: client.is_portal_eligible || client.user?.is_portal_eligible || undefined,
          // Preserve contract and payment data for eligibility checking
          contracts: client.contracts || client.user?.contracts || undefined,
          contract_status: client.contract_status || client.user?.contract_status || undefined,
          has_signed_contract: client.has_signed_contract || client.user?.has_signed_contract || undefined,
          payments: client.payments || client.user?.payments || undefined,
          payment_status: client.payment_status || client.user?.payment_status || undefined,
          has_completed_payment: client.has_completed_payment || client.user?.has_completed_payment || undefined,
          contract_signed: client.contract_signed || client.user?.contract_signed || undefined,
          payment_succeeded: client.payment_succeeded || client.user?.payment_succeeded || undefined,
          // Preserve portal invite fields
          invited_at: client.invited_at || client.user?.invited_at || undefined,
          last_invite_sent_at: client.last_invite_sent_at || client.user?.last_invite_sent_at || undefined,
          invite_sent_count: client.invite_sent_count || client.user?.invite_sent_count || undefined,
          // Ensure all form fields are preserved (if they exist in user object)
          preferred_contact_method: client.user?.preferred_contact_method || client.preferred_contact_method || undefined,
          preferred_name: client.user?.preferred_name || client.preferred_name || undefined,
          pronouns: client.user?.pronouns || client.pronouns || undefined,
          home_type: client.user?.home_type || client.home_type || undefined,
          services_interested: client.user?.services_interested || client.services_interested || undefined,
          // Add other request form fields as needed
        };
        console.log('🔍 DEBUG: Client mapping:', {
          clientId: client.id,
          clientName: `${mappedClient.firstname} ${mappedClient.lastname}`,
          userObjectKeys: client.user ? Object.keys(client.user) : [],
          topLevelKeys: Object.keys(client),
          // Portal eligibility data (backend-computed is preferred)
          is_eligible: mappedClient.is_eligible, // ← Backend-computed eligibility
          portal_status: mappedClient.portal_status,
          contracts: mappedClient.contracts,
          contract_status: mappedClient.contract_status,
          has_signed_contract: mappedClient.has_signed_contract,
          contract_signed: mappedClient.contract_signed,
          payments: mappedClient.payments,
          payment_status: mappedClient.payment_status,
          has_completed_payment: mappedClient.has_completed_payment,
          payment_succeeded: mappedClient.payment_succeeded,
          // Raw contract/payment data from API
          rawIsEligible: client.is_eligible || client.user?.is_eligible,
          rawContracts: client.contracts || client.user?.contracts,
          rawPayments: client.payments || client.user?.payments,
          rawContractStatus: client.contract_status || client.user?.contract_status,
          rawPaymentStatus: client.payment_status || client.user?.payment_status,
        });
        return mappedClient;
      });
      setClients(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      setClients([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getClientById = async (
    id: string,
    detailed = false
  ): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const BASE = import.meta.env.VITE_APP_BACKEND_URL;
      const response = await fetch(
        `${BASE}/clients/${id}?detailed=${detailed}`,
        {
          credentials: 'include',
          headers: {
          },
        }
      );

      if (!response.ok) throw new Error('Could not fetch client');
      const data = await response.json();
      return data as Client;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching client';
      console.error(message);
      setError(message);
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
    setIsLoading,
  };
}
