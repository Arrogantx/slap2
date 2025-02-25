/*
  # Initial Schema Setup

  1. New Tables
    - users: Store user information and wallet addresses
    - admins: Store admin wallet addresses
    - whitelist_requests: Track presale whitelist requests
    - staking: Record staking transactions
    - daily_checkins: Track daily login rewards
    - leaderboard: Store player rankings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whitelist requests table
CREATE TABLE IF NOT EXISTS whitelist_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staking table
CREATE TABLE IF NOT EXISTS staking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    staked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily login check-ins
CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    last_checkin TIMESTAMPTZ DEFAULT NOW(),
    streak INTEGER DEFAULT 1
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    slap_victories INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_admins_wallet ON admins(wallet_address);
CREATE INDEX IF NOT EXISTS idx_whitelist_wallet ON whitelist_requests(wallet_address);
CREATE INDEX IF NOT EXISTS idx_staking_wallet ON staking(wallet_address);
CREATE INDEX IF NOT EXISTS idx_checkin_wallet ON daily_checkins(wallet_address);
CREATE INDEX IF NOT EXISTS idx_leaderboard_wallet ON leaderboard(wallet_address);

-- RLS Policies
CREATE POLICY "Users can read own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all data"
    ON users FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM admins 
        WHERE wallet_address = auth.jwt()->>'wallet_address'
    ));

CREATE POLICY "Users can read own whitelist requests"
    ON whitelist_requests FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create whitelist requests"
    ON whitelist_requests FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own staking data"
    ON staking FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own staking"
    ON staking FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can read own checkins"
    ON daily_checkins FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own checkins"
    ON daily_checkins FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can read leaderboard"
    ON leaderboard FOR SELECT
    TO PUBLIC;

CREATE POLICY "Users can update own leaderboard entry"
    ON leaderboard FOR UPDATE
    USING (user_id = auth.uid());