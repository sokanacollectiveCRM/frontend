export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
}

export interface DoulaDashboardOutletContext {
  onProfileStatusChange: (status: ProfileCompletionStatus) => void;
}
