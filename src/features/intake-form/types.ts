export const CUSTOM_FIELD_TYPES = [
  'short_text',
  'long_text',
  'number',
  'date',
  'email',
  'phone',
  'yes_no',
  'single_select',
  'multi_select',
  'radio',
  'image',
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

/** The types an admin can add. Text, number, image, dropdown, and radio. */
export const SIMPLE_CUSTOM_FIELD_TYPES = [
  'short_text',
  'number',
  'image',
  'single_select',
  'radio',
] as const;

export const MAX_INTAKE_IMAGE_QUESTIONS = 3;

export const CUSTOM_FIELD_LABELS: Record<CustomFieldType, string> = {
  short_text: 'Text',
  long_text: 'Long text',
  number: 'Number',
  date: 'Date',
  email: 'Email',
  phone: 'Phone',
  yes_no: 'Yes/no',
  single_select: 'Dropdown',
  multi_select: 'Multi-select',
  radio: 'Radio',
  image: 'Image',
};

export type QuestionShowWhen = {
  questionKey: string;
  equals?: string | boolean;
  includes?: string;
  oneOf?: string[];
};

export type IntakeColumns = 1 | 2;

export type StandardQuestion = {
  kind: 'standard';
  key: string;
  label: string;
  required: boolean;
  helpText: string | null;
  hidden?: boolean;
  options?: string[];
  showWhen?: QuestionShowWhen;
  placeholder?: string | null;
  columns?: IntakeColumns;
};

export type CustomQuestion = {
  kind: 'custom';
  key: string;
  label: string;
  required: boolean;
  helpText: string | null;
  type: CustomFieldType;
  options: string[];
  hidden?: boolean;
  showWhen?: QuestionShowWhen;
  placeholder?: string | null;
  columns?: IntakeColumns;
};

export type IntakeQuestion = StandardQuestion | CustomQuestion;

export type IntakeStep = {
  id: string;
  title: string;
  questions: IntakeQuestion[];
};

export type IntakeDefinition = {
  logoAssetId: string | null;
  steps: IntakeStep[];
};

export type IntakeCatalogField = {
  key: string;
  storageType: string;
  defaultLabel: string;
  identity: 'name' | 'contact' | null;
  options: string[] | null;
};

export type IntakeEditorTenant = {
  id: string;
  slug: string;
  name: string;
  intakeEnabled: boolean;
};

export type IntakeEditorState = {
  platformSupport: boolean;
  needsTenant: false;
  tenant: IntakeEditorTenant;
  draft: IntakeDefinition;
  baseVersion: number | null;
  liveVersion: number | null;
  draftDiffersFromLive: boolean;
  updatedAt: string | null;
  logoUrl: string | null;
  liveLogoUrl: string | null;
  lockedCustomKeys: string[];
  catalog: IntakeCatalogField[];
};

export type IntakeOrgPicker = {
  platformSupport: true;
  needsTenant: true;
  tenants: Array<{ id: string; slug: string; name: string }>;
};

export type PublishedIntakeForm = {
  version: number;
  definition: IntakeDefinition;
  logoUrl: string | null;
  catalog: IntakeCatalogField[];
};

export function isOrgPicker(
  value: IntakeEditorState | IntakeOrgPicker
): value is IntakeOrgPicker {
  return value.needsTenant === true;
}

const NAME_KEYS = new Set(['firstname', 'lastname']);
const CONTACT_KEYS = new Set(['email', 'phone_number']);

export function canHideQuestion(
  definition: IntakeDefinition,
  key: string
): boolean {
  if (NAME_KEYS.has(key)) return false;
  if (CONTACT_KEYS.has(key)) {
    const visible = definition.steps
      .flatMap((step) => step.questions)
      .filter((question) => CONTACT_KEYS.has(question.key) && question.hidden !== true);
    return visible.length > 1 || !visible.some((question) => question.key === key);
  }
  return true;
}

export function imageQuestionCount(definition: IntakeDefinition): number {
  return definition.steps
    .flatMap((step) => step.questions)
    .filter(
      (question) =>
        question.hidden !== true &&
        question.kind === 'custom' &&
        question.type === 'image'
    ).length;
}

export function canRemoveQuestion(
  definition: IntakeDefinition,
  key: string
): boolean {
  if (NAME_KEYS.has(key)) return false;
  if (CONTACT_KEYS.has(key)) {
    const present = definition.steps
      .flatMap((step) => step.questions)
      .filter((question) => CONTACT_KEYS.has(question.key));
    return present.length > 1;
  }
  return true;
}

export function newCustomKey(): string {
  return `custom_${Math.random().toString(36).slice(2, 10)}`;
}

export function newStepId(): string {
  return `step_${Math.random().toString(36).slice(2, 10)}`;
}

export function answerMatchesShowWhen(
  showWhen: QuestionShowWhen,
  answers: Record<string, unknown>
): boolean {
  const value = answers[showWhen.questionKey];
  if (showWhen.equals !== undefined) {
    if (showWhen.equals === true) return value === true || value === 'true' || value === 'yes';
    if (showWhen.equals === false) return value === false || value === 'false' || value === 'no';
    return value === showWhen.equals;
  }
  if (showWhen.includes) {
    if (Array.isArray(value)) return value.map(String).includes(showWhen.includes);
    return typeof value === 'string' && value.includes(showWhen.includes);
  }
  if (showWhen.oneOf && showWhen.oneOf.length > 0) {
    return typeof value === 'string' && showWhen.oneOf.includes(value);
  }
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}

export function isQuestionShown(
  question: IntakeQuestion,
  questions: IntakeQuestion[],
  answers: Record<string, unknown>,
  seen: Set<string> = new Set()
): boolean {
  if (question.hidden === true) return false;
  const rule = question.showWhen;
  if (!rule) return true;
  if (seen.has(question.key)) return false;
  const parent = questions.find((item) => item.key === rule.questionKey);
  if (parent) {
    const nextSeen = new Set(seen);
    nextSeen.add(question.key);
    if (!isQuestionShown(parent, questions, answers, nextSeen)) return false;
  }
  return answerMatchesShowWhen(rule, answers);
}

export function questionWidget(
  question: IntakeQuestion,
  catalog: IntakeCatalogField[]
): string {
  if (question.kind === 'custom') return question.type;
  return catalog.find((field) => field.key === question.key)?.storageType ?? 'text';
}

export function questionOptions(
  question: IntakeQuestion,
  catalog: IntakeCatalogField[]
): string[] {
  if (question.kind === 'custom') return question.options;
  if (question.options && question.options.length > 0) return question.options;
  return catalog.find((field) => field.key === question.key)?.options ?? [];
}

const FULL_ROW_WIDGETS = new Set(['multi_select', 'long_text', 'radio', 'image']);

/** One column fills the row. Two columns share the row. */
export function questionFillsRow(question: IntakeQuestion, widget: string): boolean {
  if (question.columns === 1) return true;
  if (question.columns === 2) return false;
  return FULL_ROW_WIDGETS.has(widget);
}

export function inputTypeLabel(widget: string): string {
  if (widget === 'text' || widget === 'short_text') return 'Text';
  if (widget === 'long_text') return 'Long text';
  if (widget === 'boolean' || widget === 'yes_no') return 'Yes/no';
  if (widget === 'single_select') return 'Dropdown';
  if (widget === 'multi_select') return 'Dropdown';
  if (widget === 'email') return 'Email';
  if (widget === 'phone') return 'Phone';
  if (widget === 'number') return 'Number';
  if (widget === 'date') return 'Date';
  if (widget === 'radio') return 'Radio';
  if (widget === 'image') return 'Image';
  return widget.replace(/_/g, ' ');
}

export function describeShowWhen(
  showWhen: QuestionShowWhen,
  questions: IntakeQuestion[]
): string {
  const parent = questions.find((question) => question.key === showWhen.questionKey);
  const name = parent?.label || 'another answer';
  if (showWhen.equals === true) return `Shown when “${name}” is yes`;
  if (showWhen.equals === false) return `Shown when “${name}” is no`;
  if (typeof showWhen.equals === 'string') return `Shown when “${name}” is ${showWhen.equals}`;
  if (showWhen.includes) return `Shown when “${name}” includes ${showWhen.includes}`;
  if (showWhen.oneOf && showWhen.oneOf.length > 0) {
    return `Shown when “${name}” is ${showWhen.oneOf.join(' or ')}`;
  }
  return `Shown when “${name}” is answered`;
}
