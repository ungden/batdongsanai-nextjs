-- Add 'news' to the existing content type enum
-- First let's see what content types exist and add news if it doesn't exist
DO $$
BEGIN
  -- Check if 'news' type already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'news' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'content_type_enum')
  ) THEN
    -- Add 'news' to the content_type_enum
    ALTER TYPE content_type_enum ADD VALUE 'news';
  END IF;
END$$;