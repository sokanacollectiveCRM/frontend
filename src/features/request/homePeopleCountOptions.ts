export const HOME_PEOPLE_COUNT_OPTIONS = ['0', '1', '2', '3', '4', '5+'] as const;

export type HomePeopleCount = (typeof HOME_PEOPLE_COUNT_OPTIONS)[number];

export const HOME_PEOPLE_IN_HOME_QUESTION =
  'How many other people live in the home with you? (not including you or the baby)';

export const HOME_ADULTS_COUNT_LABEL = 'Adult (18 and older)';
export const HOME_YOUTH_COUNT_LABEL = 'Youth (under 18)';
