import { get, post } from '../http';
import { API_CONFIG } from '../config';
import { mapActivity, mapCreateActivityInput } from '../mappers/activity.mapper';
import type { ActivityDTO, CreateActivityDTO } from '../dto/activity.dto';
import type { Activity, CreateActivityInput } from '@/domain/activity';

/**
 * Fetch all activities for a client.
 *
 * Canonical mode only - throws if legacy mode is enabled.
 */
export async function fetchActivities(clientId: string): Promise<Activity[]> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  const dtos = await get<ActivityDTO[]>(`/clients/${clientId}/activities`);
  return dtos.map(mapActivity);
}

/**
 * Create a new activity for a client.
 *
 * Canonical mode only - throws if legacy mode is enabled.
 */
export async function createActivity(
  clientId: string,
  input: CreateActivityInput
): Promise<Activity> {
  if (API_CONFIG.useLegacyApi) {
    throw new Error('Legacy mode disabled. Set VITE_USE_LEGACY_API=false.');
  }

  const body = mapCreateActivityInput(input);
  const dto = await post<ActivityDTO, CreateActivityDTO>(
    `/clients/${clientId}/activity`,
    body
  );
  return mapActivity(dto);
}
