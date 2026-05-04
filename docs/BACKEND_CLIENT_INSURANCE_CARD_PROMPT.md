# Backend Prompt: Client Insurance Card Upload

Implement backend support for client insurance card uploads used by the frontend.

## Goal

Allow a client to upload an image of their insurance card from the client portal billing section, store it as a client document, link it to the client profile, and allow staff to view/download it from the CRM.

## Canonical Frontend Contract

The frontend is already wired to these exact endpoints. Please implement these paths and response shapes:

### Client self-service endpoints

1. `POST /api/clients/me/documents`
   - Auth: logged-in client
   - Content type: `multipart/form-data`
   - Form fields:
     - `file`: uploaded file
     - `documentType`: `"insurance_card"`
     - `document_type`: `"insurance_card"`
     - `category`: `"billing"`
   - Accepted files: `.jpg`, `.jpeg`, `.png`
   - Max size: 10 MB

2. `GET /api/clients/me/documents`
   - Auth: logged-in client
   - Returns the client’s uploaded documents, including insurance cards

3. `GET /api/clients/me/documents/:documentId/url`
   - Auth: logged-in client
   - Returns a signed/view URL for the requested document

### Staff endpoints

4. `GET /api/clients/:clientId/documents`
   - Auth: admin or authorized staff
   - Returns all documents linked to the client

5. `GET /api/clients/:clientId/documents/:documentId/url`
   - Auth: admin or authorized staff
   - Returns a signed/view URL for the requested client document

## Required Behavior

- Upload insurance card images to the existing client documents storage area if one exists.
- If no client-documents storage exists yet, create one that supports private file storage.
- Persist a document record linked to the client profile.
- Store document type as `insurance_card`.
- Only allow image uploads for this document type.
- Staff must be able to list the uploaded insurance card from the client profile and open/download it.
- Clients must only access their own documents.
- Staff must only access documents for clients they are authorized to view.

## Suggested Response Shapes

Use the project’s normal API envelope if one exists. The frontend tolerates either wrapped or unwrapped data, but these shapes are preferred:

### `POST /api/clients/me/documents`

```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "document_type": "insurance_card",
    "file_name": "insurance-card-front.png",
    "uploaded_at": "2026-03-24T18:30:00.000Z",
    "status": "uploaded",
    "content_type": "image/png"
  }
}
```

### `GET /api/clients/me/documents`

```json
{
  "success": true,
  "documents": [
    {
      "id": "doc_123",
      "document_type": "insurance_card",
      "file_name": "insurance-card-front.png",
      "uploaded_at": "2026-03-24T18:30:00.000Z",
      "status": "uploaded",
      "content_type": "image/png"
    }
  ]
}
```

### `GET /api/clients/me/documents/:documentId/url`

```json
{
  "success": true,
  "url": "https://signed-url.example.com/..."
}
```

The staff list and URL endpoints should return the same document fields and URL shape.

## Validation Rules

- Reject non-image uploads for `insurance_card`
- Reject files larger than 10 MB
- Return clear errors for:
  - unauthenticated client
  - unauthorized staff access
  - missing file
  - unsupported file type
  - missing document

## Acceptance Criteria

- Client can upload an insurance card from billing
- File is stored successfully
- Document record is linked to the client profile
- Staff can see the insurance card in client paperwork/documents
- Staff can open and download the insurance card
- Client can view/download their own uploaded insurance card

## Troubleshooting: `new row violates row-level security policy` (bucket setup)

If the API returns an error like **`Failed to ensure client documents bucket exists: new row violates row-level security policy`**, the backend is almost certainly trying to **create or register a Storage bucket** while authenticated as the **end user** (JWT / anon role). In Supabase, inserts into `storage.buckets` (and related metadata) are protected by RLS and are **not** allowed for normal users.

**Fix (pick one):**

1. **Pre-create the bucket** in Supabase Dashboard → Storage → New bucket (private). Name it whatever the backend expects (e.g. `client-documents`). Do not rely on lazy creation from the client-scoped Supabase client.
2. **Lazy creation only with service role**: run bucket / metadata setup using the **service role** key **only on the server**, never in the browser. The user’s session must not perform `INSERT` into bucket tables.
3. **Migrations**: create the bucket via SQL or CLI using elevated privileges, then keep upload paths using **storage policies** that allow authenticated clients to `INSERT` **objects** into that bucket’s prefix—not bucket rows.

After the bucket exists and policies allow the client to upload **files** to that bucket, the portal upload flow should stop failing with this RLS error.

## Frontend Files Already Wired

- `src/api/clients/clientDocuments.ts`
- `src/features/client-dashboard/components/ClientProfileTab.tsx`
- `src/features/profiles/Documents.tsx`

Please implement the backend to match the contract above exactly so no further frontend changes are required.
