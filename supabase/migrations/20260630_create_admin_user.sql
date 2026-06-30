-- Create new admin user
-- Email: service@maximo-seo.com
-- Password: Supermario60@!

-- First, check if user already exists
DO $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'service@maximo-seo.com'
  ) INTO user_exists;

  IF NOT user_exists THEN
    -- Create the user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'service@maximo-seo.com',
      crypt('Supermario60@!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    RAISE NOTICE 'User service@maximo-seo.com created successfully';
  ELSE
    RAISE NOTICE 'User service@maximo-seo.com already exists';
  END IF;
END $$;

-- Verify the user was created
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'service@maximo-seo.com';
