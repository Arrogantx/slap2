/*
  # Add updated_at column to whitelist_requests table

  1. Changes
    - Add updated_at column to whitelist_requests table
    - Set default value to NOW()
    - Backfill existing rows with current timestamp
*/

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'whitelist_requests' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE whitelist_requests 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

    -- Update existing rows to have updated_at equal to created_at
    UPDATE whitelist_requests 
    SET updated_at = created_at 
    WHERE updated_at IS NULL;
  END IF;
END $$;