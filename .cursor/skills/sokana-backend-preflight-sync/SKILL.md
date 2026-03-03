---
name: sokana-backend-preflight-sync
description: Runs a mandatory backend-context preflight before frontend implementation for every task to keep frontend and backend context aligned.
---

# Sokana Backend Preflight Sync

## Purpose

Use this skill before frontend tasks that integrate with backend APIs.

This is a mandatory workflow:
1. Run preflight.
2. Update context.
3. Begin implementation.

## Repositories

- Frontend repo (current): `/Users/jerrybony/Documents/GitHub/sokana-crm-frontend/frontend-crm`
- Backend repo (reference): `/Users/jerrybony/Documents/GitHub/backend`

## Required Pre-Task Workflow (Run Every Task)

Before coding, do all steps:

1. Read backend context sources:
   - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/SKILL.md`
   - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/frontend-context.md`
2. Scan frontend files relevant to the incoming task.
3. Update:
   - `.cursor/skills/sokana-backend-preflight-sync/backend-context.md`
4. Report preflight findings.
5. Start implementation only after context update is complete.

If no updates are needed, add a dated "No changes required" entry to `backend-context.md`.

## Cross-Repo Capability (Mandatory For Integration Tasks)

When running from frontend workspace:
- Read backend context from:
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/SKILL.md`
  - `/Users/jerrybony/Documents/GitHub/backend/.cursor/skills/sokana-doula-cloudsql-sync/frontend-context.md`

When running from backend workspace:
- Read frontend implementation directly at:
  - `/Users/jerrybony/Documents/GitHub/sokana-crm-frontend/frontend-crm`

If change is needed in the other repo, perform edits in that repo path.

## Minimum Frontend Scan Targets

- `src/api/doulas/doulaService.ts`
- `src/features/doula-dashboard/components/HoursTab.tsx`
- `src/features/doula-dashboard/components/ClientsTab.tsx`
- `src/features/doula-dashboard/components/ActivitiesTab.tsx`
- `src/features/doula-dashboard/components/DocumentsTab.tsx`
- `src/main.tsx`
- `src/common/contexts/UserContext.tsx`
- `src/common/components/routes/ProtectedRoutes.tsx`

## Update Template (backend-context.md)

Use this structure:

```md
## Preflight YYYY-MM-DD

### Task
- <task intent>

### Backend Context Reviewed
- <backend file path>
- <backend file path>

### Frontend Files Scanned
- <frontend file path>

### Contract Expectations
- <request/response shapes expected now>

### Drift Risks
- <what can break>

### Compatibility Required
- <fields/wrappers to support during rollout>

### Action
- [ ] Context updated before coding
- [ ] Implementation started after preflight
```

## Decision Rules

- Preserve compatibility for mixed wrappers/field casing during migrations.
- Keep normalization in API service layer; avoid spreading parsing logic in multiple components.
- Prefer additive compatibility changes before removing legacy fields.
- For stale dashboard data issues, include no-cache strategy in fetch layer.

## Output Requirement

Before any implementation, provide:
- gate result: `run_preflight`
- files scanned,
- context updates made,
- specific compatibility strategy for this task.
