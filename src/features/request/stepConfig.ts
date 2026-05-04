export interface StepInfo {
  id: number;
  title: string;
  shortTitle: string; // For navigation bar on smaller screens
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
    title: "Family Members",
    shortTitle: "Family"
  },
  {
    id: 4,
    title: "Referral", 
    shortTitle: "Referral"
  },
  {
    id: 5,
    title: "Health History",
    shortTitle: "Health"
  },
  {
    id: 6,
    title: "Pregnancy/Baby",
    shortTitle: "Pregnancy"
  },
  {
    id: 7,
    title: "Past Pregnancies",
    shortTitle: "Past"
  },
  {
    id: 8,
    title: "Payment",
    shortTitle: "Payment"
  },
  {
    id: 9,
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