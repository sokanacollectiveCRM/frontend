# Client Detail: Merged Response Contract

## Summary

The backend returns **one merged object in `data`** for `GET /clients/:id` when the user is authorized. That object combines:

- **Supabase (operational):** `id`, `first_name`, `last_name`, `email`, `status`, `portal_status`, `requested_at`, `updated_at`, `is_eligible`, etc.
- **PHI (Cloud Run broker):** `phone_number`, `due_date`, `date_of_birth`, `address_line1`, `service_needed`, and other PHI fields.

The frontend uses `response.data` as the single source for the lead profile modal, so both groups show up in the form without extra merging on the client.

---

## Backend behavior (already in place)

- In the primary path (e.g. `getClientById` when authorized), the backend does:
  - `merged = { ...dto, ...phiData }`
  - `res.json(ApiResponse.success(merged))`
- So the API returns a **single merged object in `data`**: Supabase operational fields plus PHI from the broker.
- No separate `data` and `phi` are sent; the merge happens before the response.

---

## Frontend usage

- The frontend calls `get<ClientDetailDTO>('/clients/:id')`, which (in canonical mode) unwraps and returns **`response.data`** only.
- That value is the merged object (Supabase + PHI). The modal uses it as the single source for:
  - Display (phone number, due date, address, etc.)
  - Form state (`editedData` init)
  - Title (first/last name)

If the frontend ever receives a full response with both `data` and `phi` (e.g. from a direct fetch that does not unwrap), the lead profile modal still merges base + phi into one object for display and form init.

---

## If you had separate `data` and `phi`

If the backend ever returned separate `data` (Supabase) and `phi` (Cloud Run), the contract remains: **merge into `data` before sending** so the client still receives one object in `response.data`. The current backend already does that.

---

## Related

- **PHI Broker E2E test plan:** `docs/qa/phi-broker-e2e-test-plan.md`
- **Client detail DTO:** `src/api/dto/client.dto.ts` (`ClientDetailDTO`)
- **Modal merge (base + phi):** `src/features/clients/components/dialog/LeadProfileModal.tsx` (`detailSource`)
