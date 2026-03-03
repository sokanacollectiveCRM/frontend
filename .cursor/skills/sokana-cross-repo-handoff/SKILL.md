---
name: sokana-cross-repo-handoff
description: Creates structured frontend/backend handoff tasks as files for cross-repo pickup. Use when one side is blocked by missing endpoint, schema, contract, bug fix, migration, or integration dependency in the other repo.
---

# Sokana Cross-Repo Handoff

## Purpose

Use this skill to hand work from frontend to backend, or backend to frontend, without losing context.

Primary outcome:
- create a single task file with clear owner, acceptance criteria, and verification steps.

## Mandatory Trigger

When working in frontend:
- If any required change belongs to backend (endpoint, auth, contract, schema, migration, data bug),
  this skill must run and must produce/update a handoff task file in `.cursor/handoffs/open/`.

## Where To Write Handoffs

- Folder: `.cursor/handoffs/open/`
- File name:
  - `YYYY-MM-DD-<target>-<short-slug>.md`
  - target is `backend` or `frontend`

When complete:
- move the task file to `.cursor/handoffs/done/`
- add completion notes at the bottom

## Required Task File Structure

Use this exact structure:

```md
# Handoff: <short title>

## Metadata
- Direction: `<frontend->backend | backend->frontend>`
- Priority: `<P0 | P1 | P2>`
- Requested By: `<name or team>`
- Date: `<YYYY-MM-DD>`
- Status: `open`
- Related Links:
  - `<optional PR/issue/doc links>`

## Why This Is Needed
- <1-3 bullets>

## Current Behavior
- <what happens now>

## Expected Behavior
- <what should happen>

## Requested Changes
- [ ] <concrete change 1>
- [ ] <concrete change 2>

## API/Contract Notes
- Endpoint(s):
  - `<method path>`
- Request shape:
  - `<fields>`
- Response shape:
  - `<fields>`
- Backward compatibility:
  - `<what must not break>`

## Data/Migration Notes
- Tables:
  - `<table names>`
- Required migration:
  - `<yes/no + migration file name if yes>`

## Acceptance Criteria
- [ ] <testable condition 1>
- [ ] <testable condition 2>

## Verification Steps
- Backend:
  - `<commands/manual checks>`
- Frontend:
  - `<commands/manual checks>`

## Implementation Notes
- <optional details>
```

## Workflow

1. Determine direction:
   - missing endpoint, schema, or backend bug -> `frontend->backend`
   - UI/parser/consumer mismatch -> `backend->frontend`
2. Write one focused task file in `.cursor/handoffs/open/`.
3. Include only testable, implementation-ready requirements.
4. Add migration requirements explicitly when data changes are needed.
5. Keep compatibility notes explicit during mixed rollouts.

## Quality Bar

Before finalizing a handoff file, ensure:
- owner direction is explicit
- endpoint and payload are concrete
- acceptance criteria are testable
- migration steps are included if schema changes are needed
- verification includes both API and UI checks where applicable
