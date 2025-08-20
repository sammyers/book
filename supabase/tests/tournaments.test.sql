BEGIN;

create extension if not exists pgtap with schema extensions;

SELECT plan(7);

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

-- Create test location
insert into public.location (id, name, city, state, address, created_by_team_id) values
  ('00000000-0000-0000-0000-0000000000c1', 'Central Park', 'New York', 'NY', '123 Central Park West', '00000000-0000-0000-0000-0000000000b1');

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
    '2025-09-03',
    '00000000-0000-0000-0000-0000000000c1'
  )
  $$,
  'Manager can create tournament for their team with location_id only'
);

-- TEST 2: Manager can create tournament with city/state only (no location_id)
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select lives_ok(
  $$
  select public.create_tournament_for_team(
    '00000000-0000-0000-0000-0000000000b1',
    'Winter Bash',
    '00000000-0000-0000-0000-0000000000d1',
    '2025-12-01',
    '2025-12-03',
    null,
    'Chicago',
    'IL'
  )
  $$,
  'Manager can create tournament for their team with city/state only (no location_id)'
);

-- Verify that the tournament created with city/state has null location_id
select results_eq(
  $$select location_id, location_city, location_state from public.tournament where name = 'Winter Bash'$$,
  $$values (null::uuid, 'Chicago'::text, 'IL'::text)$$,
  'Tournament created with city/state has null location_id'
);

-- TEST 3: Function errors when neither location_id nor city/state are provided
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select throws_ok(
  $$
  select public.create_tournament_for_team(
    '00000000-0000-0000-0000-0000000000b1',
    'Spring Classic',
    '00000000-0000-0000-0000-0000000000d1',
    '2026-03-01',
    '2026-03-03'
  )
  $$,
  'Location id or city must be provided',
  'Function errors when neither location_id nor city/state are provided'
);

-- TEST 4: When location_id is provided, city/state arguments are ignored
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select lives_ok(
  $$
  select public.create_tournament_for_team(
    '00000000-0000-0000-0000-0000000000b1',
    'Summer Classic',
    '00000000-0000-0000-0000-0000000000d1',
    '2026-06-01',
    '2026-06-03',
    '00000000-0000-0000-0000-0000000000c1',
    'Ignored City',
    'IG'
  )
  $$,
  'Manager can create tournament with location_id (city/state arguments are ignored)'
);

-- Verify that the tournament uses the location data from the database, not the ignored arguments
select results_eq(
  $$select location_id, location_city, location_state from public.tournament where name = 'Summer Classic'$$,
  $$values ('00000000-0000-0000-0000-0000000000c1'::uuid, null::text, null::text)$$,
  'Tournament created with location_id has null city/state (uses database location data)'
);

-- TEST 5: Non-manager cannot create tournament
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
    'Fall Classic',
    '00000000-0000-0000-0000-0000000000d1',
    '2026-09-01',
    '2026-09-03',
    '00000000-0000-0000-0000-0000000000c1'
  )
  $$,
  'Permission denied for team 00000000-0000-0000-0000-0000000000b1',
  'Non-manager cannot create tournament for their team'
);

SELECT * FROM finish();
ROLLBACK;
