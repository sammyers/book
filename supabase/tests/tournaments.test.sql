BEGIN;

create extension if not exists pgtap with schema extensions;

SELECT plan(2);

-- Create test users
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'user1@book.com', '{"firstName": "Greatest", "lastName": "Ever"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'user2@book.com', '{"firstName": "Second", "lastName": "Best"}');

-- Create test region
insert into public.region (id, name, short_name) values
  ('00000000-0000-0000-0000-0000000000d1', 'Test Region', 'TR');

-- Create test team
insert into public.team (id, "name") values
  ('00000000-0000-0000-0000-0000000000b1', 'Team 1');

-- ### Tournament Tests ###

-- TEST 1: Manager can create tournament via function
reset role;
-- Add user 1 to team 1 as manager
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 'manager');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select lives_ok(
  $$
  select public.create_tournament_for_team(
    '00000000-0000-0000-0000-0000000000b1',
    'Fall Classic',
    '00000000-0000-0000-0000-0000000000d1',
    '2025-09-01',
    '2025-09-03'
  )
  $$,
  'Manager can create tournament for their team'
);

-- TEST 2: Non-manager cannot create tournament
reset role;
-- Add user 2 to team 1 as scorekeeper
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000b1', 'scorekeeper');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';

select throws_ok(
  $$
  select public.create_tournament_for_team(
    '00000000-0000-0000-0000-0000000000b1',
    'Winter Bash',
    '00000000-0000-0000-0000-0000000000d1',
    '2025-12-01',
    '2025-12-03'
  )
  $$,
  'Permission denied for team 00000000-0000-0000-0000-0000000000b1',
  'Non-manager cannot create tournament for their team'
);

SELECT * FROM finish();
ROLLBACK;
