# Run Doula Documents Migration

The error `Could not find the table 'public.doula_documents'` means the table doesn't exist. Run the migration in **Supabase**.

## Steps

1. Open **Supabase Dashboard** → your project → **SQL Editor**
2. Click **New query**
3. Open `scripts/doula-documents-migration-full.sql` in this repo
4. Copy its entire contents and paste into the SQL Editor
5. Click **Run**

## After migration

1. **Storage bucket**: Ensure the `doula-documents` bucket exists  
   - Supabase Dashboard → Storage → create bucket `doula-documents` (private)  
   - Or run `backend/src/db/migrations/setup_doula_documents_storage.sql` in the SQL Editor
2. Refresh the Documents tab in your app
