BEGIN;

create extension if not exists pgtap with schema extensions;

select plan(24);

-- Create test users
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'user1@book.com', '{"firstName": "Greatest", "lastName": "Ever"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'user2@book.com', '{"firstName": "Second", "lastName": "Best"}');

-- Create teams
insert into public.team (id, name) values
  ('00000000-0000-0000-0000-0000000000b1', 'Team 1'),
  ('00000000-0000-0000-0000-0000000000b2', 'Team 2'),
  ('00000000-0000-0000-0000-0000000000b3', 'Team 3'),
  ('00000000-0000-0000-0000-0000000000b4', 'Team 4');

-- Associate team 2 with team 1
update public.team set associated_team_id = '00000000-0000-0000-0000-0000000000b1' where id = '00000000-0000-0000-0000-0000000000b2';

-- Associate team 4 with team 3
update public.team set associated_team_id = '00000000-0000-0000-0000-0000000000b3' where id = '00000000-0000-0000-0000-0000000000b4';

-- Create test region
insert into public.region (id, name, short_name, time_zone) values
  ('00000000-0000-0000-0000-0000000000d1', 'Testing Region', 'TR', 'America/New_York');

-- Create test location
insert into public.location (id, name, city, state, address, created_by_team_id) values
  ('00000000-0000-0000-0000-0000000000c1', 'Central Park', 'New York', 'NY', '123 Central Park West', '00000000-0000-0000-0000-0000000000b1');

-- Create tournaments with fixed dates
insert into public.tournament (id, name, start_date, end_date, region_id, location_id, location_city, location_state) values
  ('00000000-0000-0000-0000-0000000000e1', 'Test Tournament', '2024-01-15', '2024-01-16', '00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1', null, null),
  ('00000000-0000-0000-0000-0000000000e2', 'Another Tournament', '2024-01-22', '2024-01-23', '00000000-0000-0000-0000-0000000000d1', null, 'Chicago', 'IL');

-- Register teams in tournaments
insert into public.tournament_team (team_id, tournament_id) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000e1'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000e2');

-- ### Game Tests ###

-- TEST 1: User lacks permission
reset role;
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 'member');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select throws_ok($$
  select * from public.create_tournament_game_for_team(
    'Game 1',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    '2024-01-15 14:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 1'
  )
$$, 'Permission denied: must be scorekeeper or higher for the creator team', 'Fails if user lacks permission for creator team');

-- Give user 1 'scorekeeper' permission on team 1, should be sufficient
reset role;
update public.user_team set permission_level = 'scorekeeper'
  where user_id = '00000000-0000-0000-0000-0000000000a1'
  and team_id = '00000000-0000-0000-0000-0000000000b1';

-- TEST 2: Same team used for both creator and opponent
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select throws_ok($$
  select * from public.create_tournament_game_for_team(
    'Game 2',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b1',
    '2024-01-15 15:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 1'
  )
$$, 'Opponent team cannot be the same as creator team', 'Fails if opponent is same as creator');

-- TEST 3: Opponent is not associated

select throws_ok($$
  select * from public.create_tournament_game_for_team(
    'Game 3',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    -- Team 3 is not associated with Team 1
    '00000000-0000-0000-0000-0000000000b3',
    '2024-01-15 16:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 1'
  )
$$, 'Opponent team must have creator team as its associated_team_id', 'Fails if opponent not associated');

-- TEST 4: Creator team not in tournament

select throws_ok($$
  select * from public.create_tournament_game_for_team(
    'Game 4',
    -- Team 1 is not registered in tournament 2
    '00000000-0000-0000-0000-0000000000e2',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    '2024-01-22 14:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 1'
  )
$$, 'Creator team must be entered in the tournament', 'Fails if creator team not in tournament');

-- TEST 5: Scheduled time is outside allowed window
select throws_ok($$
  select * from public.create_tournament_game_for_team(
    'Game 5',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    '2024-01-14 14:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 1'
  )
$$, 'Scheduled start time must fall within tournament dates', 'Fails if scheduled time is outside tournament');

-- TEST 6: Successful creation with location
select lives_ok(
  $$
  select * from public.create_tournament_game_for_team(
    'Game 6',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    '2024-01-15 14:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 1'
  )
  $$,
  'Creates game with valid teams, time, and permissions with location'
);

-- 6a. Check the game row exists
select results_eq(
  $$select count(*) from public.game where name = 'Game 6'$$,
  ARRAY[1::bigint],
  'Game 6 was inserted into game table'
);

-- 6b. Check location and field are properly stored
select results_eq(
  $$select location_id, field from public.game where name = 'Game 6'$$,
  $$values ('00000000-0000-0000-0000-0000000000c1'::uuid, 'Field 1'::text)$$,
  'Game 6 location and field are properly stored'
);

-- 6c. Check creator role
select results_eq(
  $$select role from public.game_team where team_id = '00000000-0000-0000-0000-0000000000b1' and game_id = (
    select id from public.game where name = 'Game 6'
  )$$,
  ARRAY['home'::team_role],
  'Creator team was inserted with correct role'
);

-- 6d. Check opponent role
select results_eq(
  $$select role from public.game_team where team_id = '00000000-0000-0000-0000-0000000000b2' and game_id = (
    select id from public.game where name = 'Game 6'
  )$$,
  ARRAY['away'::team_role],
  'Opponent team was inserted with opposite role'
);

-- 6e. Opponent is auto-added to tournament
select ok(
  exists (
    select 1 from public.tournament_team
    where team_id = '00000000-0000-0000-0000-0000000000b2'
      and tournament_id = '00000000-0000-0000-0000-0000000000e1'
  ),
  'Opponent team was inserted into tournament_team'
);

-- TEST 7: Successful creation without location (tournament has location_id)
select lives_ok(
  $$
  select * from public.create_tournament_game_for_team(
    'Game 7',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    '2024-01-15 15:00:00-05'
  )
  $$,
  'Creates game without location when tournament has location_id (uses tournament location)'
);

-- 7a. Check the game without location was created
select results_eq(
  $$select count(*) from public.game where name = 'Game 7'$$,
  ARRAY[1::bigint],
  'Game 7 was inserted into game table'
);

-- 7b. Check that Game 7 uses the tournament's location_id
select results_eq(
  $$select location_id from public.game where name = 'Game 7'$$,
  ARRAY['00000000-0000-0000-0000-0000000000c1'::uuid],
  'Game 7 uses tournament location_id when no game location provided'
);

-- TEST 8: Game creation fails when tournament has no location_id and no game location_id provided
-- User 1 needs scorekeeper permission on Team 3 for this test
reset role;
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b3', 'scorekeeper');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select throws_ok(
  $$
  select * from public.create_tournament_game_for_team(
    'Game 8',
    '00000000-0000-0000-0000-0000000000e2',
    '00000000-0000-0000-0000-0000000000b3',
    'home',
    '00000000-0000-0000-0000-0000000000b4',
    '2024-01-22 14:00:00-05'
  )
  $$,
  'Game location must be specified',
  'Game creation fails when tournament has no location and no game location provided'
);

-- TEST 9: Game creation succeeds when tournament has no location_id but game location_id is provided
-- User 1 already has scorekeeper permission on Team 3 from previous test
select lives_ok(
  $$
  select * from public.create_tournament_game_for_team(
    'Game 9',
    '00000000-0000-0000-0000-0000000000e2',
    '00000000-0000-0000-0000-0000000000b3',
    'home',
    '00000000-0000-0000-0000-0000000000b4',
    '2024-01-22 15:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 2'
  )
  $$,
  'Creates game with location when tournament has no location_id'
);

-- 9a. Check that Game 9 was created with its own location_id
select results_eq(
  $$select count(*) from public.game where name = 'Game 9'$$,
  ARRAY[1::bigint],
  'Game 9 was inserted into game table'
);

-- 9b. Check that Game 9 has the correct location_id
select results_eq(
  $$select location_id from public.game where name = 'Game 9'$$,
  ARRAY['00000000-0000-0000-0000-0000000000c1'::uuid],
  'Game 9 has the correct location_id'
);

-- TEST 10: Game creation succeeds within grace period after tournament ends
-- This tests the 2-hour grace period that allows games to start after midnight
-- Tournament ends on 2024-01-16 in America/New_York timezone
-- 1 AM Eastern on 2024-01-17 is within the 2-hour grace period
select lives_ok(
  $$
  select * from public.create_tournament_game_for_team(
    'Game 10',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    '2024-01-17 01:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 3'
  )
  $$,
  'Creates game within grace period after tournament ends (1am Eastern next day)'
);

-- 10a. Check that Game 10 was created successfully
select results_eq(
  $$select count(*) from public.game where name = 'Game 10'$$,
  ARRAY[1::bigint],
  'Game 10 was inserted into game table within grace period'
);

-- 10b. Check that Game 10 has the correct scheduled start time
select results_eq(
  $$select scheduled_start_time from public.game where name = 'Game 10'$$,
  ARRAY['2024-01-17 01:00:00-05'::timestamp with time zone],
  'Game 10 has the correct scheduled start time within grace period'
);

-- TEST 11: Game creation fails outside grace period after tournament ends
-- 3 AM Eastern on 2024-01-17 is outside the 2-hour grace period
select throws_ok($$
  select * from public.create_tournament_game_for_team(
    'Game 11',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    '2024-01-17 03:00:00-05',
    '00000000-0000-0000-0000-0000000000c1',
    'Field 4'
  )
$$, 'Scheduled start time must fall within tournament dates', 'Fails if scheduled time is outside tournament dates and grace period');

-- TEST 12: Members can read games for their own team
-- User 1 should already be authenticated from previous tests, but let's be explicit
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';

select results_eq(
  $$select count(*) from public.game where created_by_team_id = '00000000-0000-0000-0000-0000000000b1'$$,
  ARRAY[3::bigint],
  'Team member can read games for their team'
);

-- TEST 13: Members cannot read games for other teams
-- User 2 needs to be a member of Team 2 to test RLS properly
reset role;
insert into public.user_team (user_id, team_id, permission_level) values
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000b2', 'member');

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';

select results_eq(
  $$select count(*) from public.game where created_by_team_id = '00000000-0000-0000-0000-0000000000b1'$$,
  ARRAY[0::bigint],
  'Team member cannot read games for other teams'
);

select * from finish();
ROLLBACK;
