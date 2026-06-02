/** Used on the request form Health step and matching CRM field labels. */
export const PREGNANCY_BABY_POSTPARTUM_QUESTION_LABEL =
  'Is there anything we should know regarding your pregnancy, baby, or postpartum period?';

export interface StepInfo {
  id: number;
  /** Main page heading (StepHeader). */
  title: string;
  /** Compact label in the mobile step strip. */
  shortTitle: string;
  /**
   * Desktop step-rail label when it should differ from `title` (e.g. short progress
   * label while the page uses a plain-language heading).
   */
  navTitle?: string;
}

export const STEP_CONFIG: StepInfo[] = [
  {
    id: 0,
    title: "Services Interested In",
    shortTitle: "Services"
  },
  {
    id: 1,
    title: "Client Details",
    shortTitle: "Personal"
  },
  {
    id: 2,
    title: "Home Details",
    shortTitle: "Home"
  },
  {
    id: 3,
    title: 'How did you hear about us?',
    shortTitle: 'Referral',
    navTitle: 'Referral',
  },
  {
    id: 4,
    title: 'Health information',
    shortTitle: 'Health',
    navTitle: 'Health',
  },
  {
    id: 5,
    title: "Pregnancy/Baby",
    shortTitle: "Pregnancy"
  },
  {
    id: 6,
    title: "Past Pregnancies",
    shortTitle: "Past"
  },
  {
    id: 7,
    title: "Payment",
    shortTitle: "Payment"
  },
  {
    id: 8,
    title: "Client Demographics",
    shortTitle: "Demographics"
  }
];

export const getStepTitle = (stepIndex: number): string => {
  const step = STEP_CONFIG.find(s => s.id === stepIndex);
  return step ? step.title : `Step ${stepIndex + 1}`;
};

export const getStepShortTitle = (stepIndex: number): string => {
  const step = STEP_CONFIG.find(s => s.id === stepIndex);
  return step ? step.shortTitle : `${stepIndex + 1}`;
};