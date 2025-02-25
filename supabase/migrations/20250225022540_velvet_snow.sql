/*
  # Add blacklist functionality

  1. New Tables
    - `blacklist`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique)
      - `reason` (text)
      - `created_at` (timestamptz)
      - `created_by` (text)

  2. Security
    - Enable RLS on blacklist table
    - Add policies for public read access
    - Add policies for admin-only write access
*/

-- Create blacklist table
CREATE TABLE IF NOT EXISTS blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to blacklist"
ON blacklist FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Allow admins to manage blacklist"
ON blacklist FOR ALL
TO PUBLIC
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE wallet_address = current_user
    )
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_blacklist_wallet ON blacklist(wallet_address);