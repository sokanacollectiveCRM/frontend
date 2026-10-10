import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/common/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/components/ui/popover';
import { STEP_CONFIG } from '@/features/intake/domain/stepConfig';
import formStyles from '@/features/intake/RequestForm.module.scss';
import headerStyles from '@/features/intake/components/StepHeader.module.scss';
import navStyles from '@/features/intake/components/StepNavigation.module.scss';

import {
  IntakeCatalogField,
  IntakeDefinition,
  IntakeQuestion,
  isQuestionShown,
  questionFillsRow,
  questionOptions,
  questionWidget,
} from './types';

type Answers = Record<string, unknown>;

function visibleSteps(definition: IntakeDefinition): IntakeDefinition['steps'] {
  return definition.steps
    .map((step) => ({
      ...step,
      questions: step.questions.filter((question) => question.hidden !== true),
    }))
    .filter((step) => step.questions.length > 0);
}

function buildSchema(
  definition: IntakeDefinition,
  catalog: IntakeCatalogField[]
) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const step of visibleSteps(definition)) {
    for (const question of step.questions) {
      const widget = questionWidget(question, catalog);
      let field: z.ZodTypeAny;
      if (widget === 'multi_select') {
        field = z.array(z.string());
        if (question.required) {
          field = (field as z.ZodArray<z.ZodString>).min(
            1,
            `${question.label} is required.`
          );
        }
      } else if (widget === 'yes_no' || widget === 'boolean') {
        field = question.required
          ? z.boolean({ message: `${question.label} is required.` })
          : z.boolean().optional();
      } else if (widget === 'number') {
        field = z.string();
        if (question.required) {
          field = (field as z.ZodString).min(
            1,
            `${question.label} is required.`
          );
        }
      } else {
        field = z.string();
        if (
          question.required ||
          question.key === 'firstname' ||
          question.key === 'lastname'
        ) {
          field = (field as z.ZodString).min(
            1,
            `${question.label} is required.`
          );
        }
      }
      shape[question.key] = field;
    }
  }
  return z.object(shape);
}

function emptyValue(widget: string): unknown {
  if (widget === 'multi_select') return [];
  if (widget === 'yes_no' || widget === 'boolean') return undefined;
  return '';
}

export function DynamicIntakeForm({
  definition,
  catalog,
  mode,
  submitLabel,
  submitDisabled = false,
  uploadImage,
  onSubmit,
}: {
  definition: IntakeDefinition;
  catalog: IntakeCatalogField[];
  mode: 'public' | 'test' | 'preview';
  submitLabel: string;
  submitDisabled?: boolean;
  uploadImage?: (file: File) => Promise<string>;
  onSubmit: (answers: Answers) => Promise<void>;
}) {
  const schema = useMemo(
    () => buildSchema(definition, catalog),
    [definition, catalog]
  );
  const steps = useMemo(() => visibleSteps(definition), [definition]);
  const defaults = useMemo(() => {
    const values: Answers = {};
    for (const step of steps) {
      for (const question of step.questions) {
        values[question.key] = emptyValue(questionWidget(question, catalog));
      }
    }
    return values;
  }, [steps, catalog]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const step = steps[stepIndex];
  const last = stepIndex === steps.length - 1;
  const answers = form.watch();
  const allQuestions = useMemo(
    () => definition.steps.flatMap((item) => item.questions),
    [definition]
  );
  const shownQuestions = step
    ? step.questions.filter((question) =>
        isQuestionShown(question, allQuestions, answers)
      )
    : [];

  async function next() {
    const names = shownQuestions.map((question) => question.key);
    const valid = await form.trigger(names);
    if (!valid) return;
    if (!last) {
      setStepIndex((current) => current + 1);
      return;
    }
    setFormError(null);
    try {
      const values = form.getValues();
      const shownKeys = new Set(
        allQuestions
          .filter((question) => isQuestionShown(question, allQuestions, values))
          .map((question) => question.key)
      );
      const submitted = Object.fromEntries(
        Object.entries(values).filter(([key]) => shownKeys.has(key))
      );
      await onSubmit(submitted);
      form.reset(defaults);
      setStepIndex(0);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Submission failed.'
      );
    }
  }

  if (!step) {
    return <p>This form has no steps yet.</p>;
  }

  return (
    <div className={formStyles.requestForm}>
      {mode === 'preview' ? (
        <p
          style={{
            background: '#f4f7f8',
            border: '1px solid #d5dee3',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 16,
          }}
        >
          This is a preview of the form a client would fill out. Submitting does
          not send a request.
        </p>
      ) : null}
      {mode === 'test' ? (
        <p
          style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 16,
          }}
        >
          This submission is a test. It is saved separately from real requests.
        </p>
      ) : null}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '100%',
            height: 4,
            background: '#e0e0e0',
            borderRadius: 2,
            margin: '0 0 1.5rem 0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${((stepIndex + 1) / steps.length) * 100}%`,
              height: '100%',
              background: 'var(--intake-accent, #00bcd4)',
              transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          />
        </div>
        <PublishedStepNav
          steps={steps}
          current={stepIndex}
          onSelect={(index) => setStepIndex(index)}
        />
      </div>
      <div className={headerStyles.stepHeader}>
        <div className={headerStyles.stepTitleContainer}>
          <h2 className={headerStyles.stepTitle}>{step.title}</h2>
          <span className={headerStyles.stepProgress}>
            Step {stepIndex + 1} of {steps.length}
          </span>
        </div>
      </div>
      <div className={formStyles['form-grid']}>
        {shownQuestions.map((question) => (
          <QuestionField
            key={question.key}
            question={question}
            widget={questionWidget(question, catalog)}
            options={questionOptions(question, catalog)}
            uploadImage={uploadImage}
            value={form.watch(question.key)}
            error={
              form.formState.errors[question.key]?.message as string | undefined
            }
            onChange={(value) =>
              form.setValue(question.key, value, { shouldValidate: true })
            }
          />
        ))}
      </div>
      {formError ? (
        <p style={{ color: '#b91c1c', marginTop: 16 }}>{formError}</p>
      ) : null}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        {stepIndex > 0 ? (
          <Button
            type='button'
            variant='outline'
            onClick={() => setStepIndex((n) => n - 1)}
          >
            Back
          </Button>
        ) : null}
        <Button
          type='button'
          onClick={() => void next()}
          disabled={form.formState.isSubmitting || submitDisabled}
        >
          {last ? submitLabel : 'Next'}
        </Button>
      </div>
    </div>
  );
}

function stepRailLabel(title: string, compact: boolean): string {
  const known = STEP_CONFIG.find((step) => step.title === title);
  if (known)
    return compact ? known.shortTitle : (known.navTitle ?? known.title);
  const first = title.split('/')[0]?.trim() || title;
  return first.length > 22 ? `${first.slice(0, 20)}…` : first;
}

function PublishedStepNav({
  steps,
  current,
  onSelect,
}: {
  steps: { id: string; title: string }[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 600px)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 600px)');
    const onChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);
    mql.addEventListener('change', onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const statusOf = (index: number) =>
    index < current ? 'completed' : index === current ? 'current' : 'upcoming';

  if (isDesktop) {
    return (
      <nav
        className={navStyles.desktopNavigation}
        aria-label='Form step navigation'
      >
        <div
          className={navStyles.stepsContainer}
          style={{
            gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
          }}
        >
          {steps.map((step, index) => {
            const status = statusOf(index);
            const canNavigate = index <= current;
            return (
              <div key={step.id} className={navStyles.stepItem}>
                <button
                  type='button'
                  onClick={() => onSelect(index)}
                  disabled={!canNavigate}
                  className={`${navStyles.stepButton} ${navStyles[`step-${status}`]}`}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  <span className={navStyles.stepNumber}>{index + 1}</span>
                  <span className={navStyles.stepTitle}>
                    {stepRailLabel(step.title, false)}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={navStyles.mobileNavigation}
      aria-label='Form step navigation'
    >
      <div className={navStyles.mobileStepsContainer}>
        {steps.map((step, index) => {
          const status = statusOf(index);
          const canNavigate = index <= current;
          return (
            <button
              key={step.id}
              type='button'
              onClick={() => onSelect(index)}
              disabled={!canNavigate}
              className={`${navStyles.mobileStepButton} ${navStyles[`step-${status}`]}`}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <span className={navStyles.mobileStepNumber}>{index + 1}</span>
              <span className={navStyles.mobileStepTitle}>
                {stepRailLabel(step.title, true)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function QuestionField({
  question,
  widget,
  options,
  uploadImage,
  value,
  error,
  onChange,
}: {
  question: IntakeQuestion;
  widget: string;
  options: string[];
  uploadImage?: (file: File) => Promise<string>;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const label = `${question.label}${question.required ? ' *' : ''}`;
  const full = questionFillsRow(question, widget);
  return (
    <div
      className={`${formStyles['form-field']} ${formStyles['form-field-label-above']} ${
        full ? formStyles.oneColumn : formStyles.twoColumn
      }`}
    >
      <label className={formStyles['form-floating-label']}>{label}</label>
      {question.helpText ? (
        <span style={{ color: '#757575', fontSize: 14 }}>
          {question.helpText}
        </span>
      ) : null}
      <Control
        widget={widget}
        groupName={question.key}
        placeholder={question.placeholder || ''}
        options={options}
        uploadImage={uploadImage}
        value={value}
        onChange={onChange}
      />
      {error ? (
        <span style={{ color: '#d32f2f', fontSize: 14 }}>{error}</span>
      ) : null}
    </div>
  );
}

function MultiSelectControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value.map(String) : [];
  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option]
    );
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={`${formStyles['form-input']} ${formStyles['form-option-trigger-text']}`}
          style={{
            textAlign: 'left',
            minHeight: 40,
            cursor: 'pointer',
            background: '#fff',
          }}
        >
          <span>{selected.length > 0 ? selected.join(', ') : 'Select'}</span>
          <span style={{ float: 'right', marginLeft: 8 }}>▼</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        side='bottom'
        sideOffset={4}
        className={formStyles['services-popover']}
        style={{
          width: 'min(420px, calc(100vw - 32px))',
          background: '#fff',
          border: '1px solid #bdbdbd',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '8px 0',
          zIndex: 10,
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
        >
          {options.map((option) => (
            <label
              key={option}
              className={formStyles['form-option-label']}
              style={{
                display: 'flex',
                width: '100%',
                padding: '10px 14px',
                boxSizing: 'border-box',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <input
                type='checkbox'
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                style={{ width: 20, height: 20, margin: 0 }}
              />
              <span className={formStyles['form-option-box']}>{option}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Control({
  widget,
  groupName,
  placeholder,
  options,
  uploadImage,
  value,
  onChange,
}: {
  widget: string;
  groupName: string;
  placeholder: string;
  options: string[];
  uploadImage?: (file: File) => Promise<string>;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (widget === 'long_text') {
    return (
      <textarea
        value={typeof value === 'string' ? value : ''}
        placeholder={placeholder || undefined}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        style={{
          display: 'block',
          width: '100%',
          minHeight: 120,
          marginTop: 8,
          padding: '12px 14px',
          border: '1px solid #757575',
          borderRadius: 6,
          background: '#fff',
          color: 'rgba(0,0,0,0.87)',
          fontSize: 16,
          lineHeight: 1.4,
          fontFamily: 'Roboto, Arial, sans-serif',
          boxSizing: 'border-box',
          resize: 'vertical',
        }}
      />
    );
  }
  if (widget === 'yes_no' || widget === 'boolean') {
    return (
      <select
        className={formStyles['form-select']}
        value={value === true ? 'yes' : value === false ? 'no' : ''}
        onChange={(event) =>
          onChange(
            event.target.value === '' ? undefined : event.target.value === 'yes'
          )
        }
      >
        <option value=''>{placeholder || 'Select'}</option>
        <option value='yes'>Yes</option>
        <option value='no'>No</option>
      </select>
    );
  }
  if (widget === 'radio') {
    return (
      <div className={formStyles['form-option-list']}>
        {options.map((option) => (
          <label key={option} className={formStyles['form-option-label']}>
            <input
              type='radio'
              name={groupName}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
    );
  }
  if (widget === 'image') {
    return (
      <span style={{ display: 'grid', gap: 6 }}>
        <input
          type='file'
          accept='image/png,image/jpeg,image/webp'
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file || !uploadImage) return;
            if (file.size > 5 * 1024 * 1024) {
              onChange('');
              return;
            }
            void uploadImage(file)
              .then((assetId) => onChange(assetId))
              .catch(() => onChange(''));
          }}
        />
        <span style={{ color: '#555', fontSize: 14 }}>
          PNG, JPEG, or WebP. 5 MB or smaller.
          {typeof value === 'string' && value ? ' Image uploaded.' : ''}
        </span>
      </span>
    );
  }
  if (widget === 'single_select') {
    return (
      <select
        className={formStyles['form-select']}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value=''>{placeholder || 'Select'}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  if (widget === 'multi_select') {
    return (
      <MultiSelectControl options={options} value={value} onChange={onChange} />
    );
  }
  const inputType =
    widget === 'email'
      ? 'email'
      : widget === 'phone'
        ? 'tel'
        : widget === 'number'
          ? 'number'
          : widget === 'date'
            ? 'date'
            : 'text';
  return (
    <input
      className={formStyles['form-input']}
      type={inputType}
      placeholder={placeholder || undefined}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
