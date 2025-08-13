BEGIN;

create extension if not exists pgtap with schema extensions;

select plan(12);

-- Create test users
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'user1@book.com', '{"firstName": "Greatest", "lastName": "Ever"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'user2@book.com', '{"firstName": "Second", "lastName": "Best"}');

-- Create teams
insert into public.team (id, name) values
  ('00000000-0000-0000-0000-0000000000b1', 'Team 1'),
  ('00000000-0000-0000-0000-0000000000b2', 'Team 2'),
  ('00000000-0000-0000-0000-0000000000b3', 'Team 3');

-- Associate team 2 with team 1
update public.team set associated_team_id = '00000000-0000-0000-0000-0000000000b1' where id = '00000000-0000-0000-0000-0000000000b2';

-- Create test region
insert into public.region (id, name, short_name) values
  ('00000000-0000-0000-0000-0000000000d1', 'Test Region', 'TR');

-- Create tournaments
insert into public.tournament (id, name, start_date, end_date, region_id) values
  ('00000000-0000-0000-0000-0000000000e1', 'Test Tournament', current_date, current_date + 1, '00000000-0000-0000-0000-0000000000d1'),
  ('00000000-0000-0000-0000-0000000000e2', 'Another Tournament', current_date + 7, current_date + 8, '00000000-0000-0000-0000-0000000000d1');

-- Register team 1 in tournament 1
insert into public.tournament_team (team_id, tournament_id)
values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000e1');

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
    current_timestamp
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
    current_timestamp
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
    current_timestamp
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
    current_timestamp
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
    current_date - interval '1 day'
  )
$$, 'Scheduled start time must fall within tournament dates', 'Fails if scheduled time is outside tournament');

-- TEST 6: Successful creation
select lives_ok(
  $$
  select * from public.create_tournament_game_for_team(
    'Game 6',
    '00000000-0000-0000-0000-0000000000e1',
    '00000000-0000-0000-0000-0000000000b1',
    'home',
    '00000000-0000-0000-0000-0000000000b2',
    current_timestamp
  )
  $$,
  'Creates game with valid teams, time, and permissions'
);

-- 6a. Check the game row exists
select results_eq(
  $$select count(*) from public.game where name = 'Game 6'$$,
  ARRAY[1::bigint],
  'Game 6 was inserted into game table'
);

-- 6b. Check creator role
select results_eq(
  $$select role from public.game_team where team_id = '00000000-0000-0000-0000-0000000000b1' and game_id = (
    select id from public.game where name = 'Game 6'
  )$$,
  ARRAY['home'::team_role],
  'Creator team was inserted with correct role'
);

-- 6c. Check opponent role
select results_eq(
  $$select role from public.game_team where team_id = '00000000-0000-0000-0000-0000000000b2' and game_id = (
    select id from public.game where name = 'Game 6'
  )$$,
  ARRAY['away'::team_role],
  'Opponent team was inserted with opposite role'
);

-- 6d. Opponent is auto-added to tournament
select ok(
  exists (
    select 1 from public.tournament_team
    where team_id = '00000000-0000-0000-0000-0000000000b2'
      and tournament_id = '00000000-0000-0000-0000-0000000000e1'
  ),
  'Opponent team was inserted into tournament_team'
);

-- TEST 7: Members can read games for their own team
select results_eq(
  $$select count(*) from public.game where created_by_team_id = '00000000-0000-0000-0000-0000000000b1'$$,
  ARRAY[1::bigint],
  'Team member can read games for their team'
);

-- TEST 8: Members cannot read games for other teams
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';

select results_eq(
  $$select count(*) from public.game where created_by_team_id = '00000000-0000-0000-0000-0000000000b1'$$,
  ARRAY[0::bigint],
  'Team member cannot read games for other teams'
);

select * from finish();
ROLLBACK;
