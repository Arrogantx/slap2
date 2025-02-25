/*
  # Add initial admin

  1. Changes
    - Insert initial admin wallet address
*/

-- Insert the admin wallet address (converted to lowercase)
INSERT INTO admins (wallet_address) 
VALUES ('0x85e6cc88f3055b589eb1d4030863be2cfcc0763e')
ON CONFLICT (wallet_address) DO NOTHING;