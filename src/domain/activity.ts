/**
 * Domain types for Activity - used by UI components.
 * Field names are camelCase (frontend convention).
 */

/**
 * Activity domain type for display.
 */
export interface Activity {
  id: string;
  clientId: string;
  createdBy?: string;
  activityType: string;
  content: string;
  createdAt: string;
  visibleToClient?: boolean;
}

/**
 * Input type for creating a new activity.
 */
export interface CreateActivityInput {
  activityType: string;
  content: string;
  visibleToClient?: boolean;
}
