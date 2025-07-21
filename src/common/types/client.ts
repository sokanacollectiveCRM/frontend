// src/common/types/client.ts
export interface Client {
  id: number;
  userId?: string; // ← Add this
  firstName: string;
  lastName: string;
  email: string;
  serviceNeeded: string;
  requestedAt: string;
  updatedAt: string;
  status: string;
}
