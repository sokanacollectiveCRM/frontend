-- ============================================
-- View Notes/Activities for Specific Users
-- Replace UUIDs with the ones from your results
-- ============================================

-- JERRY BONY's Activities (8 activities in client_activities)
-- UUID: 7e0a278c-3208-4698-a3d5-23b81ead31da
SELECT 
    ca.id,
    ca.description,
    ca.timestamp,
    ca.client_id,
    ca.created_by,
    ci.firstname || ' ' || ci.lastname as client_name
FROM client_activities ca
LEFT JOIN client_info ci ON ca.client_id::uuid = ci.id
WHERE ca.created_by::uuid = '7e0a278c-3208-4698-a3d5-23b81ead31da'::uuid
ORDER BY ca.timestamp DESC;

-- EMMA JOHNSON's Notes (6 notes in notes table)
-- UUID: b1fc493e-e1e1-4ee5-9158-5cdbb42867bf
-- Note: notes table uses 'content' not 'description', and has 'work_log_id' not 'client_id'
SELECT 
    n.id,
    n.content,
    n.created_by,
    n.work_log_id,
    n.visibility
FROM notes n
WHERE n.created_by::uuid = 'b1fc493e-e1e1-4ee5-9158-5cdbb42867bf'::uuid
ORDER BY n.id DESC;

-- ============================================
-- BONUS: Check if there are any DOULAS with notes
-- (You mentioned trying to delete a doula)
-- ============================================
SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as user_name,
    u.email,
    u.role,
    COALESCE(notes_count.count, 0) as notes_count,
    COALESCE(activities_count.count, 0) as activities_count,
    (COALESCE(notes_count.count, 0) + COALESCE(activities_count.count, 0)) as total_count
FROM users u
LEFT JOIN (
    SELECT created_by::uuid as user_id, COUNT(*) as count
    FROM notes
    WHERE created_by IS NOT NULL
    GROUP BY created_by
) notes_count ON notes_count.user_id = u.id
LEFT JOIN (
    SELECT created_by::uuid as user_id, COUNT(*) as count
    FROM client_activities
    WHERE created_by IS NOT NULL
    GROUP BY created_by
) activities_count ON activities_count.user_id = u.id
WHERE u.role = 'doula'  -- Only doulas
    AND (COALESCE(notes_count.count, 0) > 0 
         OR COALESCE(activities_count.count, 0) > 0)
ORDER BY total_count DESC;

