# Step-by-Step Guide: Running SQL Scripts to Diagnose Notes Issue

## Overview
You have 3 SQL scripts. Run them **ONE BY ONE** in this order. Each script answers different questions.

---

## 🎯 **RECOMMENDED PATH: Start Here**

### **Script 1: `quick_check_notes.sql` (START HERE)**

**Purpose:** Quick answer - Which team members have notes preventing deletion?

**How to Run:**
1. Open Supabase SQL Editor
2. Copy **ONLY STEP 1** from `quick_check_notes.sql`
3. Paste and run it
4. **Look at the results** - This tells you immediately which doula has notes

**What You'll See:**
- List of all doulas/admins who have notes
- `notes_count` - Notes from `notes` table
- `activities_count` - Notes from `client_activities` table  
- `total_count` - Total notes preventing deletion

**Example Output:**
```
id  | user_name      | email              | role  | notes_count | activities_count | total_count
----|----------------|--------------------|-------|-------------|------------------|-------------
123 | Emma Johnson   | emma@example.com   | doula | 5           | 2                | 7
456 | Christian Lee  | chris@example.com  | admin | 0           | 0                | 0
```

**Next Steps After STEP 1:**
- ✅ **If you see results:** You found the doula! Note their `id` and go to STEP 2
- ✅ **If no results:** No team members have notes, deletion should work (might be a different issue)

---

### **Script 1: `quick_check_notes.sql` - STEP 2 & 3 (Optional Details)**

**Purpose:** See actual notes for a specific user

**When to Run:** After STEP 1, if you want to see what notes a specific doula created

**How to Run:**
1. Copy **STEP 2** from `quick_check_notes.sql`
2. **IMPORTANT:** Replace `'USER_ID_HERE'` with the actual UUID from STEP 1 results
   - Example: If STEP 1 showed `id: 123e4567-e89b-12d3-a456-426614174000`
   - Change: `WHERE n.created_by::uuid = '123e4567-e89b-12d3-a456-426614174000'::uuid`
3. Run it to see notes from `notes` table

**Then run STEP 3:**
1. Copy **STEP 3** from `quick_check_notes.sql`
2. Replace `'USER_ID_HERE'` with the same UUID
3. Run it to see notes from `client_activities` table

**What You'll See:**
- Actual note descriptions
- When they were created
- Which client they're for

---

## 🔍 **DETAILED ANALYSIS: If You Need More Info**

### **Script 2: `check_table_schemas.sql` (Optional - Schema Check)**

**Purpose:** Verify table structure and column names

**When to Run:** 
- If you're curious about table structure
- If queries are failing and you want to verify columns exist

**How to Run:**
1. Copy the **entire script** (it has 3 queries)
2. Run all 3 queries at once (they're independent)
3. Review the column structures

**What You'll See:**
- All columns in `notes` table
- All columns in `client_activities` table
- All columns in `notes_to` table

---

### **Script 3: `check_notes_foreign_key.sql` (Advanced Analysis)**

**Purpose:** Deep dive - Foreign keys, orphaned notes, detailed breakdowns

**When to Run:** 
- If you need to understand the foreign key constraint details
- If you want to see all notes with user info
- If you suspect orphaned notes (notes with invalid user IDs)

**How to Run:**
Run queries **ONE BY ONE** - Each query answers a different question:

**Query 1:** Table structure check
- Shows columns in notes tables

**Query 2:** Foreign key constraints
- Shows the exact constraint causing the issue
- **Important:** This shows `notes_created_by_fkey` constraint

**Query 3:** Notes count per user
- Summary of notes by table and user

**Query 4:** All notes with user info
- Shows last 50 notes with creator details

**Query 5:** Users with notes (detailed)
- Shows first/last note dates

**Query 6:** Orphaned notes check
- Finds notes where `created_by` doesn't match any user
- **Important:** If this returns results, there's a data integrity issue

**Query 7:** Specific user's notes
- Replace `'USER_ID_HERE'` with actual UUID
- Shows notes with client names

**Query 8:** Summary with deletion status
- Shows all team members with "CAN DELETE" or "CANNOT DELETE" status

**Query 9:** Foreign key constraint details
- Technical details about the constraint

**Query 10:** All team members summary
- Complete list with note counts

---

## 📋 **Quick Reference: What Each Script Does**

| Script | Purpose | Run Time | Priority |
|--------|---------|----------|----------|
| `quick_check_notes.sql` STEP 1 | **Find which doula has notes** | 30 sec | ⭐⭐⭐ **START HERE** |
| `quick_check_notes.sql` STEP 2-3 | See actual notes for a user | 1 min | ⭐⭐ If needed |
| `check_table_schemas.sql` | Verify table structure | 30 sec | ⭐ Optional |
| `check_notes_foreign_key.sql` | Deep analysis | 5-10 min | ⭐ If you need details |

---

## 🚀 **Recommended Workflow**

1. **Run `quick_check_notes.sql` STEP 1** → Get immediate answer
2. **If you see a doula with notes:**
   - Note their UUID from results
   - Run STEP 2 & 3 with that UUID to see their notes
3. **If you need more details:**
   - Run specific queries from `check_notes_foreign_key.sql`
4. **If queries fail:**
   - Run `check_table_schemas.sql` to verify structure

---

## ⚠️ **Important Notes**

- **Don't run all scripts at once** - Run them one query at a time
- **Replace `'USER_ID_HERE'`** with actual UUIDs from your results
- **UUIDs look like:** `123e4567-e89b-12d3-a456-426614174000`
- **Copy queries carefully** - Make sure you get the full query
- **Check results** after each query before moving to the next

---

## 🎯 **Expected Outcome**

After running STEP 1, you should know:
- ✅ Which doula has notes preventing deletion
- ✅ How many notes they have
- ✅ Which table(s) contain their notes

Then you can decide:
- Should we implement soft delete?
- Should we reassign notes?
- Is there a bug in how `created_by` is set?

