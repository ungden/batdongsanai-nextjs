-- =============================================
-- CHECK TABLE STRUCTURE
-- Run this first to see the exact column structure
-- =============================================

-- Check developers table columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'developers'
ORDER BY ordinal_position;

-- Check projects table columns
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;
