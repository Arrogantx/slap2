/*
  # Add whitelist request update policy

  1. Changes
    - Add policy to allow updating whitelist requests
    - Ensure updates can be made to status and updated_at fields
  
  2. Security
    - Allow public updates to whitelist_requests table
    - Maintain existing RLS policies
*/

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Allow public update to whitelist_requests" ON whitelist_requests;

-- Create new update policy
CREATE POLICY "Allow public update to whitelist_requests"
ON whitelist_requests FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);