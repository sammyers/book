INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new
) VALUES
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@book.com',
    crypt('superadmin', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"firstName": "Super", "lastName": "Admin"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  ),
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'manager@book.com',
    crypt('manager', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"firstName": "Team", "lastName": "Manager"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  ),
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'scorekeeper@book.com',
    crypt('scorekeeper', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"firstName": "Team", "lastName": "Scorekeeper"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  ),
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'member@book.com',
    crypt('member', gen_salt('bf')),
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"firstName": "Team", "lastName": "Member"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
  );

UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'email', email,
  'sub', id::text,
  'email_verified', TRUE,
  'phone_verified', FALSE
);

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) (
  SELECT
    uuid_generate_v4 (),
    id,
    format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
    'email',
    id,
    current_timestamp,
    current_timestamp,
    current_timestamp
  FROM
    auth.users
);

SET search_path TO public;

UPDATE "user" SET permission_level = 'super_admin' WHERE email = 'admin@book.com';

INSERT INTO region (name, short_name) VALUES
  ('Test Region', null),
  ('Northern California', 'NorCal');

INSERT INTO team (name, location_city, location_state, admin_note, primary_region_id) VALUES
  ('Louisiana Balloons', 'New Orleans', 'LA', 'Definitely not the Yankees', (SELECT id FROM region WHERE name = 'Test Region')),
  ('Bad News Bears', 'Los Angeles', 'CA', 'The least talented team in the Southern California league', (SELECT id FROM region WHERE name = 'Test Region')),
  ('Springfield Isotopes', 'Springfield', 'MO', 'Owners of the record for most consecutive losses', (SELECT id FROM region WHERE name = 'Test Region'));

INSERT INTO team (name, associated_team_id) VALUES
  ('Shelbyville Shelbyvillians', (SELECT id from team WHERE name = 'Springfield Isotopes'));

INSERT INTO user_team (user_id, team_id, permission_level) VALUES
  (
    (SELECT id FROM "user" WHERE email = 'manager@book.com'),
    (SELECT id FROM team WHERE name = 'Bad News Bears'),
    'manager'
  ),
  (
    (SELECT id FROM "user" WHERE email = 'scorekeeper@book.com'),
    (SELECT id FROM team WHERE name = 'Bad News Bears'),
    'scorekeeper'
  ),
  (
    (SELECT id FROM "user" WHERE email = 'member@book.com'),
    (SELECT id FROM team WHERE name = 'Bad News Bears'),
    'member'
  );

INSERT INTO player (name, primary_position) VALUES
  ('Sleve McDichael', 'pitcher'),
  ('Onson Sweemey', 'catcher'),
  ('Darryl Archideld', 'first_base'),
  ('Glenallen Mixon', 'second_base'),
  ('Rey McScriff', 'third_base'),
  ('Tony Smehrik', 'shortstop'),
  ('Bobson Dugnutt', 'left_field'),
  ('Willie Dustice', 'center_field'),
  ('Mike Truk', 'right_field'),
  ('Karl Dandleton', 'extra_hitter'),
  ('Mike Sernandez', 'middle_infield'),
  ('Todd Bonzalez', 'extra_hitter');

DO $$
DECLARE
  player_id UUID;
  team_id UUID;
  jersey_number INT := 1;
  BEGIN
  SELECT id FROM team INTO team_id WHERE name = 'Louisiana Balloons';
  FOR player_id IN SELECT id FROM player LOOP
    INSERT INTO player_team (player_id, team_id, jersey_number) VALUES (player_id, team_id, jersey_number);
    jersey_number := jersey_number + 1;
  END LOOP;
END $$;
