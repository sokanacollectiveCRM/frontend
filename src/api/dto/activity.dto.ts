/**
 * DTO types for /clients/:id/activities endpoint responses.
 * Field names match backend response (snake_case).
 */

/**
 * Activity as returned by GET /clients/:id/activities.
 */
export interface ActivityDTO {
  id: string;
  client_id: string;
  created_by?: string;
  activity_type: string;
  content: string;
  created_at: string;
  visible_to_client?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Request body for POST /clients/:id/activity.
 */
export interface CreateActivityDTO {
  activity_type: string;
  content: string;
  visible_to_client?: boolean;
}
