# Client Number Feature Notes

## Overview

Client numbers are human-readable identifiers (e.g. `CL-00001`) used to track leads and clients in the Sokana CRM. They are **assigned by the backend** when a new request is submitted, not by the frontend.

## Flow

1. **Submission**: User completes the Request for Service form → `POST /requestService/requestSubmission`
2. **Backend**: Creates the lead/client record and assigns a sequential client number
3. **Display**: Client number appears in the admin Clients list and Lead Profile modal

## Frontend Usage

| Location | Field | Notes |
|----------|-------|-------|
| API DTO | `client_number` (snake_case) | Backend response format |
| Domain | `clientNumber` (camelCase) | Frontend convention |
| `users-columns.tsx` | `#` column | Clients table, monospace styling |
| `LeadProfileModal.tsx` | Profile section | Displays client number when present |

## Field Mapping

- **Backend → Frontend**: `client.mapper.ts` maps `dto.client_number` → `clientNumber`
- **Fallback**: Components handle both `clientNumber` and `client_number` for compatibility
- **Display**: Shows `—` when client number is empty or missing

## Testing Client Number Generation

1. Go to the Request for Service form (desktop or mobile)
2. Click **"Fill with test data"** to populate dummy data from `src/features/request/dummyTestLead.ts`
3. Submit the form
4. Open the Clients list in the admin dashboard
5. Verify the new client appears with a number (e.g. `CL-00001`)

## Backend Contract Expectations

- `GET /clients` list items may include `client_number`
- `GET /clients/:id` detail may include `client_number`
- Client number is optional (`client_number?: string`) — older records may not have one

## Format

- Expected format: `CL-` + zero-padded sequence (e.g. `CL-00001`, `CL-00002`)
- Generation logic lives in the backend; frontend only displays it
- If format changes, update display logic in `users-columns.tsx` and `LeadProfileModal.tsx` if needed

## Related Files

- `src/domain/client.ts` — `clientNumber` on `Client` and `ClientDetail`
- `src/api/dto/client.dto.ts` — `client_number` on DTOs
- `src/api/mappers/client.mapper.ts` — DTO → domain mapping
- `src/features/clients/components/users-columns.tsx` — table column
- `src/features/clients/components/dialog/LeadProfileModal.tsx` — profile display
- `src/features/request/dummyTestLead.ts` — test data for request form
