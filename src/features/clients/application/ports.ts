import type { Activity, CreateActivityInput } from '@/domain/activity';
import type { Client, ClientDetail } from '../domain/client';

/**
 * Client data access used by application hooks.
 * Composition binds this to the infrastructure adapters.
 */
export interface ClientsPort {
  fetchClients(): Promise<Client[]>;
  getCachedClientDetail(clientId: string): ClientDetail | undefined;
  loadClientDetail(
    clientId: string,
    options?: { force?: boolean }
  ): Promise<ClientDetail | null>;
  updateClientStatus(clientId: string, status: string): Promise<ClientDetail>;
  fetchActivities(clientId: string): Promise<Activity[]>;
  createActivity(
    clientId: string,
    input: CreateActivityInput
  ): Promise<Activity>;
}
