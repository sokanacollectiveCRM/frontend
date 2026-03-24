import type { ActivityDTO, CreateActivityDTO } from '../dto/activity.dto';
import type { Activity, CreateActivityInput } from '@/domain/activity';

/**
 * Map an ActivityDTO to domain Activity.
 * Canonical mode only - no legacy format handling.
 */
export function mapActivity(dto: ActivityDTO): Activity {
  const meta = dto.metadata && typeof dto.metadata === 'object' ? dto.metadata : {};
  const visibleFromMeta =
    meta.visibleToClient === true ||
    meta.visible_to_client === true ||
    dto.visible_to_client === true;
  return {
    id: dto.id,
    clientId: dto.client_id,
    createdBy: dto.created_by,
    activityType: dto.activity_type,
    content: dto.content,
    createdAt: dto.created_at,
    visibleToClient: visibleFromMeta || dto.visible_to_client === true,
  };
}

/**
 * Map CreateActivityInput to CreateActivityDTO.
 * camelCase → snake_case for backend.
 */
export function mapCreateActivityInput(input: CreateActivityInput): CreateActivityDTO {
  const body: CreateActivityDTO = {
    activity_type: input.activityType,
    content: input.content,
  };
  if (input.visibleToClient === true) {
    body.visible_to_client = true;
  }
  return body;
}
