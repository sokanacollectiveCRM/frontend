import { useEffect, useState } from 'react';

import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import formStyles from '@/features/intake/RequestForm.module.scss';

import {
  CUSTOM_FIELD_LABELS,
  CustomFieldType,
  IntakeCatalogField,
  IntakeQuestion,
  IntakeStep,
  MAX_INTAKE_IMAGE_QUESTIONS,
  SIMPLE_CUSTOM_FIELD_TYPES,
  describeShowWhen,
  inputTypeLabel,
  questionFillsRow,
  questionOptions,
  questionWidget,
} from './types';

export function IntakeFormBuilder({
  step,
  catalog,
  lockedKeys,
  imageCount,
  remainingStandard,
  canHideQuestionKey,
  canRemoveQuestionKey,
  onChangeQuestion,
  onMoveQuestion,
  onRemoveQuestion,
  onAddStandard,
  onAddCustom,
}: {
  step: IntakeStep;
  catalog: IntakeCatalogField[];
  lockedKeys: string[];
  imageCount: number;
  remainingStandard: IntakeCatalogField[];
  canHideQuestionKey: (key: string) => boolean;
  canRemoveQuestionKey: (key: string) => boolean;
  onChangeQuestion: (question: IntakeQuestion) => void;
  onMoveQuestion: (key: string, direction: number) => void;
  onRemoveQuestion: (key: string) => void;
  onAddStandard: (key: string) => void;
  onAddCustom: (type: CustomFieldType) => void;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(
    step.questions[0]?.key ?? null
  );
  const [addKey, setAddKey] = useState('');
  const [customType, setCustomType] = useState<CustomFieldType>('short_text');
  const [selectLast, setSelectLast] = useState(false);

  useEffect(() => {
    if (selectLast) {
      setSelectedKey(step.questions[step.questions.length - 1]?.key ?? null);
      setSelectLast(false);
      return;
    }
    setSelectedKey((current) => {
      if (
        current &&
        step.questions.some((question) => question.key === current)
      )
        return current;
      return step.questions[0]?.key ?? null;
    });
  }, [step.id, step.questions, selectLast]);

  const selected =
    step.questions.find((question) => question.key === selectedKey) ?? null;

  return (
    <div className='intake-builder'>
      <style>{`
        .intake-builder {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .intake-builder { grid-template-columns: 1fr; }
        }
      `}</style>
      <section
        className={`${formStyles.requestForm} ${formStyles.intakeEditorCanvas}`}
        style={{
          margin: 0,
          maxWidth: 'none',
          padding: 16,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 22 }}>{step.title}</h2>
        {step.questions.length === 0 ? (
          <p>
            This step has no questions yet. Add one from the panel on the right.
          </p>
        ) : (
          <div className={formStyles['form-grid']} style={{ marginBottom: 0 }}>
            {step.questions.map((question) => (
              <FieldPreview
                key={question.key}
                question={question}
                widget={questionWidget(question, catalog)}
                options={questionOptions(question, catalog)}
                selected={question.key === selected?.key}
                onSelect={() => setSelectedKey(question.key)}
              />
            ))}
          </div>
        )}
      </section>
      <aside
        style={{
          display: 'grid',
          gap: 14,
          padding: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          background: '#fff',
          position: 'sticky',
          top: 16,
        }}
      >
        {selected ? (
          <FieldInspector
            question={selected}
            stepQuestions={step.questions}
            catalog={catalog}
            locked={lockedKeys.includes(selected.key)}
            canHide={canHideQuestionKey(selected.key)}
            removable={
              selected.kind === 'custom' && canRemoveQuestionKey(selected.key)
            }
            onChange={onChangeQuestion}
            onMove={(direction) => onMoveQuestion(selected.key, direction)}
            onRemove={() => onRemoveQuestion(selected.key)}
          />
        ) : (
          <p style={{ margin: 0 }}>Select a field in the preview.</p>
        )}
        <div
          style={{
            display: 'grid',
            gap: 8,
            borderTop: '1px solid #e5e7eb',
            paddingTop: 12,
          }}
        >
          <span style={{ fontWeight: 600 }}>Add a field</span>
          <select
            value={addKey}
            onChange={(event) => setAddKey(event.target.value)}
            aria-label='Standard question'
          >
            <option value=''>Standard question</option>
            {remainingStandard.map((field) => (
              <option key={field.key} value={field.key}>
                {field.defaultLabel}
              </option>
            ))}
          </select>
          <Button
            type='button'
            variant='outline'
            disabled={!addKey}
            onClick={() => {
              onAddStandard(addKey);
              setAddKey('');
              setSelectedKey(addKey);
            }}
          >
            Add standard question
          </Button>
          <select
            aria-label='Custom question type'
            value={customType}
            onChange={(event) =>
              setCustomType(event.target.value as CustomFieldType)
            }
          >
            {SIMPLE_CUSTOM_FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {CUSTOM_FIELD_LABELS[type]}
              </option>
            ))}
          </select>
          <Button
            type='button'
            variant='outline'
            disabled={
              customType === 'image' && imageCount >= MAX_INTAKE_IMAGE_QUESTIONS
            }
            onClick={() => {
              onAddCustom(customType);
              setSelectLast(true);
            }}
          >
            Add custom question
          </Button>
        </div>
      </aside>
    </div>
  );
}

function FieldPreview({
  question,
  widget,
  options,
  selected,
  onSelect,
}: {
  question: IntakeQuestion;
  widget: string;
  options: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  const full = questionFillsRow(question, widget);
  const placeholder = question.placeholder || '';
  return (
    <div
      role='button'
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Edit ${question.label}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`${formStyles['form-field']} ${formStyles['form-field-label-above']} ${
        full ? formStyles.oneColumn : formStyles.twoColumn
      }`}
      style={{
        cursor: 'pointer',
        borderRadius: 10,
        padding: 8,
        outline: selected ? '2px solid #0f6e56' : '1px solid transparent',
        background: selected ? '#f3faf7' : 'transparent',
        opacity: question.hidden ? 0.55 : 1,
      }}
    >
      <label className={formStyles['form-floating-label']}>
        {question.label}
        {question.required ? ' *' : ''}
        {question.hidden ? ' (hidden)' : ''}
      </label>
      {question.helpText ? (
        <span style={{ color: '#757575', fontSize: 14 }}>
          {question.helpText}
        </span>
      ) : null}
      <PreviewControl
        widget={widget}
        placeholder={placeholder}
        options={options}
      />
    </div>
  );
}

function PreviewControl({
  widget,
  placeholder,
  options,
}: {
  widget: string;
  placeholder: string;
  options: string[];
}) {
  const shared = { pointerEvents: 'none' as const, width: '100%' };
  if (widget === 'long_text') {
    return (
      <textarea
        readOnly
        rows={4}
        placeholder={placeholder || undefined}
        className={formStyles['form-input']}
        style={shared}
      />
    );
  }
  if (widget === 'radio') {
    return (
      <div className={formStyles['form-option-list']} style={shared}>
        {options.map((option) => (
          <label key={option} className={formStyles['form-option-label']}>
            <input type='radio' readOnly />
            {option}
          </label>
        ))}
      </div>
    );
  }
  if (
    widget === 'yes_no' ||
    widget === 'boolean' ||
    widget === 'single_select' ||
    widget === 'multi_select'
  ) {
    return (
      <select
        className={formStyles['form-select']}
        disabled
        style={shared}
        defaultValue=''
      >
        <option value=''>{placeholder || 'Select'}</option>
        {widget === 'yes_no' || widget === 'boolean' ? (
          <>
            <option>Yes</option>
            <option>No</option>
          </>
        ) : (
          options.map((option) => <option key={option}>{option}</option>)
        )}
      </select>
    );
  }
  if (widget === 'image') {
    return <input type='file' disabled style={shared} />;
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
      readOnly
      placeholder={placeholder || undefined}
      style={shared}
    />
  );
}

function FieldInspector({
  question,
  stepQuestions,
  catalog,
  locked,
  canHide,
  removable,
  onChange,
  onMove,
  onRemove,
}: {
  question: IntakeQuestion;
  stepQuestions: IntakeQuestion[];
  catalog: IntakeCatalogField[];
  locked: boolean;
  canHide: boolean;
  removable: boolean;
  onChange: (question: IntakeQuestion) => void;
  onMove: (direction: number) => void;
  onRemove: () => void;
}) {
  const widget = questionWidget(question, catalog);
  const catalogField = catalog.find((field) => field.key === question.key);
  const columnValue =
    question.columns === 1 || question.columns === 2
      ? String(question.columns)
      : questionFillsRow(question, widget)
        ? '1'
        : '2';
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {question.showWhen ? (
        <p style={{ margin: 0, color: '#0f6e56', fontSize: 13 }}>
          {describeShowWhen(question.showWhen, stepQuestions)}
        </p>
      ) : null}
      <label style={{ display: 'grid', gap: 6 }}>
        Label
        <Input
          value={question.label}
          aria-label='Question label'
          onChange={(event) =>
            onChange({ ...question, label: event.target.value })
          }
        />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        Type of input
        {question.kind === 'standard' ? (
          <select aria-label='Type of input' value={widget} disabled>
            <option value={widget}>{inputTypeLabel(widget)}</option>
          </select>
        ) : (
          <select
            aria-label='Type of input'
            value={question.type}
            disabled={locked}
            onChange={(event) => {
              const type = event.target.value as CustomFieldType;
              const needsChoices =
                type === 'single_select' ||
                type === 'radio' ||
                type === 'multi_select';
              onChange({
                ...question,
                type,
                options: needsChoices
                  ? question.options.length
                    ? question.options
                    : ['Choice 1', 'Choice 2']
                  : [],
              });
            }}
          >
            {[
              ...SIMPLE_CUSTOM_FIELD_TYPES,
              ...((SIMPLE_CUSTOM_FIELD_TYPES as readonly string[]).includes(
                question.type
              )
                ? []
                : [question.type]),
            ].map((type) => (
              <option key={type} value={type}>
                {CUSTOM_FIELD_LABELS[type]}
              </option>
            ))}
          </select>
        )}
        {question.kind === 'standard' ? (
          <span style={{ color: '#667085', fontSize: 13 }}>
            This answer type stays fixed.
          </span>
        ) : null}
        {locked ? (
          <span style={{ color: '#667085', fontSize: 13 }}>
            The answer type is locked because this organization already has
            answers.
          </span>
        ) : null}
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        Placeholder text
        <Input
          value={question.placeholder ?? ''}
          aria-label='Placeholder text'
          placeholder='Shown inside an empty field'
          onChange={(event) =>
            onChange({ ...question, placeholder: event.target.value || null })
          }
        />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        Layout
        <select
          aria-label='Column layout'
          value={columnValue}
          onChange={(event) =>
            onChange({
              ...question,
              columns: event.target.value === '1' ? 1 : 2,
            })
          }
        >
          <option value='1'>One column</option>
          <option value='2'>Two columns</option>
        </select>
      </label>
      <Input
        value={question.helpText ?? ''}
        aria-label='Help text'
        placeholder='Help text'
        onChange={(event) =>
          onChange({ ...question, helpText: event.target.value || null })
        }
      />
      <div style={{ display: 'flex', gap: 16 }}>
        <label style={{ display: 'flex', gap: 8 }}>
          <input
            type='checkbox'
            checked={question.hidden !== true}
            disabled={!canHide && question.hidden !== true}
            onChange={(event) =>
              onChange({
                ...question,
                hidden: event.target.checked ? undefined : true,
              })
            }
          />
          Shown
        </label>
        <label style={{ display: 'flex', gap: 8 }}>
          <input
            type='checkbox'
            checked={question.required}
            onChange={(event) =>
              onChange({ ...question, required: event.target.checked })
            }
          />
          Required
        </label>
      </div>
      {question.kind === 'standard' &&
      catalogField?.options &&
      catalogField.options.length > 0 ? (
        <ChoicesEditor
          choices={question.options ?? [...catalogField.options]}
          onChange={(options) => onChange({ ...question, options })}
        />
      ) : null}
      {question.kind === 'custom' ? (
        <ShowWhenEditor
          question={question}
          otherQuestions={stepQuestions.filter(
            (item) => item.key !== question.key
          )}
          catalog={catalog}
          onChange={onChange}
        />
      ) : null}
      {question.kind === 'custom' &&
      (question.type === 'single_select' ||
        question.type === 'multi_select' ||
        question.type === 'radio') ? (
        <ChoicesEditor
          choices={question.options}
          onChange={(options) => onChange({ ...question, options })}
        />
      ) : null}
      {question.kind === 'custom' && question.type === 'image' ? (
        <p style={{ margin: 0, color: '#667085', fontSize: 13 }}>
          PNG, JPEG, or WebP. 5 MB or smaller. A form can show 3 image
          questions.
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type='button' variant='outline' onClick={() => onMove(-1)}>
          Up
        </Button>
        <Button type='button' variant='outline' onClick={() => onMove(1)}>
          Down
        </Button>
        {removable ? (
          <Button type='button' variant='outline' onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ChoicesEditor({
  choices,
  onChange,
}: {
  choices: string[];
  onChange: (choices: string[]) => void;
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <span style={{ fontWeight: 600 }}>Choices</span>
      {choices.map((choice, index) => (
        <div key={index} style={{ display: 'flex', gap: 8 }}>
          <Input
            value={choice}
            aria-label={`Choice ${index + 1}`}
            onChange={(event) => {
              const next = choices.slice();
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button
            type='button'
            variant='outline'
            onClick={() =>
              onChange(choices.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        onClick={() => onChange([...choices, ''])}
      >
        Add choice
      </Button>
    </div>
  );
}

function isYesNoQuestion(
  question: IntakeQuestion,
  catalog: IntakeCatalogField[]
): boolean {
  if (question.kind === 'custom') return question.type === 'yes_no';
  const storage = catalog.find(
    (field) => field.key === question.key
  )?.storageType;
  return storage === 'boolean' || storage === 'yes_no';
}

function ShowWhenEditor({
  question,
  otherQuestions,
  catalog,
  onChange,
}: {
  question: IntakeQuestion;
  otherQuestions: IntakeQuestion[];
  catalog: IntakeCatalogField[];
  onChange: (question: IntakeQuestion) => void;
}) {
  if (question.kind !== 'custom') return null;
  const parentKey = question.showWhen?.questionKey ?? '';
  const parent = otherQuestions.find((item) => item.key === parentKey);
  const parentIsYesNo = parent ? isYesNoQuestion(parent, catalog) : false;
  const equals =
    question.showWhen?.equals === undefined
      ? ''
      : String(question.showWhen.equals);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label>
        Shown when
        <select
          aria-label='Shown when'
          value={parentKey}
          onChange={(event) => {
            const questionKey = event.target.value;
            if (!questionKey) {
              const { showWhen: _removed, ...rest } = question;
              onChange(rest);
              return;
            }
            const nextParent = otherQuestions.find(
              (item) => item.key === questionKey
            );
            const yesNo = nextParent
              ? isYesNoQuestion(nextParent, catalog)
              : false;
            onChange({
              ...question,
              showWhen: {
                questionKey,
                equals: yesNo
                  ? true
                  : equals && equals !== 'true' && equals !== 'false'
                    ? equals
                    : 'Yes',
              },
            });
          }}
        >
          <option value=''>Always</option>
          {otherQuestions.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {parentKey && parentIsYesNo ? (
        <select
          aria-label='Matching answer'
          value={question.showWhen?.equals === false ? 'no' : 'yes'}
          onChange={(event) =>
            onChange({
              ...question,
              showWhen: {
                questionKey: parentKey,
                equals: event.target.value === 'yes',
              },
            })
          }
        >
          <option value='yes'>Yes</option>
          <option value='no'>No</option>
        </select>
      ) : null}
      {parentKey && !parentIsYesNo ? (
        <Input
          aria-label='Matching answer'
          placeholder='Matching answer'
          value={equals}
          onChange={(event) => {
            const value = event.target.value;
            if (!value.trim()) {
              const { showWhen: _removed, ...rest } = question;
              onChange(rest);
              return;
            }
            onChange({
              ...question,
              showWhen: { questionKey: parentKey, equals: value },
            });
          }}
        />
      ) : null}
    </div>
  );
}
