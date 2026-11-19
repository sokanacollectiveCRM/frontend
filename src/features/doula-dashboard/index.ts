export { default as DoulaDashboardRoutes } from './DoulaDashboardRoutes';

export type {
  AssignedClientDetailed,
  AssignedClientLite,
  DoulaProfile,
  UpdateProfileData,
} from './infrastructure/doulaService';

export type {
  DoulaRaceEthnicitySlug,
} from './domain/doulaDemographics';
export {
  DOULA_RACE_ETHNICITY_OPTIONS,
  normalizeRaceEthnicityFromApi,
} from './domain/doulaDemographics';
