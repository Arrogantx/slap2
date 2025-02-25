-- Add Twitter handle column to whitelist_requests
ALTER TABLE whitelist_requests 
ADD COLUMN twitter_handle TEXT;

-- Create index for Twitter handle
CREATE INDEX idx_whitelist_twitter ON whitelist_requests(twitter_handle);