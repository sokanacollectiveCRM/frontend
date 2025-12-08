-- ============================================
-- Check Contracts Foreign Key Issue
-- Similar to notes, contracts can also block user deletion
-- ============================================

-- STEP 1: Check which users have contracts (causing deletion issues)
SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as user_name,
    u.email,
    u.role,
    COUNT(c.id) as contracts_count
FROM users u
INNER JOIN contracts c ON c.created_by::uuid = u.id
WHERE u.role IN ('doula', 'admin')
GROUP BY u.id, u.firstname, u.lastname, u.email, u.role
ORDER BY contracts_count DESC;

-- If contracts table uses a different column name, try these alternatives:

-- Alternative 1: Check if contracts have 'user_id' column
SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as user_name,
    u.email,
    u.role,
    COUNT(c.id) as contracts_count
FROM users u
INNER JOIN contracts c ON c.user_id::uuid = u.id
WHERE u.role IN ('doula', 'admin')
GROUP BY u.id, u.firstname, u.lastname, u.email, u.role
ORDER BY contracts_count DESC;

-- Alternative 2: Check if contracts have 'doula_id' column
SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as user_name,
    u.email,
    u.role,
    COUNT(c.id) as contracts_count
FROM users u
INNER JOIN contracts c ON c.doula_id::uuid = u.id
WHERE u.role IN ('doula', 'admin')
GROUP BY u.id, u.firstname, u.lastname, u.email, u.role
ORDER BY contracts_count DESC;

-- STEP 2: Check contracts table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'contracts'
ORDER BY ordinal_position;

-- STEP 3: Check foreign key constraints on contracts table
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'contracts'
ORDER BY kcu.column_name;

-- STEP 4: Show contracts for a specific user (Christian Lee)
-- Replace UUID with actual user ID
SELECT 
    c.id,
    c.client_id,
    c.status,
    c.created_at,
    c.created_by,
    ci.firstname || ' ' || ci.lastname as client_name
FROM contracts c
LEFT JOIN client_info ci ON c.client_id::uuid = ci.id
WHERE c.created_by::uuid = 'USER_ID_HERE'::uuid  -- Replace with Christian Lee's UUID
ORDER BY c.created_at DESC;

-- STEP 5: Summary - All team members with contracts, notes, and activities
SELECT 
    u.id,
    u.firstname || ' ' || u.lastname as name,
    u.email,
    u.role,
    COALESCE(contracts_count.count, 0) as contracts_count,
    COALESCE(notes_count.count, 0) as notes_count,
    COALESCE(activities_count.count, 0) as activities_count,
    (COALESCE(contracts_count.count, 0) + 
     COALESCE(notes_count.count, 0) + 
     COALESCE(activities_count.count, 0)) as total_blocking_records,
    CASE 
        WHEN (COALESCE(contracts_count.count, 0) + 
              COALESCE(notes_count.count, 0) + 
              COALESCE(activities_count.count, 0)) > 0 
        THEN 'CANNOT DELETE - Has related records'
        ELSE 'CAN DELETE - No related records'
    END as deletion_status
FROM users u
LEFT JOIN (
    SELECT created_by::uuid as user_id, COUNT(*) as count
    FROM contracts
    WHERE created_by IS NOT NULL
    GROUP BY created_by
) contracts_count ON contracts_count.user_id = u.id
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
WHERE u.role IN ('doula', 'admin')
GROUP BY u.id, u.firstname, u.lastname, u.email, u.role, 
         contracts_count.count, notes_count.count, activities_count.count
ORDER BY total_blocking_records DESC, u.role, u.lastname;

