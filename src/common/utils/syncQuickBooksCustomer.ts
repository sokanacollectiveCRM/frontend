import { createQuickBooksCustomer } from '@/api/quickbooks/auth/customer';

type CustomerSource = {
  id?: string;
  status?: string;
  firstName?: string;
  first_name?: string;
  firstname?: string;
  lastName?: string;
  last_name?: string;
  lastname?: string;
  email?: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function shouldSyncToQuickBooks(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return normalized === 'matched' || normalized === 'customer';
}

export async function syncQuickBooksCustomerFromClient(
  client: CustomerSource
): Promise<{ success: boolean; qbCustomerId?: string; error?: string }> {
  const status = normalizeText(client.status);
  if (!shouldSyncToQuickBooks(status)) {
    return { success: false };
  }

  const internalCustomerId = normalizeText(client.id);
  const firstName = normalizeText(
    client.firstName ?? client.first_name ?? client.firstname
  );
  const lastName = normalizeText(
    client.lastName ?? client.last_name ?? client.lastname
  );
  const email = normalizeText(client.email);

  if (!internalCustomerId || !firstName || !lastName || !email) {
    return {
      success: false,
      error:
        'Missing customer data required to sync to QuickBooks customer list',
    };
  }

  try {
    const result = await createQuickBooksCustomer({
      internalCustomerId,
      firstName,
      lastName,
      email,
    });

    return { success: true, qbCustomerId: result.qbCustomerId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync QuickBooks customer';
    console.error('Failed to sync QuickBooks customer:', error);
    return { success: false, error: message };
  }
}
