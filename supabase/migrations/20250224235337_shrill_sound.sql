-- Drop existing RLS policies if any
DROP POLICY IF EXISTS "Allow public read access to admins" ON admins;
DROP POLICY IF EXISTS "Allow public read access to whitelist_requests" ON whitelist_requests;

-- Insert the admin wallet address (converted to lowercase)
INSERT INTO admins (wallet_address) 
VALUES ('0x85e6cc88f3055b589eb1d4030863be2cfcc0763e')
ON CONFLICT (wallet_address) DO NOTHING;

-- Create RLS policies for admins table
CREATE POLICY "Allow public read access to admins"
ON admins FOR SELECT
TO PUBLIC
USING (true);

-- Create RLS policies for whitelist_requests table
CREATE POLICY "Allow public read access to whitelist_requests"
ON whitelist_requests FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Allow public insert to whitelist_requests"
ON whitelist_requests FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Ensure RLS is enabled but with public access policies
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelist_requests ENABLE ROW LEVEL SECURITY;