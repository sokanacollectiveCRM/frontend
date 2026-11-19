import {
  createActivity,
  fetchActivities,
} from '@/api/services/activities.service';
import {
  getCachedClientDetail,
  loadClientDetail,
} from '@/api/services/clientDetailCache';
import {
  fetchClients,
  updateClientStatus,
} from '@/api/services/clients.service';
import type { ClientsPort } from './application/ports';

/** Wires client use cases to adapters. Not part of the public feature API. */
export const clientsPort: ClientsPort = {
  fetchClients,
  getCachedClientDetail,
  loadClientDetail,
  updateClientStatus,
  fetchActivities,
  createActivity,
};
