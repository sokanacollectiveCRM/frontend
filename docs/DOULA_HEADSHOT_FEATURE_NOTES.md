# Doula Headshot Feature — Review Notes

**Date:** 2026-03-11  
**Status:** Ready for review  
**Scope:** Frontend only (no backend changes required)

---

## Summary

Admin users can now view doula profile pictures (headshots) and download them where they already manage doulas. Doulas continue to upload headshots from their Profile tab.

---

## What Was Built

### 1. Doula Detail Page (Admin view)
- **Location:** `/hours/:id` — when an admin clicks a doula and opens their detail view
- **Changes:**
  - Displays doula headshot in the header card (instead of initials only)
  - Adds a **Download** button next to the avatar when a headshot exists
  - Download saves as `{firstname}-{lastname}-headshot.{ext}`
- **File:** `src/features/hours/components/DoulaDetailPage.tsx`

### 2. Teams Page (Admin/team management)
- **Location:** `/team` — team member list
- **Changes:**
  - Shows doula headshots in team member cards (instead of initials only)
  - Adds **Download headshot** to the ⋮ dropdown menu (admin-only, shown only when a headshot exists)
  - Download saves as `{firstname}-{lastname}-headshot.{ext}`
- **File:** `src/features/teams/teams.tsx`

---

## Data Flow

- **Source:** `/clients/team/all` returns `profile_picture` for doulas (Cloud SQL `doulas.profile_picture`)
- Doulas upload headshots via their own Profile tab → stored in Supabase, URL saved in Cloud SQL
- Doula Detail Page uses the same team API when fetching doula data; Teams page uses it directly

---

## Acceptance Criteria

| Criteria | Status |
|----------|--------|
| Doula headshot visible on admin doula detail page | ✅ |
| Admin can download headshot from doula detail page | ✅ |
| Doula headshot visible on Teams page cards | ✅ |
| Admin can download headshot from Teams page (⋮ menu) | ✅ |
| Download only available to admins on Teams page | ✅ |
| Fallback to initials when no headshot | ✅ |

---

## How to Test

1. **Ensure at least one doula has a headshot**
   - Log in as a doula → Profile tab → upload a photo
2. **Doula Detail Page**
   - Log in as admin → Hours → Doulas → click a doula with a headshot  
   - Confirm headshot appears and Download button works
3. **Teams Page**
   - Log in as admin → Team  
   - Confirm headshots appear on cards and “Download headshot” appears in the ⋮ menu
4. **Edge cases**
   - Doulas without headshots still show initials
   - Download option hidden when no headshot

---

## Notes for Reviewer

- Download uses client-side fetch from the stored URL; CORS must allow the frontend origin for Supabase URLs
- If download fails (e.g. CORS), consider adding a backend proxy endpoint later
