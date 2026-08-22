// types/signnow.ts
import { fetchWithAuth } from '@/api/http';
import { logFailure } from '@/utils/safeLog';
export interface SignNowClient {
  email: string;
  name: string;
}

export interface SignNowResponse {
  success: boolean;
  error?: string;
  invite?: {
    status: string;
  };
  rolesUsed?: {
    clientRole: string;
    partnerRole: string;
  };
  note?: string;
}

// services/signNowService.ts
import { apiBaseUrl } from '@/config/env';

const BACKEND_URL = apiBaseUrl;

export const signNowService = {
  async sendInvitation(client: SignNowClient): Promise<SignNowResponse> {
    try {
      const response = await fetchWithAuth(
        `${BACKEND_URL}/api/signnow/send-client-partner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client,
            subject: 'Contract Ready for Signature',
            message: 'Please review and sign this contract',
            sequential: false,
            clientRole: 'Recipient 1', // This matches the role in the template
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error(
            'Daily invite limit exceeded. Please try again tomorrow.'
          );
        }
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      return response.json();
    } catch (error) {
      logFailure('services', 'signnow_service_error');
      throw error;
    }
  },
};
