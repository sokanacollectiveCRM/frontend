#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  cat <<'USAGE'
Usage:
  DATABASE_URL="postgres://..." ./scripts/find-activity-author.sh <client_id> <note_text>

Example:
  DATABASE_URL="postgres://user:pass@host:5432/db" \
  ./scripts/find-activity-author.sh \
    1d981375-beeb-46e7-bf22-5d7a750eb391 \
    "thats good to hear"
USAGE
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Error: DATABASE_URL is required."
  exit 1
fi

CLIENT_ID="$1"
NOTE_TEXT="$2"

psql "$DATABASE_URL" \
  -v ON_ERROR_STOP=1 \
  -v client_id="$CLIENT_ID" \
  -v note_text="$NOTE_TEXT" <<'SQL'
\pset pager off
\pset null '(null)'

\echo ''
\echo '=== Step 1: Find matching activity row ==='
WITH target AS (
  SELECT
    ca.id,
    ca.client_id,
    ca.activity_type,
    ca.content,
    ca.created_at,
    ca.created_by::text AS created_by_uuid,
    ca.metadata
  FROM client_activities ca
  WHERE ca.client_id::text = :'client_id'
    AND lower(trim(ca.content)) = lower(trim(:'note_text'))
  ORDER BY ca.created_at DESC
  LIMIT 1
)
SELECT * FROM target;

WITH target AS (
  SELECT
    ca.id AS activity_id,
    ca.created_by::text AS created_by_uuid,
    ca.created_at
  FROM client_activities ca
  WHERE ca.client_id::text = :'client_id'
    AND lower(trim(ca.content)) = lower(trim(:'note_text'))
  ORDER BY ca.created_at DESC
  LIMIT 1
)
SELECT
  target.activity_id,
  target.created_by_uuid,
  target.created_at
FROM target
\gset

\if :{?created_by_uuid}
\echo ''
\echo '=== Step 2: Resolve author in public.users (if exists) ==='
SELECT (to_regclass('public.users') IS NOT NULL)::int AS has_users \gset
\if :has_users
SELECT
  u.id::text AS id,
  u.email,
  u.firstname,
  u.lastname,
  u.role
FROM public.users u
WHERE u.id::text = :'created_by_uuid';
\else
\echo 'public.users table not found.'
\endif

\echo ''
\echo '=== Step 3: Resolve author in public.team_members (if exists) ==='
SELECT (to_regclass('public.team_members') IS NOT NULL)::int AS has_team_members \gset
\if :has_team_members
SELECT
  tm.id::text AS id,
  tm.email,
  tm.firstname,
  tm.lastname,
  tm.role
FROM public.team_members tm
WHERE tm.id::text = :'created_by_uuid';
\else
\echo 'public.team_members table not found.'
\endif

\echo ''
\echo '=== Step 4: Resolve author in auth.users (if exists/allowed) ==='
SELECT (to_regclass('auth.users') IS NOT NULL)::int AS has_auth_users \gset
\if :has_auth_users
SELECT
  au.id::text AS id,
  au.email,
  au.raw_user_meta_data ->> 'firstname' AS firstname,
  au.raw_user_meta_data ->> 'lastname' AS lastname
FROM auth.users au
WHERE au.id::text = :'created_by_uuid';
\else
\echo 'auth.users table not found or not visible to this DB role.'
\endif

\echo ''
\echo '=== Summary ==='
SELECT :'created_by_uuid' AS created_by_uuid;
\else
\echo ''
\echo 'No matching activity found for the provided client_id + note_text.'
\endif
SQL

