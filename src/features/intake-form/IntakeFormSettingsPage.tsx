import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';

import {
  discardIntakeDraft,
  getIntakeDraft,
  listIntakeVersions,
  publishIntakeDraft,
  removeIntakeLogo,
  restoreIntakeVersion,
  saveIntakeDraft,
  submitIntakeTest,
  uploadIntakeAnswerImage,
  uploadIntakeLogo,
} from './api';
import { DynamicIntakeForm } from './DynamicIntakeForm';
import { IntakeFormBuilder } from './IntakeFormBuilder';
import { IntakeShareCard } from './ShareCard';
import { saveIntakeClientPreview } from './previewSession';
import {
  IntakeDefinition,
  IntakeEditorState,
  IntakeQuestion,
  canHideQuestion,
  canRemoveQuestion,
  imageQuestionCount,
  isOrgPicker,
  newCustomKey,
  newStepId,
} from './types';

export function IntakeFormSettingsPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<
    Array<{ id: string; slug: string; name: string }>
  >([]);
  const [state, setState] = useState<IntakeEditorState | null>(null);
  const [draft, setDraft] = useState<IntakeDefinition | null>(null);
  const [versions, setVersions] = useState<
    Array<{ version: number; publishedBy: string | null; publishedAt: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testWait, setTestWait] = useState<number | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function load(nextTenantId: string | null) {
    setError(null);
    const body = await getIntakeDraft(nextTenantId);
    if (isOrgPicker(body)) {
      setOrgs(body.tenants);
      setState(null);
      setDraft(null);
      return;
    }
    setState(body);
    setDraft(body.draft);
    setVersions(await listIntakeVersions(body.tenant.id));
  }

  useEffect(() => {
    void load(tenantId).catch((loadError: unknown) => {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load the form.'
      );
    });
  }, [tenantId]);

  const usedKeys = useMemo(
    () =>
      new Set(
        draft?.steps.flatMap((step) => step.questions.map((q) => q.key)) ?? []
      ),
    [draft]
  );
  const remainingStandard =
    state?.catalog.filter((field) => !usedKeys.has(field.key)) ?? [];

  function updateDraft(next: IntakeDefinition) {
    setDraft(next);
  }

  async function onSave(event?: FormEvent) {
    event?.preventDefault();
    if (!draft || !state) return;
    setBusy(true);
    setError(null);
    try {
      const saved = await saveIntakeDraft(draft, state.tenant.id);
      setState(saved);
      setDraft(saved.draft);
      setNotice('Draft saved.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  async function onPublish() {
    if (!state || !draft) return;
    if (
      !window.confirm(
        'Publish this draft? The public form updates only after publish.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveIntakeDraft(draft, state.tenant.id);
      const published = await publishIntakeDraft(state.tenant.id);
      setState(published);
      setDraft(published.draft);
      setVersions(await listIntakeVersions(state.tenant.id));
      setNotice(`Published version ${published.publishedVersion}.`);
    } catch (publishError) {
      setError(
        publishError instanceof Error ? publishError.message : 'Publish failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDiscard() {
    if (!state) return;
    if (
      !window.confirm(
        'Discard unpublished edits and reload the live form? This does not delete published versions.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await discardIntakeDraft(state.tenant.id);
      setState(next);
      setDraft(next.draft);
      setNotice('Unpublished edits were discarded.');
    } catch (discardError) {
      setError(
        discardError instanceof Error ? discardError.message : 'Discard failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRestore(version: number) {
    if (!state) return;
    setBusy(true);
    setError(null);
    try {
      const next = await restoreIntakeVersion(version, state.tenant.id);
      setState(next);
      setDraft(next.draft);
      setNotice(
        `Version ${version} was copied into the draft. The public form stays on the live version until you publish.`
      );
    } catch (restoreError) {
      setError(
        restoreError instanceof Error ? restoreError.message : 'Restore failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (error && !state && orgs.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Intake form</h1>
        <p>{error}</p>
      </main>
    );
  }
  if (orgs.length > 0 && !state) {
    return (
      <main style={{ padding: 24, maxWidth: 640 }}>
        <h1>Intake form</h1>
        <p>Choose an organization.</p>
        <label style={{ display: 'grid', gap: 8 }}>
          Organization
          <select
            value={tenantId ?? ''}
            onChange={(event) => setTenantId(event.target.value || null)}
          >
            <option value=''>Select</option>
            {orgs.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </label>
      </main>
    );
  }

  if (!state || !draft)
    return <main style={{ padding: 24 }}>Loading intake form…</main>;

  const activeIndex = Math.max(
    0,
    draft.steps.findIndex((step) => step.id === selectedStepId)
  );
  const activeStep = draft.steps[activeIndex];

  return (
    <main style={{ padding: 24, display: 'grid', gap: 24, maxWidth: 1280 }}>
      <header>
        <h1 style={{ fontSize: 28 }}>{state.tenant.name}</h1>
        <p>
          {state.liveVersion == null
            ? 'Draft. Nothing is published yet.'
            : `Live is version ${state.liveVersion}.`}
          {state.draftDiffersFromLive
            ? ' This draft differs from the live form.'
            : ''}
        </p>
        {state.platformSupport ? (
          <label style={{ display: 'grid', gap: 6, maxWidth: 360 }}>
            Organization
            <select
              value={state.tenant.id}
              onChange={(event) => setTenantId(event.target.value)}
            >
              {(orgs.length ? orgs : [state.tenant]).map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </header>
      {notice ? <p>{notice}</p> : null}
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

      <form
        onSubmit={(event) => void onSave(event)}
        style={{ display: 'grid', gap: 20 }}
      >
        <DraftActions
          busy={busy}
          testing={testing}
          onPublish={onPublish}
          onDiscard={onDiscard}
          onPreview={openClientPreview}
          onTest={() => setTesting((open) => !open)}
        />

        <IntakeShareCard
          orgName={state.tenant.name}
          slug={state.tenant.slug}
          intakeEnabled={state.tenant.intakeEnabled}
          liveVersion={state.liveVersion}
          tenantId={state.platformSupport ? state.tenant.id : null}
        />

        <section
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <img
            src={state.logoUrl || '/sokana360-logo.png'}
            alt='Sokana360'
            style={{ height: 56, objectFit: 'contain' }}
          />
          <input
            ref={logoInputRef}
            type='file'
            accept='image/png,image/jpeg,image/webp'
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              setBusy(true);
              void uploadIntakeLogo(file, state.tenant.id)
                .then((next) => {
                  setState(next);
                  setDraft((current) =>
                    current
                      ? { ...current, logoAssetId: next.draft.logoAssetId }
                      : next.draft
                  );
                })
                .catch((logoError: unknown) =>
                  setError(
                    logoError instanceof Error
                      ? logoError.message
                      : 'Upload failed.'
                  )
                )
                .finally(() => setBusy(false));
            }}
          />
          <Button
            type='button'
            variant='outline'
            disabled={busy}
            onClick={() => logoInputRef.current?.click()}
          >
            Replace logo
          </Button>
          <Button
            type='button'
            variant='outline'
            disabled={busy || !draft.logoAssetId}
            onClick={() => {
              setBusy(true);
              void removeIntakeLogo(state.tenant.id)
                .then((next) => {
                  setState(next);
                  setDraft((current) =>
                    current
                      ? { ...current, logoAssetId: next.draft.logoAssetId }
                      : next.draft
                  );
                  setNotice(
                    'The draft logo was removed. The live form keeps its logo until you publish.'
                  );
                })
                .catch((logoError: unknown) =>
                  setError(
                    logoError instanceof Error
                      ? logoError.message
                      : 'Remove failed.'
                  )
                )
                .finally(() => setBusy(false));
            }}
          >
            Remove logo
          </Button>
        </section>

        <style>{`
          .intake-step-grid,
          .intake-question-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: 1fr;
          }
          @media (min-width: 760px) {
            .intake-step-grid,
            .intake-question-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
        `}</style>
        <div className='intake-step-grid'>
          {draft.steps.map((step, stepIndex) => {
            const shownCount = step.questions.filter(
              (question) => question.hidden !== true
            ).length;
            const selected = step.id === activeStep?.id;
            return (
              <button
                key={step.id}
                type='button'
                onClick={() => setSelectedStepId(step.id)}
                style={{
                  textAlign: 'left',
                  minHeight: 108,
                  padding: 14,
                  borderRadius: 12,
                  border: selected ? '2px solid #0f6e56' : '1px solid #e5e7eb',
                  background: selected ? '#f3faf7' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{ display: 'block', fontSize: 12, color: '#667085' }}
                >
                  Step {stepIndex + 1}
                </span>
                <span
                  style={{ display: 'block', fontWeight: 600, marginTop: 4 }}
                >
                  {step.title}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#667085',
                    marginTop: 8,
                  }}
                >
                  {shownCount} shown
                </span>
              </button>
            );
          })}
          <button
            type='button'
            onClick={() => {
              const id = newStepId();
              updateDraft({
                ...draft,
                steps: [
                  ...draft.steps,
                  { id, title: 'New step', questions: [] },
                ],
              });
              setSelectedStepId(id);
            }}
            style={{
              minHeight: 108,
              borderRadius: 12,
              border: '1px dashed #9ca3af',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Add step
          </button>
        </div>

        {activeStep ? (
          <section
            style={{
              display: 'grid',
              gap: 16,
              padding: 16,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fff',
            }}
          >
            <Input
              value={activeStep.title}
              aria-label='Step title'
              onChange={(event) => {
                const steps = draft.steps.slice();
                steps[activeIndex] = {
                  ...activeStep,
                  title: event.target.value,
                };
                updateDraft({ ...draft, steps });
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                type='button'
                variant='outline'
                onClick={() => moveStep(activeIndex, -1)}
              >
                Move earlier
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => moveStep(activeIndex, 1)}
              >
                Move later
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  if (draft.steps.length === 1) return;
                  const nextSteps = draft.steps.filter(
                    (item) => item.id !== activeStep.id
                  );
                  updateDraft({ ...draft, steps: nextSteps });
                  setSelectedStepId(
                    nextSteps[Math.max(0, activeIndex - 1)]?.id ?? null
                  );
                }}
              >
                Remove step
              </Button>
            </div>
            <IntakeFormBuilder
              step={activeStep}
              catalog={state.catalog}
              lockedKeys={state.lockedCustomKeys}
              imageCount={imageQuestionCount(draft)}
              remainingStandard={remainingStandard}
              canHideQuestionKey={(key) => canHideQuestion(draft, key)}
              canRemoveQuestionKey={(key) => canRemoveQuestion(draft, key)}
              onChangeQuestion={(next) => {
                const questions = activeStep.questions.map((question) =>
                  question.key === next.key ? next : question
                );
                const steps = draft.steps.slice();
                steps[activeIndex] = { ...activeStep, questions };
                updateDraft({ ...draft, steps });
              }}
              onMoveQuestion={(key, direction) => {
                const index = activeStep.questions.findIndex(
                  (question) => question.key === key
                );
                if (index < 0) return;
                const questions = moveItem(
                  activeStep.questions,
                  index,
                  direction
                );
                const steps = draft.steps.slice();
                steps[activeIndex] = { ...activeStep, questions };
                updateDraft({ ...draft, steps });
              }}
              onRemoveQuestion={(key) => {
                const questions = activeStep.questions.filter(
                  (question) => question.key !== key
                );
                const steps = draft.steps.slice();
                steps[activeIndex] = { ...activeStep, questions };
                updateDraft({ ...draft, steps });
              }}
              onAddStandard={(key) => {
                const field = state.catalog.find((item) => item.key === key);
                if (!field) return;
                const question: IntakeQuestion = {
                  kind: 'standard',
                  key: field.key,
                  label: field.defaultLabel,
                  required:
                    field.identity === 'name' || field.identity === 'contact',
                  helpText: null,
                };
                const steps = draft.steps.slice();
                steps[activeIndex] = {
                  ...activeStep,
                  questions: [...activeStep.questions, question],
                };
                updateDraft({ ...draft, steps });
              }}
              onAddCustom={(type) => {
                const question: IntakeQuestion = {
                  kind: 'custom',
                  key: newCustomKey(),
                  label: 'New question',
                  required: false,
                  helpText: null,
                  type,
                  options:
                    type === 'single_select' ||
                    type === 'multi_select' ||
                    type === 'radio'
                      ? ['Choice 1', 'Choice 2']
                      : [],
                };
                const steps = draft.steps.slice();
                steps[activeIndex] = {
                  ...activeStep,
                  questions: [...activeStep.questions, question],
                };
                updateDraft({ ...draft, steps });
              }}
            />
          </section>
        ) : null}
        <DraftActions
          busy={busy}
          testing={testing}
          onPublish={onPublish}
          onDiscard={onDiscard}
          onPreview={openClientPreview}
          onTest={() => setTesting((open) => !open)}
        />
      </form>

      {testing ? (
        <section>
          <DynamicIntakeForm
            definition={draft}
            catalog={state.catalog}
            mode='test'
            uploadImage={(file) =>
              uploadIntakeAnswerImage(file, state.tenant.id)
            }
            submitLabel={testWait ? `Wait ${testWait}s` : 'Submit test'}
            submitDisabled={testWait != null}
            onSubmit={async (answers) => {
              if (testWait) return;
              try {
                await saveIntakeDraft(draft, state.tenant.id);
                await submitIntakeTest(answers, state.tenant.id);
                setNotice('Test submission saved.');
                setTestWait(null);
              } catch (testError) {
                const wait = (testError as { retryAfterSec?: number })
                  .retryAfterSec;
                if (wait) setTestWait(wait);
                throw testError;
              }
            }}
          />
        </section>
      ) : null}

      <section>
        <h2>History</h2>
        {versions.length === 0 ? <p>No published versions yet.</p> : null}
        <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
          {versions.map((version) => (
            <li
              key={version.version}
              style={{ display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <span>
                Version {version.version} · {version.publishedBy || 'unknown'} ·{' '}
                {new Date(version.publishedAt).toLocaleString()}
              </span>
              <Button
                type='button'
                variant='outline'
                onClick={() => void onRestore(version.version)}
              >
                Restore into draft
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );

  function moveStep(index: number, direction: number) {
    updateDraft({ ...draft!, steps: moveItem(draft!.steps, index, direction) });
  }

  function openClientPreview() {
    saveIntakeClientPreview({
      definition: draft,
      catalog: state.catalog,
      tenantName: state.tenant.name,
      slug: state.tenant.slug,
      logoUrl: state.logoUrl,
    });
    window.open(
      '/settings/intake-form/preview',
      '_blank',
      'noopener,noreferrer'
    );
  }
}

function DraftActions({
  busy,
  testing,
  onPublish,
  onDiscard,
  onPreview,
  onTest,
}: {
  busy: boolean;
  testing: boolean;
  onPublish: () => void;
  onDiscard: () => void;
  onPreview: () => void;
  onTest: () => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button type='submit' disabled={busy}>
        Save draft
      </Button>
      <Button type='button' disabled={busy} onClick={onPublish}>
        Publish
      </Button>
      <Button
        type='button'
        variant='outline'
        disabled={busy}
        onClick={onDiscard}
      >
        Discard unpublished edits
      </Button>
      <Button type='button' variant='outline' onClick={onPreview}>
        Preview
      </Button>
      <Button type='button' variant='outline' onClick={onTest}>
        {testing ? 'Close test' : 'Test submit'}
      </Button>
    </div>
  );
}

function moveItem<T>(items: T[], index: number, direction: number): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const copy = items.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

export default IntakeFormSettingsPage;
