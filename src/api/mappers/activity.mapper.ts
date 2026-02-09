import type { ActivityDTO, CreateActivityDTO } from '../dto/activity.dto';
import type { Activity, CreateActivityInput } from '@/domain/activity';

/**
 * Map an ActivityDTO to domain Activity.
 * Canonical mode only - no legacy format handling.
 */
export function mapActivity(dto: ActivityDTO): Activity {
  return {
    id: dto.id,
    clientId: dto.client_id,
    createdBy: dto.created_by,
    activityType: dto.activity_type,
    content: dto.content,
    createdAt: dto.created_at,
  };
}

/**
 * Map CreateActivityInput to CreateActivityDTO.
 * camelCase → snake_case for backend.
 */
export function mapCreateActivityInput(input: CreateActivityInput): CreateActivityDTO {
  return {
    activity_type: input.activityType,
    content: input.content,
  };
}
