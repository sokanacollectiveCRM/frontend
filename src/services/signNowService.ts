// types/signnow.ts
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
// @ts-ignore - Vite environment variable
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5050';

export const signNowService = {
  async sendInvitation(client: SignNowClient): Promise<SignNowResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/signnow/send-client-partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          subject: "Contract Ready for Signature",
          message: "Please review and sign this contract",
          sequential: false,
          clientRole: "Recipient 1"  // This matches the role in the template
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error('Daily invite limit exceeded. Please try again tomorrow.');
        }
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      return response.json();
    } catch (error) {
      console.error('SignNow service error:', error);
      throw error;
    }
  }
};
